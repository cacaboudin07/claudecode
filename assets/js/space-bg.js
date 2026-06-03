/* =====================================================================
   Décolle — Fond spatial animé (shader WebGL plein écran)
   Portage "vanilla" du composant React/Three.js "Animated Shader
   Background" (21st.dev) : aurore cosmique + étoiles filantes en continu.
   Aucune dépendance (WebGL natif). Dégradation propre si indisponible.
   ===================================================================== */
(function () {
  "use strict";

  // Respecte la préférence "réduire les animations" : rendu statique d'une frame.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.id = "space-bg";
  canvas.setAttribute("aria-hidden", "true");
  // inséré au tout début du body pour rester derrière le contenu
  var first = document.body ? document.body.firstChild : null;
  (document.body || document.documentElement).insertBefore(canvas, first);

  // voile de profondeur (lisibilité), posé même si WebGL échoue
  var veil = document.createElement("div");
  veil.className = "space-veil";
  veil.setAttribute("aria-hidden", "true");
  canvas.parentNode.insertBefore(veil, canvas.nextSibling);

  var gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, depth: false })
        || canvas.getContext("experimental-webgl");
  if (!gl) return; // pas de WebGL → on garde le fond CSS sombre

  /* ---- Shaders ---- */
  var VERT = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform float iTime;",
    "uniform vec2 iResolution;",
    "#define NUM_OCTAVES 3",
    "vec4 tanh4(vec4 x){ x = clamp(x, -10.0, 10.0); vec4 e = exp(2.0*x); return (e - 1.0) / (e + 1.0); }",
    "float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }",
    "float noise(vec2 p){",
    "  vec2 ip = floor(p); vec2 u = fract(p); u = u*u*(3.0-2.0*u);",
    "  float res = mix(mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x), mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);",
    "  return res*res;",
    "}",
    "float fbm(vec2 x){",
    "  float v = 0.0; float a = 0.3; vec2 shift = vec2(100.0);",
    "  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));",
    "  for(int i=0;i<NUM_OCTAVES;++i){ v += a*noise(x); x = rot*x*2.0 + shift; a *= 0.4; }",
    "  return v;",
    "}",
    "void main(){",
    "  vec2 shake = vec2(sin(iTime*1.2)*0.005, cos(iTime*2.1)*0.005);",
    "  vec2 p = ((gl_FragCoord.xy + shake*iResolution.xy) - iResolution.xy*0.5) / iResolution.y * mat2(6.0,-4.0,4.0,6.0);",
    "  vec2 v; vec4 o = vec4(0.0);",
    "  float f = 2.0 + fbm(p + vec2(iTime*5.0, 0.0)) * 0.5;",
    "  for(float i=0.0; i<35.0; i++){",
    "    v = p + cos(i*i + (iTime + p.x*0.08)*0.025 + i*vec2(13.0,11.0))*3.5 + vec2(sin(iTime*3.0+i)*0.003, cos(iTime*3.5-i)*0.003);",
    "    float tailNoise = fbm(v + vec2(iTime*0.5, i)) * 0.3 * (1.0 - (i/35.0));",
    "    vec4 auroraColors = vec4(0.1+0.3*sin(i*0.2+iTime*0.4), 0.3+0.5*cos(i*0.3+iTime*0.5), 0.7+0.3*sin(i*0.4+iTime*0.3), 1.0);",
    "    vec4 currentContribution = auroraColors * exp(sin(i*i + iTime*0.8)) / length(max(v, vec2(v.x*f*0.015, v.y*1.5)));",
    "    float thinnessFactor = smoothstep(0.0, 1.0, i/35.0) * 0.6;",
    "    o += currentContribution * (1.0 + tailNoise*0.8) * thinnessFactor;",
    "  }",
    "  o = tanh4(pow(o/100.0, vec4(1.6)));",
    "  gl_FragColor = o * 1.5;",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      // échec de compilation → on abandonne proprement
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // quad plein écran (2 triangles)
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, "iTime");
  var uRes = gl.getUniformLocation(prog, "iResolution");

  // On rend à résolution réduite (fond flou doux) pour la performance.
  var SCALE = 0.62;
  function resize() {
    var w = Math.max(2, Math.floor(window.innerWidth * SCALE));
    var h = Math.max(2, Math.floor(window.innerHeight * SCALE));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  var t = reduce ? 8.0 : 0;
  function frame() {
    t += 0.016;
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
  }
  var raf;
  // première frame (statique si reduced-motion)
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  if (!reduce) {
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
  }
})();

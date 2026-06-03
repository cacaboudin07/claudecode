/* =====================================================================
   Décolle — Hero cinématique "DÉCOLLAGE" (piloté par le scroll)
   Amélioration progressive : sans JS, le hero reste un simple plein-écran.
   Avec JS : compte à rebours → allumage + secousse → fumée → ascension →
   arrivée dans l'espace, puis le titre apparaît.
   ===================================================================== */
(function () {
  "use strict";
  var launch = document.getElementById("launch");
  if (!launch) return;

  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var q = function (s) { return launch.querySelector(s); };
  var sky = q(".launch__sky"), pad = q(".launch__pad"), rocket = q(".launch__rocket"),
      flame = q(".rk-flame"), hud = q(".launch__hud"), count = q(".launch__count"),
      tag = q(".launch__tag"), copy = q(".launch__copy"), cue = q(".launch__cue"),
      smoke = q(".launch__smoke");
  var clouds = Array.prototype.slice.call(launch.querySelectorAll(".cloud"));

  launch.classList.add("js-on");

  // Reduced-motion : on saute la chorégraphie, on montre l'état final.
  if (reduce) { if (copy) copy.style.opacity = "1"; return; }

  html.classList.add("js-launch");
  if (copy) { copy.style.opacity = "0"; copy.style.pointerEvents = "none"; }

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };

  /* ---- Fumée (particules canvas) ---- */
  var sctx = smoke && smoke.getContext ? smoke.getContext("2d") : null;
  var parts = [], sw = 0, sh = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function smokeResize() {
    if (!sctx) return;
    sw = smoke.clientWidth; sh = smoke.clientHeight;
    smoke.width = sw * dpr; smoke.height = sh * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawnSmoke(intensity) {
    if (!sctx) return;
    var n = Math.round(intensity * 7);
    for (var k = 0; k < n; k++) {
      parts.push({
        x: sw * 0.5 + (Math.random() - 0.5) * (70 + intensity * 150),
        y: sh - 50 + Math.random() * 26,
        r: 14 + Math.random() * 34, vx: (Math.random() - 0.5) * 1.5,
        vy: -(0.3 + Math.random() * 1.3), life: 1,
        fade: 0.004 + Math.random() * 0.01, grow: 0.3 + Math.random() * 0.6
      });
    }
    if (parts.length > 560) parts.splice(0, parts.length - 560);
  }
  function drawSmoke() {
    if (!sctx) return;
    sctx.clearRect(0, 0, sw, sh);
    for (var i = parts.length - 1; i >= 0; i--) {
      var pt = parts[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.vy *= 0.99; pt.r += pt.grow; pt.life -= pt.fade;
      if (pt.life <= 0) { parts.splice(i, 1); continue; }
      var a = pt.life * 0.5;
      var g = sctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r);
      g.addColorStop(0, "rgba(232,228,248," + (a * 0.9) + ")");
      g.addColorStop(1, "rgba(176,170,205,0)");
      sctx.fillStyle = g; sctx.beginPath(); sctx.arc(pt.x, pt.y, pt.r, 0, 6.2832); sctx.fill();
    }
  }

  /* ---- Mesures & scroll ---- */
  var vh = window.innerHeight, total = 1;
  function measure() { vh = window.innerHeight; total = Math.max(1, launch.offsetHeight - vh); smokeResize(); }
  measure();
  window.addEventListener("resize", measure);

  var p = 0, targetP = 0, running = false, raf;
  function onScroll() { targetP = clamp((window.scrollY || window.pageYOffset) / total, 0, 1); kick(); }
  window.addEventListener("scroll", onScroll, { passive: true });

  var liftStart = 0.16, inSpace = 0.82;

  function render() {
    p += (targetP - p) * 0.12;

    if (sky) sky.style.opacity = (1 - smooth(0.32, 0.72, p)).toFixed(3);

    for (var c = 0; c < clouds.length; c++) {
      var depth = 0.6 + (c % 3) * 0.5;
      clouds[c].style.transform = "translateY(" + (smooth(0.05, 0.8, p) * vh * depth * 1.4).toFixed(1) + "px)";
      clouds[c].style.opacity = (1 - smooth(0.45, 0.78, p)).toFixed(2);
    }

    var rise = ease(clamp((p - liftStart) / (inSpace - liftStart), 0, 1));
    var ry = -rise * vh * 1.55, rscale = 1 - 0.62 * rise;
    var shake = (p > liftStart - 0.02 && p < 0.34) ? (1 - smooth(liftStart, 0.34, p)) * 6 : 0;
    var sx = shake ? (Math.random() - 0.5) * shake : 0, syk = shake ? (Math.random() - 0.5) * shake : 0;
    // le sol/portique restent (légère secousse) ; seule la fusée s'élève
    if (pad) pad.style.transform = "translateX(-50%) translate(" + sx.toFixed(1) + "px," + syk.toFixed(1) + "px)";
    if (rocket) rocket.style.transform = "translateX(-50%) translate(0," + ry.toFixed(1) + "px) scale(" + rscale.toFixed(3) + ")";

    var flameOn = smooth(liftStart - 0.02, liftStart + 0.08, p) * (1 - smooth(inSpace, 0.98, p));
    if (flame) flame.style.transform = "scaleY(" + (flameOn * 2.0).toFixed(2) + ")";

    if (p > liftStart - 0.01 && p < 0.62) spawnSmoke(0.4 + (1 - smooth(liftStart, 0.5, p)));
    drawSmoke();

    if (hud) {
      if (p < liftStart) {
        var c10 = Math.max(0, Math.ceil((1 - p / liftStart) * 10));
        count.textContent = "T-" + (c10 < 10 ? "0" : "") + c10;
        tag.textContent = "Séquence de pré-lancement";
        hud.style.opacity = "1";
      } else if (p < 0.26) {
        count.textContent = "DÉCOLLAGE";
        tag.textContent = "Allumage des moteurs";
        hud.style.opacity = (1 - smooth(0.21, 0.26, p)).toFixed(2);
      } else { hud.style.opacity = "0"; }
    }

    var co = smooth(0.78, 0.96, p);
    if (copy) {
      copy.style.opacity = co.toFixed(2);
      copy.style.transform = "translateY(" + ((1 - co) * 40).toFixed(1) + "px)";
      copy.style.pointerEvents = co > 0.5 ? "auto" : "none";
    }
    if (cue) cue.style.opacity = (1 - smooth(0, 0.08, p)).toFixed(2);

    // Arrêt quand stabilisé (économie CPU) ; relance au scroll.
    var settled = Math.abs(targetP - p) < 0.001 && parts.length === 0 && (p < 0.002 || p > 0.998);
    if (settled || document.hidden) { running = false; return; }
    raf = requestAnimationFrame(render);
  }
  function kick() { if (!running) { running = true; raf = requestAnimationFrame(render); } }

  onScroll();
  kick();
})();

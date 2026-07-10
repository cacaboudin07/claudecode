/* =====================================================================
   Décolle — FX : transitions de page, 3D tilt, magnétisme, parallaxe,
   barre de progression, champ d'étoiles. Aucune dépendance.
   Tout est protégé : si une fonctionnalité n'est pas dispo, on l'ignore.
   ===================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = !window.matchMedia || window.matchMedia("(pointer: fine)").matches;

  /* ---------------- 1. Transition de page "décollage" -------------- */
  var pt = document.getElementById("pt");

  function navigate(href) {
    if (reduce || !pt) { window.location.href = href; return; }
    pt.classList.add("is-cover");
    setTimeout(function () { window.location.href = href; }, 480);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

    var url;
    try { url = new URL(href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return; // lien externe : on laisse faire

    // même page → simple défilement vers l'ancre
    if (url.pathname === window.location.pathname) {
      if (url.hash && url.hash.length > 1) {
        var target = document.getElementById(url.hash.slice(1));
        if (target) {
          e.preventDefault();
          if (target.scrollIntoView) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
          if (history.pushState) history.pushState(null, "", url.hash);
        }
      }
      return;
    }
    // autre page du site → transition animée
    e.preventDefault();
    navigate(url.href);
  });

  // Si on revient via le bouton "précédent" (page restaurée du cache), réafficher
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && pt) { pt.classList.remove("is-cover"); }
  });

  /* ---------------- 2. Barre de progression de défilement ---------- */
  (function () {
    var wrap = document.createElement("div");
    wrap.className = "scroll-prog";
    var inner = document.createElement("i");
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      inner.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  })();

  /* ---------------- 3. Cartes 3D (tilt + brillance) ---------------- */
  if (fine && !reduce) {
    var tiltSel = ".card, .tool, .channel, .step, .video, .res, .stat";
    document.querySelectorAll(tiltSel).forEach(function (el) {
      el.classList.add("tilt");
      var shine = document.createElement("span");
      shine.className = "tilt__shine";
      el.appendChild(shine);

      el.addEventListener("pointermove", function (ev) {
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width;   // 0..1
        var py = (ev.clientY - r.top) / r.height;   // 0..1
        var max = 9;
        var ry = (px - 0.5) * 2 * max;              // rotateY
        var rx = (0.5 - py) * 2 * max;              // rotateX
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-6px)";
        el.style.boxShadow = (-ry / 2) + "px " + (rx / 2 + 18) + "px 48px -18px rgba(40,30,90,.45)";
        shine.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        shine.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        el.classList.add("is-tilting");
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
        el.style.boxShadow = "";
        el.classList.remove("is-tilting");
      });
    });
  }

  /* ---------------- 4. Boutons magnétiques ------------------------- */
  if (fine && !reduce) {
    document.querySelectorAll(".btn--lg, .nav__cta").forEach(function (btn) {
      btn.classList.add("mag");
      btn.addEventListener("pointermove", function (ev) {
        var r = btn.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / r.width;
        var y = (ev.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = "translate(" + (x * 10).toFixed(1) + "px," + (y * 8).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------------- 5. Parallaxe du hero (scène 3D + lueur) -------- */
  var hero = document.querySelector(".hero");
  if (hero && fine && !reduce) {
    var sceneTilt = document.getElementById("sceneTilt");
    var spot = hero.querySelector(".hero__spot");
    var glows = hero.querySelectorAll(".hero__glow");
    hero.addEventListener("pointermove", function (ev) {
      var r = hero.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
      var y = (ev.clientY - r.top) / r.height - 0.5;
      if (sceneTilt) {
        sceneTilt.style.setProperty("--rx", (x * 26).toFixed(2) + "deg");
        sceneTilt.style.setProperty("--ry", (-y * 20).toFixed(2) + "deg");
      }
      if (spot) { spot.style.left = (ev.clientX - r.left) + "px"; spot.style.top = (ev.clientY - r.top) + "px"; }
      glows.forEach(function (g, i) {
        var k = (i + 1) * 14;
        g.style.transform = "translate(" + (x * k).toFixed(1) + "px," + (y * k).toFixed(1) + "px)";
      });
    });
    hero.addEventListener("pointerleave", function () {
      if (sceneTilt) { sceneTilt.style.setProperty("--rx", "0deg"); sceneTilt.style.setProperty("--ry", "0deg"); }
    });
  }

  /* ---------------- 6. Champ d'étoiles (canvas) -------------------- */
  (function () {
    if (reduce) return;
    var host = document.querySelector(".hero .hero__bg, .page-hero .hero__bg");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.className = "starfield";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return; // pas de canvas (ex. très vieux navigateur) → on laisse les étoiles CSS

    var stars = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mx = 0, my = 0;

    function resize() {
      var r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(150, Math.round(w * h / 9000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2,            // profondeur 0.2..1
          r: Math.random() * 1.3 + 0.3,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    var host2 = hero || document.querySelector(".page-hero");
    if (host2) host2.addEventListener("pointermove", function (ev) {
      var r = host2.getBoundingClientRect();
      mx = (ev.clientX - r.left) / r.width - 0.5;
      my = (ev.clientY - r.top) / r.height - 0.5;
    });

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.y += s.z * 0.12;                          // lente dérive vers le bas
        if (s.y > h + 2) { s.y = -2; s.x = Math.random() * w; }
        var ox = mx * s.z * 26, oy = my * s.z * 18;  // parallaxe souris
        var a = 0.45 + Math.sin(s.tw + t * 1.6) * 0.35;
        ctx.globalAlpha = Math.max(0, a) * s.z;
        ctx.beginPath();
        ctx.arc(s.x + ox, s.y + oy, s.r * s.z + 0.2, 0, 6.2832);
        ctx.fillStyle = i % 7 === 0 ? "#8fb4ff" : "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    var raf;
    resize();
    window.addEventListener("resize", resize);
    draw();
    // par sécurité : couper l'animation quand l'onglet est caché
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(draw); }
    });
  })();
})();

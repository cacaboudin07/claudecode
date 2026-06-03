/* =====================================================================
   Décolle — Scripts partagés (navigation, animations, vidéos)
   Aucune dépendance externe.
   ===================================================================== */
(function () {
  "use strict";

  /* ---- 1. Ombre de la barre de navigation au scroll --------------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- 2. Menu mobile --------------------------------------------- */
  var burger = document.querySelector(".nav__burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Refermer au clic sur un lien
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- 3. Révélation au scroll ------------------------------------ */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- 4. Compteurs animés ---------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  var animateCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-decimals") | 0);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + Number(val).toLocaleString("fr-FR") + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString("fr-FR") + suffix;
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io2.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- 4b. Barres de données (remplissage au scroll) ------------- */
  var bars = document.querySelectorAll(".bar-fill[data-w]");
  if (bars.length && "IntersectionObserver" in window) {
    var ioBars = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.width = e.target.getAttribute("data-w"); ioBars.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (el) { ioBars.observe(el); });
  } else {
    bars.forEach(function (el) { el.style.width = el.getAttribute("data-w"); });
  }

  /* ---- 5. Vidéos YouTube "lite" (clic pour charger) --------------- */
  document.querySelectorAll(".lyt").forEach(function (el) {
    var id = el.getAttribute("data-yt");
    if (!id) return;
    el.style.backgroundImage =
      "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    var load = function () {
      if (el.querySelector("iframe")) return;
      var ifr = document.createElement("iframe");
      ifr.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      ifr.setAttribute("allowfullscreen", "");
      ifr.setAttribute("title", el.getAttribute("data-title") || "Vidéo YouTube");
      ifr.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      el.innerHTML = "";
      el.appendChild(ifr);
    };
    el.addEventListener("click", load);
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); load(); }
    });
  });

  /* ---- 6. Newsletter (démo, sans backend) ------------------------- */
  document.querySelectorAll("form[data-news]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var btn = form.querySelector("button");
      if (input && input.value.indexOf("@") > 0) {
        btn.textContent = "Inscrit ✓";
        btn.disabled = true;
        input.value = "";
        input.placeholder = "Merci, à très vite !";
        setTimeout(function () { btn.textContent = "S'inscrire"; btn.disabled = false; }, 2600);
      } else if (input) {
        input.focus();
      }
    });
  });

  /* ---- 7. Année dynamique du footer ------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

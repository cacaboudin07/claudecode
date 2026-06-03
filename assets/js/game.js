/* =====================================================================
   Décolle — Simulateur "Lance ton premier produit digital"
   Jeu pédagogique : chaque choix influe sur le trafic, la conversion
   et le chiffre d'affaires. Modèle volontairement simplifié.
   Aucune dépendance externe.
   ===================================================================== */
(function () {
  "use strict";

  /* ----------------------------- Données ------------------------------ */
  var PRODUCTS = [
    { id: "ebook",     emoji: "📘", name: "Ebook / Guide PDF",        desc: "Le plus simple à créer : une fois écrit, tu le vends à l'infini.", baseConv: 0.045, idealPrice: 25,  minP: 9,  maxP: 59 },
    { id: "formation", emoji: "🎥", name: "Mini-formation vidéo",     desc: "Plus de valeur perçue, donc un prix plus élevé possible.",          baseConv: 0.030, idealPrice: 90,  minP: 39, maxP: 199 },
    { id: "template",  emoji: "🧩", name: "Templates & ressources",   desc: "Notion, Canva, tableurs… un gain de temps prêt à l'emploi.",        baseConv: 0.050, idealPrice: 29,  minP: 9,  maxP: 79 },
    { id: "atelier",   emoji: "🎟️", name: "Atelier / Coaching",       desc: "Accompagnement premium : plus rare, mais très rentable.",           baseConv: 0.022, idealPrice: 120, minP: 49, maxP: 199 }
  ];

  var AUDIENCES = [
    { id: "entrepreneurs", emoji: "🚀", name: "Entrepreneurs débutants",          desc: "Motivés et prêts à investir pour réussir.", reach: 1.00, power: 1.10 },
    { id: "creatifs",      emoji: "🎨", name: "Créatifs & photographes",          desc: "Veulent vivre de leur passion.",            reach: 0.90, power: 0.85 },
    { id: "etudiants",     emoji: "🎓", name: "Étudiants & reconversion",         desc: "Très nombreux, mais budget serré.",         reach: 1.15, power: 0.60 },
    { id: "bienetre",      emoji: "🧘", name: "Bien-être & développement perso",  desc: "Marché vaste et très fidèle.",              reach: 1.05, power: 0.95 }
  ];

  var CHANNELS = [
    { id: "social", emoji: "📱", name: "Réseaux sociaux",   sub: "(organique)",  desc: "Gratuit et gros volume, mais demande de la régularité.",     volume: 1.20, quality: 0.95, costPerVisitor: 0 },
    { id: "seo",    emoji: "🔍", name: "SEO / Blog",         sub: "",            desc: "Lent à construire, mais un trafic très qualifié et durable.", volume: 0.80, quality: 1.20, costPerVisitor: 0 },
    { id: "email",  emoji: "✉️", name: "Email & communauté", sub: "",            desc: "Moins de monde, mais de loin la meilleure conversion.",       volume: 0.55, quality: 1.50, costPerVisitor: 0 },
    { id: "ads",    emoji: "💸", name: "Publicité payante",  sub: "(Ads)",       desc: "Résultats immédiats, mais chaque visiteur a un coût.",        volume: 1.35, quality: 1.00, costPerVisitor: 0.45 }
  ];

  var HOOKS = [
    { id: "transfo",   emoji: "✨", name: "La transformation",     text: "« De débutant à ton premier client en 30 jours »", mult: 1.18, type: "good", tip: "Vendre un résultat concret et désirable : l'accroche la plus puissante qui soit." },
    { id: "rapidite",  emoji: "⚡", name: "La rapidité",           text: "« Lance ton produit ce week-end, sans expérience »", mult: 1.10, type: "good", tip: "La promesse de rapidité lève le frein du « je n'ai pas le temps »." },
    { id: "prix",      emoji: "🏷️", name: "Le petit prix",         text: "« Tout ce qu'il te faut pour moins qu'un resto »",   mult: 1.04, type: "info", tip: "Efficace, mais attention à ne pas dévaloriser ton offre en ne parlant que du prix." },
    { id: "generique", emoji: "📦", name: "La description neutre", text: "« Une formation de marketing digital »",            mult: 0.85, type: "warn", tip: "Trop vague : sans bénéfice clair ni émotion, on ne clique pas. À éviter." }
  ];

  var CHOICE_KEYS = ["product", "audience", "price", "channel", "hook"];
  var STEP_LABEL = ["Briefing", "1 / 5 · Produit", "2 / 5 · Audience", "3 / 5 · Prix", "4 / 5 · Canal", "5 / 5 · Accroche", "Lancement", "Résultats"];
  var STEP_PROGRESS = [0, 12, 30, 50, 70, 90, 100, 100];

  /* ------------------------------ État -------------------------------- */
  var state = { step: 0, product: null, audience: null, price: null, channel: null, hook: null, result: null };

  /* --------------------------- Raccourcis ----------------------------- */
  var stage = document.getElementById("stage");
  var bar = document.getElementById("bar");
  var stepLabel = document.getElementById("stepLabel");
  var fuelEl = document.getElementById("fuel");
  var confettiEl = document.getElementById("confetti");

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function eur(n) { return Math.round(n).toLocaleString("fr-FR") + " €"; }
  function num(n) { return Math.round(n).toLocaleString("fr-FR"); }

  /* --------------------- Mise à jour de la barre ---------------------- */
  function paint() {
    bar.style.width = STEP_PROGRESS[state.step] + "%";
    stepLabel.textContent = STEP_LABEL[state.step];

    // étages de carburant + journal de bord
    CHOICE_KEYS.forEach(function (key, i) {
      var row = fuelEl.querySelector('[data-fuel="' + key + '"]');
      row.classList.toggle("done", state.step > i + 1 || (state.step >= 6));
      row.classList.toggle("active", state.step === i + 1);
    });
    setLog("product",  state.product  ? byId(PRODUCTS, state.product).name   : null);
    setLog("audience", state.audience ? byId(AUDIENCES, state.audience).name : null);
    setLog("price",    state.price != null ? eur(state.price) : null);
    setLog("channel",  state.channel  ? byId(CHANNELS, state.channel).name   : null);
    setLog("hook",     state.hook     ? byId(HOOKS, state.hook).name          : null);
  }
  function setLog(key, val) {
    var el = document.querySelector('[data-log="' + key + '"]');
    if (!el) return;
    if (val) { el.textContent = val; el.classList.remove("empty"); }
    else { el.textContent = "À définir"; el.classList.add("empty"); }
  }

  /* ----------------------------- Navigation --------------------------- */
  function go(step) {
    state.step = step;
    render();
    paint();
    // remonter en haut du jeu sur petit écran
    if (window.innerWidth < 900) {
      var top = document.querySelector(".sim__main");
      if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
  }

  /* ----------------------------- Rendu -------------------------------- */
  function render() {
    switch (state.step) {
      case 0: return renderIntro();
      case 1: return renderChoice("product", PRODUCTS, "Étape 1 · Le produit", "Que veux-tu vendre&nbsp;?", "Choisis le type de produit digital de ton premier lancement. Le plus simple pour débuter reste l'ebook.");
      case 2: return renderChoice("audience", AUDIENCES, "Étape 2 · L'audience", "À qui t'adresses-tu&nbsp;?", "Une niche précise convertit toujours mieux qu'un public « pour tout le monde ». À qui veux-tu parler&nbsp;?");
      case 3: return renderPrice();
      case 4: return renderChoice("channel", CHANNELS, "Étape 4 · Le canal", "Comment vas-tu attirer du monde&nbsp;?", "Chaque canal a son volume et sa qualité de trafic. Lequel utilises-tu pour ce lancement&nbsp;?");
      case 5: return renderChoice("hook", HOOKS, "Étape 5 · L'accroche", "Quelle est ta promesse&nbsp;?", "Ton accroche est la première chose que les gens lisent. Elle peut multiplier (ou diviser) tes ventes.");
      case 6: return renderLaunch();
      case 7: return renderResults();
    }
  }

  /* --- Écran d'intro --- */
  function renderIntro() {
    stage.innerHTML =
      '<div class="intro">' +
        '<div class="intro__badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2c3 1.7 5 5.2 5 9.2 0 2.7-.7 5-1.8 7L12 25l-3.2-6.8C7.7 16.2 7 13.9 7 11.2 7 7.2 9 3.7 12 2Z"/><circle cx="12" cy="10" r="2.2"/><path d="M8 18c-2 1-3 3-3 5 2 0 4-1 5-3M16 18c2 1 3 3 3 5-2 0-4-1-5-3"/></svg></div>' +
        '<h2>Bienvenue, commandant 👩‍🚀</h2>' +
        '<p>Tu vas lancer ton tout premier produit digital. En 5 décisions simples, tu verras comment chaque choix influence ton trafic, ta conversion et ton chiffre d\'affaires. Prêt pour le décollage&nbsp;?</p>' +
        '<div class="intro__meta"><span>⏱️ 5 minutes</span><span>🎮 100 % interactif</span><span>🧠 Pour apprendre</span></div>' +
        '<button class="btn btn--primary btn--lg" id="startBtn">Démarrer la mission →</button>' +
      '</div>';
    document.getElementById("startBtn").addEventListener("click", function () { go(1); });
  }

  /* --- Écran de choix générique (cartes) --- */
  function renderChoice(key, data, eyebrow, title, help) {
    var cards = data.map(function (o) {
      var sel = state[key] === o.id;
      var sub = o.sub ? ' <span style="color:var(--muted);font-weight:400">' + o.sub + "</span>" : "";
      return (
        '<button class="opt' + (sel ? " is-selected" : "") + '" data-pick="' + o.id + '" type="button">' +
          '<span class="opt__emoji">' + o.emoji + "</span>" +
          "<span>" +
            '<span class="opt__name">' + o.name + sub + "</span>" +
            '<span class="opt__desc">' + o.desc + "</span>" +
          "</span>" +
          '<span class="opt__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        "</button>"
      );
    }).join("");

    stage.innerHTML =
      '<div class="q-eyebrow">' + eyebrow + "</div>" +
      '<h2 class="q-title">' + title + "</h2>" +
      '<p class="q-help">' + help + "</p>" +
      '<div class="opts">' + cards + "</div>" +
      navHTML(state[key] != null);

    stage.querySelectorAll("[data-pick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state[key] = btn.getAttribute("data-pick");
        render(); paint();
      });
    });
    wireNav();
  }

  /* --- Écran prix (curseur) --- */
  function renderPrice() {
    var p = byId(PRODUCTS, state.product);
    if (state.price == null || state.price < p.minP || state.price > p.maxP) state.price = p.idealPrice;

    stage.innerHTML =
      '<div class="q-eyebrow">Étape 3 · Le prix</div>' +
      '<h2 class="q-title">À quel prix&nbsp;?</h2>' +
      '<p class="q-help">Le prix est un curseur magique : trop cher, tu vends moins ; trop bas, tu laisses de l\'argent sur la table. Trouve le bon équilibre pour ton audience.</p>' +
      '<div class="price-box">' +
        '<div class="price-val"><span id="priceVal">' + state.price + "</span><small>€</small></div>" +
        '<input class="range" id="priceRange" type="range" min="' + p.minP + '" max="' + p.maxP + '" step="1" value="' + state.price + '" aria-label="Prix en euros" />' +
        '<div class="range-scale"><span>' + p.minP + ' €</span><span>' + p.maxP + ' €</span></div>' +
        '<div class="price-hint" id="priceHint"></div>' +
      "</div>" +
      navHTML(true);

    var range = document.getElementById("priceRange");
    var updateHint = function () {
      state.price = parseInt(range.value, 10);
      document.getElementById("priceVal").textContent = state.price;
      document.getElementById("priceHint").innerHTML = priceHint();
      setLog("price", eur(state.price));
    };
    range.addEventListener("input", updateHint);
    updateHint();
    wireNav();
  }

  function priceHint() {
    var p = byId(PRODUCTS, state.product), a = byId(AUDIENCES, state.audience);
    var powerAdj = (state.price / p.idealPrice) / a.power;
    if (powerAdj >= 1.45) return "💸 Plutôt cher pour cette audience : moins de ventes, mais une plus grosse marge sur chacune.";
    if (powerAdj <= 0.72) return "🤑 Très accessible : beaucoup de ventes possibles, mais un petit panier. Idéal pour se faire connaître.";
    return "✅ Bon équilibre entre le prix et la valeur perçue par ton audience.";
  }

  /* --- Écran de lancement (pad de tir) --- */
  function renderLaunch() {
    var p = byId(PRODUCTS, state.product), a = byId(AUDIENCES, state.audience),
        c = byId(CHANNELS, state.channel), h = byId(HOOKS, state.hook);

    stage.innerHTML =
      '<div class="launch">' +
        '<div class="q-eyebrow" style="text-align:center">Tout est prêt</div>' +
        "<h2>Récapitulatif de la mission</h2>" +
        '<p>Vérifie ton plan de vol, puis lance ton produit&nbsp;!</p>' +
        '<div class="card" style="text-align:left;margin:18px 0 6px">' +
          recapRow("📦", "Produit", p.emoji + " " + p.name) +
          recapRow("🎯", "Audience", a.emoji + " " + a.name) +
          recapRow("💶", "Prix", eur(state.price)) +
          recapRow("📡", "Canal d'acquisition", c.emoji + " " + c.name) +
          recapRow("🎤", "Accroche", h.name, true) +
        "</div>" +
        '<div class="pad" id="pad">' +
          '<div class="pad__ground"></div>' +
          '<div class="pad__flame"></div>' +
          '<div class="pad__rocket">' + rocketSVG() + "</div>" +
        "</div>" +
        '<div class="countdown" id="cd"></div>' +
        '<button class="btn btn--primary btn--lg" id="launchBtn">🚀 LANCER MON PRODUIT</button>' +
        '<div style="margin-top:14px"><button class="btn btn--nav" id="backBtn" type="button">← Modifier mes choix</button></div>' +
      "</div>";

    document.getElementById("launchBtn").addEventListener("click", doLaunch);
    document.getElementById("backBtn").addEventListener("click", function () { go(5); });
  }
  function recapRow(emoji, label, val, last) {
    return '<div class="log__row" style="border-color:var(--line)' + (last ? ";border-bottom:0" : "") + '">' +
      '<span style="color:var(--muted)">' + emoji + " " + label + "</span>" +
      '<b style="color:var(--ink);text-align:right">' + val + "</b></div>";
  }

  /* --- Séquence de décollage --- */
  function doLaunch() {
    var pad = document.getElementById("pad");
    var btn = document.getElementById("launchBtn");
    var cd = document.getElementById("cd");
    btn.disabled = true; btn.style.opacity = ".5"; btn.style.pointerEvents = "none";
    cd.style.opacity = "1"; cd.style.height = "auto"; cd.style.margin = "4px 0 10px";

    var n = 3;
    cd.textContent = n;
    var timer = setInterval(function () {
      n--;
      if (n > 0) { cd.textContent = n; }
      else {
        clearInterval(timer);
        cd.textContent = "DÉCOLLAGE !";
        pad.classList.add("is-launching");
        burst(70); setTimeout(function () { burst(50); }, 280);
        setTimeout(function () { go(7); }, 1500);
      }
    }, 520);
  }

  /* --- Écran de résultats --- */
  function renderResults() {
    var r = state.result || (state.result = simulate());
    var g = gradeFor(r.net);
    var fb = feedback(r);

    stage.innerHTML =
      '<div class="results">' +
        '<div class="grade ' + g.k + '">' +
          '<div class="grade__badge">' + g.badge + "</div>" +
          "<div><h2>" + g.title + '</h2><p>' + g.msg + "</p></div>" +
        "</div>" +

        '<div class="metrics">' +
          metric("v", num(0), "Visiteurs attirés") +
          metric("c", "0 %", "Taux de conversion") +
          metric("s", num(0), "Ventes réalisées") +
          metric("r", "0 €", "Revenu net", true) +
        "</div>" +

        (r.adCost > 0
          ? '<p style="color:var(--muted);font-size:.88rem;margin:-10px 0 22px;text-align:center">Dont ' + eur(r.adCost) + " de budget publicitaire dépensé pour attirer ces visiteurs.</p>"
          : '<p style="color:var(--muted);font-size:.88rem;margin:-10px 0 22px;text-align:center">Trafic 100 % gratuit (organique) : aucun budget publicitaire dépensé.</p>') +

        "<h3>Ton entonnoir de vente</h3>" +
        '<div class="funnel" style="margin:0 auto 28px">' +
          '<div class="funnel__row r1"><span class="lbl">👀 Visiteurs</span><span class="val">' + num(r.visitors) + "</span></div>" +
          '<div class="funnel__row r3"><span class="lbl">🧲 Ont vu l\'offre</span><span class="val">' + num(Math.round(r.visitors * 0.45)) + "</span></div>" +
          '<div class="funnel__row r5"><span class="lbl">🛒 Ont acheté</span><span class="val">' + num(r.sales) + "</span></div>" +
        "</div>" +

        "<h3>Le débrief de ton lancement</h3>" +
        '<div class="feedback">' + fb + "</div>" +

        '<div class="results__actions">' +
          '<button class="btn btn--primary" id="replayBtn">↻ Relancer une mission</button>' +
          '<a class="btn btn--light" href="guide.html">📚 Approfondir avec le guide</a>' +
          '<a class="btn btn--nav" href="index.html#fonctionnement">Comprendre la formule</a>' +
        "</div>" +
      "</div>";

    // compteurs animés
    animateValue(document.querySelector('[data-m="v"]'), r.visitors, { });
    animateValue(document.querySelector('[data-m="c"]'), r.conv * 100, { decimals: 1, suffix: " %" });
    animateValue(document.querySelector('[data-m="s"]'), r.sales, { });
    animateValue(document.querySelector('[data-m="r"]'), r.net, { suffix: " €" });

    document.getElementById("replayBtn").addEventListener("click", reset);
  }

  function metric(m, val, label, hl) {
    return '<div class="metric"><div class="metric__num' + (hl ? " hl" : "") + '" data-m="' + m + '">' + val + '</div><div class="metric__label">' + label + "</div></div>";
  }

  /* ------------------------- Moteur de calcul ------------------------- */
  function simulate() {
    var p = byId(PRODUCTS, state.product), a = byId(AUDIENCES, state.audience),
        c = byId(CHANNELS, state.channel), h = byId(HOOKS, state.hook), price = state.price;

    var visitors = Math.round(1500 * c.volume * a.reach * (0.9 + Math.random() * 0.2));
    var powerAdj = (price / p.idealPrice) / a.power;            // >1 = cher pour l'audience
    var priceFit = clamp(1 + (1 - powerAdj) * 0.5, 0.35, 1.25);
    var conv = p.baseConv * c.quality * priceFit * h.mult * (0.92 + Math.random() * 0.16);
    conv = clamp(conv, 0.004, 0.14);

    var sales = Math.max(0, Math.round(visitors * conv));
    var gross = sales * price;
    var adCost = Math.round(visitors * c.costPerVisitor);
    var net = gross - adCost;

    return { p: p, a: a, c: c, h: h, price: price, visitors: visitors, conv: conv, sales: sales, gross: gross, adCost: adCost, net: net, powerAdj: powerAdj };
  }

  function gradeFor(net) {
    if (net >= 3500) return { k: "s", badge: "S", title: "Décollage parfait ! 🌟", msg: "Trajectoire idéale. Tes choix forment une combinaison redoutable — c'est exactement comme ça qu'on vise la lune." };
    if (net >= 1800) return { k: "a", badge: "A", title: "Belle trajectoire ! 🚀", msg: "Très bon lancement. Quelques réglages et tu passes au niveau supérieur. Continue d'optimiser." };
    if (net >= 600)  return { k: "b", badge: "B", title: "En orbite 🛰️", msg: "Ça décolle ! Tu as des ventes. Repère le levier le plus faible et rejoue pour l'améliorer." };
    if (net >= 1)    return { k: "c", badge: "C", title: "Premier contact 📡", msg: "C'est un début : tu as tes toutes premières ventes. Le plus dur est fait — maintenant, on optimise." };
    return { k: "d", badge: "!", title: "Rentrée atmosphérique 🪂", msg: "Aïe, le lancement n'a pas été rentable cette fois. Pas de panique : analyse le débrief ci-dessous et rejoue." };
  }

  /* ------------------------ Feedback personnalisé --------------------- */
  function feedback(r) {
    var items = [];

    // Canal
    if (r.c.id === "email") items.push(fb("good", "Le canal star", "L'email & la communauté, c'est le canal qui <b>convertit le mieux</b>. Excellent choix pour rentabiliser un premier lancement."));
    else if (r.c.id === "seo") items.push(fb("info", "Trafic de qualité", "Le SEO amène un trafic <b>très qualifié et durable</b>, mais il met des mois à monter en puissance. La patience paie."));
    else if (r.c.id === "social") items.push(fb("info", "Le jeu du volume", "Les réseaux sociaux t'apportent <b>beaucoup de visiteurs</b>. La clé pour transformer : publier régulièrement et créer du lien."));
    else items.push(fb(r.adCost > r.gross ? "warn" : "good", "Croissance accélérée", "La publicité a coûté <b>" + eur(r.adCost) + "</b> pour ce trafic. Pratique pour aller vite, mais surveille toujours que chaque euro investi en rapporte plus."));

    // Prix / audience
    if (r.powerAdj >= 1.45) items.push(fb("warn", "Prix élevé pour cette cible", "Ton prix est <b>haut</b> pour cette audience : tu vends à moins de monde, mais chaque vente rapporte davantage. Assure-toi que la valeur perçue suit."));
    else if (r.powerAdj <= 0.72) items.push(fb("info", "Offre très accessible", "Prix <b>très bas</b> : tu maximises le nombre de ventes mais le panier est petit. Pense à proposer une offre complémentaire plus chère ensuite."));
    else items.push(fb("good", "Prix bien calibré", "Ton prix est <b>bien aligné</b> avec le pouvoir d'achat de ton audience. Joli équilibre entre volume et marge."));

    // Accroche
    items.push(fb(r.h.type, "Ton accroche", r.h.tip));

    // Rappel pédagogique
    items.push(fb("info", "La formule à retenir", "<b>CA = Trafic × Taux de conversion × Prix.</b> Améliore un seul de ces leviers, puis relance pour mesurer l'effet de ton changement."));

    return items.join("");
  }
  function fb(type, title, text) {
    var ico = type === "good"
      ? '<path d="M20 6 9 17l-5-5"/>'
      : type === "warn"
      ? '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>'
      : '<path d="M12 16v-5M12 8h.01"/><circle cx="12" cy="12" r="9"/>';
    return '<div class="fb ' + type + '"><span class="fb__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ico + '</svg></span><div><b>' + title + "</b><br>" + text + "</div></div>";
  }

  /* ----------------------- Boutons de navigation ---------------------- */
  function navHTML(canContinue) {
    var back = state.step > 1
      ? '<button class="btn btn--nav" id="prevBtn" type="button">← Précédent</button>'
      : '<button class="btn btn--nav" id="prevBtn" type="button">← Briefing</button>';
    var nextLabel = state.step === 5 ? "Vers le lancement →" : "Continuer →";
    var next = '<button class="btn btn--primary" id="nextBtn"' + (canContinue ? "" : " disabled") + ">" + nextLabel + "</button>";
    return '<div class="sim__nav">' + back + next + "</div>";
  }
  function wireNav() {
    var prev = document.getElementById("prevBtn");
    var next = document.getElementById("nextBtn");
    if (prev) prev.addEventListener("click", function () { go(state.step - 1); });
    if (next) next.addEventListener("click", function () { if (!next.hasAttribute("disabled")) go(state.step + 1); });
  }

  /* ------------------------------ Confettis --------------------------- */
  function burst(count) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var colors = ["#ee4422", "#f4b13a", "#0f7d6b", "#62e0c4", "#cf3417", "#ffd9a0"];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var piece = document.createElement("i");
      var size = 6 + Math.random() * 8;
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[(Math.random() * colors.length) | 0];
      piece.style.width = size + "px";
      piece.style.height = size * 1.4 + "px";
      piece.style.opacity = "0";
      piece.style.animationDuration = (2.4 + Math.random() * 2.2) + "s";
      piece.style.animationDelay = (Math.random() * 0.4) + "s";
      piece.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      frag.appendChild(piece);
    }
    confettiEl.appendChild(frag);
    setTimeout(function () { confettiEl.innerHTML = ""; }, 5200);
  }

  /* --------------------- Compteurs animés (résultats) ----------------- */
  function animateValue(el, target, opts) {
    if (!el) return;
    opts = opts || {};
    var decimals = opts.decimals || 0, suffix = opts.suffix || "", dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("fr-FR")) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (decimals ? target.toFixed(decimals) : Math.round(target).toLocaleString("fr-FR")) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------ Reset ------------------------------- */
  function reset() {
    state = { step: 0, product: null, audience: null, price: null, channel: null, hook: null, result: null };
    go(0);
  }

  function rocketSVG() {
    return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="rk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8f3e9"/><stop offset="0.5" stop-color="#f4b13a"/><stop offset="1" stop-color="#ee4422"/></linearGradient></defs>' +
      '<path d="M50 6c16 9 24 24 24 42 0 13-3 24-8 33a11 11 0 0 1-32 0c-5-9-8-20-8-33C26 30 34 15 50 6Z" fill="url(#rk)"/>' +
      '<circle cx="50" cy="46" r="10" fill="#17120e"/><circle cx="50" cy="46" r="5" fill="#62e0c4"/>' +
      '<path d="M30 84c-9 3-15 12-15 24 9-2 15-6 19-13Z" fill="#cf3417"/>' +
      '<path d="M70 84c9 3 15 12 15 24-9-2-15-6-19-13Z" fill="#cf3417"/>' +
      '<path d="M40 96c6 4 14 4 20 0" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      "</svg>";
  }

  /* ------------------------------ Démarrage --------------------------- */
  render();
  paint();
})();

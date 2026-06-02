// --- Menu burger (mobile) ---
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("is-open");
});

// Ferme le menu mobile au clic sur un lien
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("is-open"));
});

// --- Effet de scroll sur la nav ---
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("nav--scrolled", window.scrollY > 30);
});

// --- Apparition des éléments au scroll ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

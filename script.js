(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* ---------- Theme toggle (remembers choice) ---------- */
  const themeBtn = document.querySelector(".theme-toggle");
  const setTheme = (t) => {
    root.dataset.theme = t;
    themeBtn.firstElementChild.textContent = t === "dark" ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", `Switch to ${t === "dark" ? "light" : "dark"} theme`);
  };
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  setTheme(saved || "dark");
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  const closeMenu = () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) { closeMenu(); toggle.focus(); }
  });

  /* ---------- Highlight current section in the nav ---------- */
  const navLinks = [...links.querySelectorAll("a")];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === "#" + entry.target.id;
        a.classList.toggle("active", on);
        on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Typing effect in hero ---------- */
  const typed = document.getElementById("typed");
  if (typed && !reduceMotion) {
    const words = JSON.parse(typed.dataset.words);
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 55 : 95;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      else { i += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1800);
  }

  /* ---------- YouTube: load the player only when clicked ---------- */
  document.querySelectorAll(".video").forEach((box) => {
    const id = box.dataset.video;
    const title = box.dataset.title;
    box.style.backgroundImage = `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Play video: ${title}`);
    btn.innerHTML = '<span class="play"></span>';
    btn.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = title;
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      box.replaceChildren(frame);
    });
    box.appendChild(btn);
  });

  /* ---------- Hide images that are missing ---------- */
  document.querySelectorAll(".shot, .avatar img").forEach((img) => {
    const hide = () => { img.style.display = "none"; };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ---------- Copy email ---------- */
  const status = document.getElementById("copy-status");
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
        btn.classList.add("done");
        status.textContent = "Email address copied";
      } catch (e) {
        status.textContent = "Copy failed. Select the email address and copy it manually.";
      }
      setTimeout(() => { btn.textContent = "Copy email"; btn.classList.remove("done"); }, 2000);
    });
  });

  /* ---------- Back to top + footer year ---------- */
  const toTop = document.querySelector(".to-top");
  window.addEventListener("scroll", () => { toTop.hidden = window.scrollY < 600; }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  document.getElementById("year").textContent = new Date().getFullYear();
})();

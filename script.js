(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Theme toggle */
  const themeToggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const storedTheme = (() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  })();
  if (storedTheme === "light" || storedTheme === "dark") {
    root.setAttribute("data-theme", storedTheme);
  }
  const applyThemePressedState = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    themeToggle?.setAttribute("aria-pressed", String(isLight));
  };
  applyThemePressedState();
  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable; theme still applies for this session */
    }
    applyThemePressedState();
  });

  /* Header scroll state */
  const header = document.querySelector(".site-header");
  const backToTop = document.getElementById("back-to-top");
  const onScroll = () => {
    const scrolled = window.scrollY > 10;
    header?.classList.toggle("is-scrolled", scrolled);
    backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* Mobile nav */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const setMenuOpen = (open) => {
    mobileNav?.setAttribute("data-state", open ? "open" : "closed");
    menuToggle?.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuToggle?.addEventListener("click", () => {
    const isOpen = mobileNav?.getAttribute("data-state") === "open";
    setMenuOpen(!isOpen);
  });
  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  /* Scrollspy for nav links */
  const navLinks = document.querySelectorAll(".primary-nav a");
  const sections = Array.from(document.querySelectorAll("main .section, .hero"));
  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => section.id && spy.observe(section));
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Experience accordion */
  document.querySelectorAll(".timeline-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".timeline-item");
      if (!item) return;
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* Magnetic buttons */
  if (!prefersReducedMotion && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      let frame = null;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
        });
      });
      btn.addEventListener("mouseleave", () => {
        if (frame) cancelAnimationFrame(frame);
        btn.style.transform = "";
      });
    });
  }

  /* Copy email */
  const copyBtn = document.getElementById("copy-email");
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.getAttribute("data-email") || "";
    const label = copyBtn.querySelector(".copy-label");
    const iconCopy = copyBtn.querySelector(".icon-copy");
    const iconCheck = copyBtn.querySelector(".icon-check");
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    const originalText = label?.textContent;
    if (label) label.textContent = "Copied to clipboard";
    iconCopy?.setAttribute("hidden", "");
    iconCheck?.removeAttribute("hidden");
    window.setTimeout(() => {
      if (label && originalText) label.textContent = originalText;
      iconCheck?.setAttribute("hidden", "");
      iconCopy?.removeAttribute("hidden");
    }, 2000);
  });

  /* Hero portrait portal */
  const photoTrigger = document.querySelector(".hero-photo-trigger");
  const photoBackdrop = document.querySelector(".hero-photo-backdrop");
  if (photoTrigger && photoBackdrop) {
    const setPhotoOpen = (open) => {
      photoTrigger.classList.toggle("is-open", open);
      photoBackdrop.classList.toggle("is-open", open);
      photoTrigger.setAttribute("aria-expanded", String(open));
    };
    photoTrigger.addEventListener("click", () => {
      setPhotoOpen(!photoTrigger.classList.contains("is-open"));
    });
    photoBackdrop.addEventListener("click", () => setPhotoOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setPhotoOpen(false);
    });
  }
})();

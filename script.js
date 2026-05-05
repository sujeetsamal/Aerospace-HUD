(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const initIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "aria-hidden": "true"
        }
      });
    }
  };

  const initProfileFallback = () => {
    const photo = document.getElementById("profile-photo");
    const placeholder = document.getElementById("profile-placeholder");
    if (!photo || !placeholder) return;

    photo.addEventListener("error", () => {
      if (photo.dataset.fallbackSrc) {
        const fallbackSource = photo.dataset.fallbackSrc;
        photo.dataset.fallbackSrc = "";
        photo.src = fallbackSource;
        return;
      }

      photo.style.display = "none";
      placeholder.style.display = "grid";
    });
  };

  const typeLine = async (element, text) => {
    element.textContent = "";
    element.classList.add("typing");

    if (reducedMotion) {
      element.textContent = text;
      element.classList.remove("typing");
      return;
    }

    for (const character of text) {
      element.textContent += character;
      await sleep(character === " " ? 16 : 34);
    }

    element.classList.remove("typing");
    await sleep(260);
  };

  const initBootSequence = async () => {
    const typedElements = [...document.querySelectorAll("[data-type]")];
    const facts = document.getElementById("system-facts");

    if (!typedElements.length) {
      facts?.classList.add("visible");
      return;
    }

    await sleep(reducedMotion ? 0 : 420);

    for (const element of typedElements) {
      await typeLine(element, element.dataset.type || "");
    }

    await sleep(reducedMotion ? 0 : 320);
    facts?.classList.add("visible");
  };

  const initMobileNav = () => {
    const toggle = document.querySelector(".nav-toggle");
    const close = document.querySelector(".mobile-close");
    const menu = document.getElementById("mobile-menu");
    const links = menu ? [...menu.querySelectorAll("a")] : [];

    if (!toggle || !menu) return;

    const setOpen = (isOpen) => {
      menu.classList.toggle("open", isOpen);
      menu.setAttribute("aria-hidden", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
    close?.addEventListener("click", () => setOpen(false));
    links.forEach((link) => link.addEventListener("click", () => setOpen(false)));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  };

  const initRevealObserver = () => {
    const revealItems = [...document.querySelectorAll(".reveal")];

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.15
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  const initActiveNav = () => {
    const sections = [...document.querySelectorAll("main section[id]")];
    const navLinks = [...document.querySelectorAll(".nav-links a, .mobile-menu a")];

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: "-42% 0px -45% 0px",
        threshold: [0.08, 0.2, 0.42]
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const initStarfield = () => {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const stars = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const createStars = () => {
      stars.length = 0;
      const area = width * height;
      const count = Math.min(180, Math.max(70, Math.floor(area / 13500)));

      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.35 + 0.25,
          speed: Math.random() * 0.18 + 0.045,
          alpha: Math.random() * 0.72 + 0.2
        });
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      createStars();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(224, 244, 255, ${star.alpha})`;
        context.fill();

        star.y += star.speed;
        star.x += star.speed * 0.16;

        if (star.y > height + 4) {
          star.y = -4;
          star.x = Math.random() * width;
        }
        if (star.x > width + 4) {
          star.x = -4;
        }
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      draw();
    } else {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(224, 244, 255, ${star.alpha})`;
        context.fill();
      });
    }

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(animationFrame);
    });
  };

  const initRadarBlips = () => {
    const radar = document.getElementById("radar");
    if (!radar) return;

    const blips = [...radar.querySelectorAll(".radar-blip")];

    const placeBlip = (blip) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 42;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      blip.style.left = `${x}%`;
      blip.style.top = `${y}%`;
      blip.style.animationDelay = `${Math.random() * 1.6}s`;
    };

    blips.forEach(placeBlip);

    if (!reducedMotion) {
      window.setInterval(() => {
        const target = blips[Math.floor(Math.random() * blips.length)];
        if (target) placeBlip(target);
      }, 1700);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initProfileFallback();
    initMobileNav();
    initRevealObserver();
    initActiveNav();
    initStarfield();
    initRadarBlips();
    
    // Wait for intro to complete, then start boot sequence
    if (document.getElementById("intro-overlay")) {
      document.addEventListener("introComplete", () => {
        initBootSequence();
      });
    } else {
      // If no intro overlay, run boot sequence immediately
      initBootSequence();
    }
  });
})();

/* CardioFAD: progressive enhancement of the Nerfies publication layout. */
(() => {
  "use strict";
  const config = window.CARDIOFAD || {};
  const dialog = document.getElementById("figure-dialog");
  const expanded = document.getElementById("expanded-figure");

  for (const [id, url] of [["paper-link", config.paperUrl], ["arxiv-link", config.arxivUrl]]) {
    if (!url || !url.trim()) continue;
    const link = document.getElementById(id);
    link.href = url.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.remove("unavailable");
    link.removeAttribute("aria-disabled");
    link.removeAttribute("tabindex");
    link.removeAttribute("title");
  }
  if (config.limaScholarUrl && config.limaScholarUrl.trim()) {
    const author = document.getElementById("lima-scholar");
    author.href = config.limaScholarUrl.trim();
    author.title = "Joao A. C. Lima on Google Scholar";
  }

  document.querySelectorAll("[data-image]").forEach(slot => {
    const src = config.images?.[slot.dataset.image]?.trim();
    if (!src) return;
    const img = new Image();
    img.alt = slot.dataset.alt;
    img.decoding = "async";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "figure-open";
    button.setAttribute("aria-label", `Expand ${img.alt}`);
    button.addEventListener("click", () => {
      expanded.src = img.src;
      expanded.alt = img.alt;
      dialog.showModal();
    });
    img.addEventListener("load", () => {
      button.append(img);
      slot.replaceChildren(button);
      slot.classList.add("has-media");
    }, { once: true });
    img.addEventListener("error", () => slot.classList.add("load-error"), { once: true });
    img.src = src;
  });

  document.querySelectorAll("[data-video]").forEach(slot => {
    const example = config.videos?.[slot.dataset.video]?.[Number(slot.dataset.example)];
    const src = example?.[slot.dataset.side]?.trim();
    if (!src) return;
    const placeholder = slot.firstElementChild;
    const video = document.createElement("video");
    video.controls = true;
    video.autoplay = true;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-label", slot.dataset.alt);
    video.addEventListener("error", () => {
      slot.replaceChildren(placeholder);
      slot.classList.remove("has-media");
      slot.classList.add("load-error");
    }, { once: true });
    video.src = src;
    slot.replaceChildren(video);
    slot.classList.add("has-media");
    // Start offscreen examples too; keep native controls if the browser blocks playback.
    video.play().catch(() => {});
  });

  const carouselElement = document.getElementById("qualitative-carousel");
  if (carouselElement && window.bulmaCarousel) {
    // Match the referenced template, with one slide at every width and manual playback.
    const [carousel] = window.bulmaCarousel.attach("#qualitative-carousel", {
      slidesToScroll: 1,
      slidesToShow: 1,
      loop: true,
      infinite: false,
      autoplay: false,
      navigation: true,
      navigationKeys: false,
      pagination: true,
      breakpoints: [],
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300
    });
    const slider = carouselElement.querySelector(".slider");
    const slides = [...carouselElement.querySelectorAll(".slider-item")];
    const status = document.getElementById("qualitative-status");
    const enhancedButtons = new WeakSet();
    const makeButton = (element, label) => {
      if (enhancedButtons.has(element)) return;
      enhancedButtons.add(element);
      element.setAttribute("role", "button");
      element.setAttribute("tabindex", "0");
      element.setAttribute("aria-label", label);
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          element.click();
        }
      });
    };
    const syncSlideAccessibility = () => {
      // Bulma Carousel rebuilds pagination when the browser is resized.
      makeButton(carouselElement.querySelector(".slider-navigation-previous"), "Previous qualitative result");
      makeButton(carouselElement.querySelector(".slider-navigation-next"), "Next qualitative result");
      const pages = [...carouselElement.querySelectorAll(".slider-page")];
      const activeIndex = ((carousel.state.next % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.setAttribute("aria-hidden", String(!active));
        slide.inert = !active;
      });
      pages.forEach((page, index) => {
        makeButton(page, `Show qualitative result ${index + 1} of ${slides.length}`);
        page.classList.toggle("is-active", index === activeIndex);
        if (index === activeIndex) page.setAttribute("aria-current", "true");
        else page.removeAttribute("aria-current");
      });
      status.textContent = `${activeIndex + 1} of ${slides.length}: ${slides[activeIndex].querySelector("figcaption").textContent}`;
    };
    carousel.on("show", syncSlideAccessibility);
    carousel.on("transition:end", syncSlideAccessibility);
    syncSlideAccessibility();
    let carouselWidth = carouselElement.getBoundingClientRect().width;
    const refreshAfterResize = () => requestAnimationFrame(() => {
      const width = carouselElement.getBoundingClientRect().width;
      if (Math.abs(width - carouselWidth) > 0.5) {
        carouselWidth = width;
        // The upstream library only recalculates sizes when its breakpoint changes.
        // Keep a single slide at all widths and preserve the currently selected image.
        carousel.options.initialSlide = ((carousel.state.next % slides.length) + slides.length) % slides.length;
        slider.querySelectorAll(".slider-navigation,.slider-navigation-previous,.slider-navigation-next,.slider-pagination").forEach(control => control.remove());
        carousel.reset();
      }
      syncSlideAccessibility();
    });
    window.addEventListener("resize", refreshAfterResize);
    window.addEventListener("orientationchange", refreshAfterResize);
    if ("ResizeObserver" in window) new ResizeObserver(refreshAfterResize).observe(carouselElement);
    slider.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (event.key === "ArrowLeft") carousel.previous();
      else carousel.next();
    });
    // Preserve click-to-expand while preventing a swipe from opening the figure.
    let pointerStart;
    let wasDragged = false;
    carouselElement.addEventListener("pointerdown", event => {
      pointerStart = { x: event.clientX, y: event.clientY };
      wasDragged = false;
    });
    carouselElement.addEventListener("pointermove", event => {
      if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) wasDragged = true;
    });
    carouselElement.addEventListener("pointerup", () => { pointerStart = null; });
    carouselElement.addEventListener("pointercancel", () => { pointerStart = null; });
    carouselElement.addEventListener("click", event => {
      if (wasDragged && event.target.closest(".figure-open")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  const bibtex = (config.bibtex || "").trim();
  document.getElementById("bibtex-code").textContent = bibtex;

  document.getElementById("close-figure").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => expanded.removeAttribute("src"));

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    // The native #top link uses the page's smooth / reduced-motion scrolling.
    const syncBackToTop = () => backToTop.classList.toggle("is-inactive", window.scrollY <= 700);
    window.addEventListener("scroll", syncBackToTop, { passive: true });
    syncBackToTop();
  }

  if ("IntersectionObserver" in window) {
    const links = [...document.querySelectorAll(".nav-links a")];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-15% 0px -65% 0px" });
    links.forEach(link => observer.observe(document.querySelector(link.hash)));
  }
})();

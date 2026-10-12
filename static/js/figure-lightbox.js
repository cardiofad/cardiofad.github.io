/* Shared image interaction, matching the VolumeProbe figure lightbox. */
(() => {
  "use strict";
  const main = document.querySelector("main");
  const dialog = document.getElementById("figure-dialog");
  if (!main || !dialog || typeof dialog.showModal !== "function") return;

  const media = dialog.querySelector(".figure-lightbox-media");
  const caption = dialog.querySelector(".figure-lightbox-caption");
  const content = dialog.querySelector(".figure-lightbox-content");
  const closeButton = dialog.querySelector(".figure-lightbox-close");
  let lastTrigger = null;

  const imageLabel = image => image.alt || image.closest(".intro-demo-media")?.getAttribute("aria-label") || "figure";
  const openFigure = (image, trigger) => {
    if (dialog.open || !image.complete || !image.naturalWidth) return;
    // Snapshot the selected slice/keyframe even if the demo continues playing.
    const enlarged = new Image();
    enlarged.id = "expanded-figure";
    enlarged.alt = imageLabel(image);
    let width = image.naturalWidth;
    const keyframePreview = image.closest(".cmr-keyframe-preview");
    if (image.matches(".cmr-preview-sprite")) {
      // The preview uses a horizontal sprite sheet; enlarge only its visible frame.
      const style = getComputedStyle(keyframePreview);
      const count = Number(style.getPropertyValue("--keyframe-count"));
      const index = Number(style.getPropertyValue("--keyframe-index"));
      const canvas = document.createElement("canvas");
      width = image.naturalWidth / count;
      canvas.width = width;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, index * width, 0, width, image.naturalHeight, 0, 0, width, image.naturalHeight);
      enlarged.src = canvas.toDataURL("image/png");
    } else {
      enlarged.src = image.currentSrc || image.src;
    }
    const scale = Math.max(1, 512 / Math.max(width, image.naturalHeight));
    enlarged.style.width = `${Math.round(width * scale)}px`;
    media.replaceChildren(enlarged);

    const figure = image.closest("figure");
    const originalCaption = figure?.querySelector("figcaption");
    const demo = image.closest(".intro-demo-card");
    const panel = image.closest(".cmr-observed-panel");
    if (keyframePreview) {
      caption.textContent = `${image.closest("[data-modality]")?.dataset.modality.toUpperCase()} · ${image.alt}`;
    } else if (demo || panel) {
      const modality = image.closest("[data-modality]")?.dataset.modality.toUpperCase();
      const title = originalCaption?.textContent || panel?.querySelector(".video-label")?.textContent;
      const details = figure?.querySelector(".intro-demo-input-meta, .intro-demo-keyframe-readout") || panel?.querySelector(".cmr-observed-meta");
      const detailText = details && (details.children.length
        ? [...details.children].map(node => node.textContent.trim()).join(" · ")
        : details.textContent.trim());
      const slice = figure?.matches(".intro-demo-keyframes") && demo?.querySelector(".intro-demo-slice-control output");
      caption.textContent = [modality, title, detailText || image.alt, slice && `Slice ${slice.textContent}`].filter(Boolean).join(" · ");
    } else if (originalCaption) {
      caption.replaceChildren(...[...originalCaption.childNodes].map(node => node.cloneNode(true)));
    } else {
      caption.textContent = enlarged.alt;
    }
    caption.hidden = !caption.textContent.trim();
    lastTrigger = trigger;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--figure-scrollbar-gap", `${scrollbarGap}px`);
    document.documentElement.classList.add("figure-lightbox-open");
    dialog.showModal();
    dialog.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
  };

  const enhanceImage = image => {
    if (!main.contains(image) || !image.complete || !image.naturalWidth) return;
    let trigger = image.closest(".figure-open");
    if (!trigger) {
      if (image.closest("button, a")) return;
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "figure-open";
      image.replaceWith(trigger);
      trigger.append(image);
    }
    trigger.setAttribute("aria-label", `Enlarge ${imageLabel(image)}`);
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", dialog.id);
  };
  const enhanceTree = node => {
    if (!(node instanceof Element)) return;
    if (node.matches("img")) enhanceImage(node);
    node.querySelectorAll("img").forEach(enhanceImage);
  };
  document.addEventListener("load", event => {
    if (event.target instanceof HTMLImageElement) enhanceImage(event.target);
  }, true);
  // Observed inputs load off-DOM and are replaced when their slice changes.
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === "attributes") enhanceImage(record.target);
      else record.addedNodes.forEach(enhanceTree);
    });
  }).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt"] });
  enhanceTree(main);
  main.addEventListener("click", event => {
    const trigger = event.target.closest(".figure-open");
    const image = trigger?.querySelector("img");
    if (image) openFigure(image, trigger);
  });

  closeButton.addEventListener("click", () => dialog.close());
  let startedOnBackdrop = false;
  const isBackdrop = target => target === dialog || target === content;
  dialog.addEventListener("pointerdown", event => {
    // Leave an underlying keyframe preview open so focus can return to its image.
    event.stopPropagation();
    startedOnBackdrop = isBackdrop(event.target);
  });
  dialog.addEventListener("click", event => {
    if (startedOnBackdrop && isBackdrop(event.target)) dialog.close();
    startedOnBackdrop = false;
  });
  dialog.addEventListener("keydown", event => {
    // Do not let the timeline's Escape listener cancel the native dialog close.
    if (event.key === "Escape") event.stopPropagation();
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button:not(:disabled), a[href], [tabindex='0']")]
      .filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if ((!event.shiftKey && document.activeElement === last) ||
        (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("figure-lightbox-open");
    document.documentElement.style.removeProperty("--figure-scrollbar-gap");
    media.replaceChildren();
    caption.replaceChildren();
    lastTrigger?.focus({ preventScroll: true });
    lastTrigger = null;
  });
})();

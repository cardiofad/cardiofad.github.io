/* Frame-position markers and independent, lossless thumbnail previews. */
(() => {
  "use strict";
  let activePreview = null;
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  document.addEventListener("pointerdown", event => {
    if (activePreview && !activePreview.card.contains(event.target)) activePreview.close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activePreview) {
      event.preventDefault();
      activePreview.close(true);
    }
  });

  window.createCardioFADKeyframeTimeline = ({ card, timeInput, data, observedFrame, modality, exampleIndex, slice, sliceCount, minSlice, maxSlice, onSelect, onSliceChange }) => {
    const { indices, frameCount, directory } = data;
    const name = modality.toUpperCase();
    const context = `${name} example ${exampleIndex + 1}`;
    const position = frame => frame / (frameCount - 1) * 100;
    const playback = timeInput.parentElement;
    const timeline = make("div", "cmr-keyframe-timeline");
    timeInput.replaceWith(timeline);
    timeInput.classList.add("cmr-keyframe-seek");
    timeInput.max = String(frameCount - 1);
    timeInput.step = "1";
    timeline.append(timeInput);
    const rail = make("div", "cmr-keyframe-rail");
    rail.setAttribute("role", "group");
    rail.setAttribute("aria-label", `${context}: keyframes`);
    timeline.append(rail);
    if (Number.isInteger(observedFrame)) {
      const observed = make("span", "cmr-observed-marker");
      observed.style.left = `${position(observedFrame)}%`;
      observed.setAttribute("role", "img");
      observed.setAttribute("aria-label", `Observed input: frame ${observedFrame + 1} of ${frameCount}`);
      observed.title = `Observed input · Frame ${observedFrame + 1} / ${frameCount}`;
      rail.append(observed);
    }

    const preview = make("div", "cmr-keyframe-preview");
    preview.id = `keyframe-preview-${modality}-${exampleIndex}`;
    preview.hidden = true;
    preview.setAttribute("role", "group");
    preview.setAttribute("aria-label", `${context}: keyframe preview`);
    preview.style.setProperty("--keyframe-count", indices.length);
    const closeButton = make("button", "cmr-preview-close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", `Close keyframe preview in ${context}`);
    const content = make("div", "cmr-preview-content");
    const pair = make("div", "cmr-preview-pair");
    const images = ["Ground truth", "CardioFAD"].map((label, side) => {
      const figure = make("figure", "cmr-preview-side");
      const caption = make("figcaption", side ? "cmr-preview-generated" : "", label);
      const viewport = make("div", "cmr-preview-frame");
      const image = make("img", "cmr-preview-sprite");
      image.decoding = "async";
      viewport.append(image);
      figure.append(caption, viewport);
      pair.append(figure);
      return image;
    });
    content.append(pair);
    let previewSliceInput;
    let previewSliceValue;
    if (slice !== null) {
      preview.classList.add("cmr-keyframe-preview--cmr");
      const control = make("div", "cmr-preview-slice-control");
      const label = make("label", "cmr-slice-label", "Slice");
      previewSliceInput = make("input", "cmr-slice-slider cmr-preview-slice-slider");
      previewSliceInput.type = "range";
      previewSliceInput.id = `cmr-preview-slice-${exampleIndex}`;
      previewSliceInput.min = String(minSlice);
      previewSliceInput.max = String(maxSlice);
      previewSliceInput.step = "1";
      previewSliceInput.setAttribute("aria-label", `${context}: preview slice position`);
      previewSliceInput.setAttribute("aria-orientation", "vertical");
      label.htmlFor = previewSliceInput.id;
      previewSliceValue = make("output", "cmr-slice-value cmr-preview-slice-value");
      previewSliceValue.htmlFor = previewSliceInput.id;
      control.append(label, previewSliceInput, previewSliceValue);
      content.append(control);
      previewSliceInput.addEventListener("input", () => onSliceChange(Number(previewSliceInput.value)));
      previewSliceInput.addEventListener("change", () => onSliceChange(Number(previewSliceInput.value), true));
    }
    const caption = make("p", "cmr-preview-caption");
    const status = make("p", "cmr-preview-status");
    status.setAttribute("role", "status");
    preview.append(closeButton, content, caption, status);
    playback.append(preview);

    let depth = slice;
    let openIndex = null;
    let selectedIndex = null;
    let pinnedIndex = null;
    let hoveredIndex = null;
    let overPreview = false;
    let suppressFocus = false;
    let dismissed = false;
    let closeTimer = 0;
    const buttons = [];
    const updateSliceControl = () => {
      if (!previewSliceInput) return;
      previewSliceInput.value = String(depth);
      previewSliceInput.setAttribute("aria-valuetext", `Slice ${depth + 1} of ${sliceCount}`);
      const progress = maxSlice > minSlice ? (depth - minSlice) / (maxSlice - minSlice) * 100 : 0;
      previewSliceInput.style.setProperty("--range-progress", `${progress}%`);
      previewSliceValue.textContent = `${depth + 1} / ${sliceCount}`;
    };
    const frameLabel = index => `Keyframe ${index + 1} / ${indices.length} · Frame ${indices[index] + 1} / ${frameCount}${depth !== null ? ` · Slice ${depth + 1} / ${sliceCount}` : ""}`;
    const updateMarkers = () => buttons.forEach((button, index) => {
      button.setAttribute("aria-expanded", String(openIndex === index));
      button.setAttribute("aria-pressed", String(selectedIndex === index));
      button.classList.toggle("is-selected", selectedIndex === index);
    });
    const positionPreview = () => {
      const trackWidth = rail.getBoundingClientRect().width;
      buttons.forEach((button, index) => {
        const gap = Math.min(index ? indices[index] - indices[index - 1] : Infinity,
          index < indices.length - 1 ? indices[index + 1] - indices[index] : Infinity);
        button.style.width = `${Math.max(4, Math.min(24, gap / (frameCount - 1) * trackWidth))}px`;
      });
      if (openIndex === null) return;
      if (window.matchMedia("(max-width: 760px)").matches) return;
      preview.style.maxWidth = `${Math.max(1, card.clientWidth - 24)}px`;
      const cardRect = card.getBoundingClientRect();
      const playbackRect = playback.getBoundingClientRect();
      const markerRect = buttons[openIndex].getBoundingClientRect();
      const width = preview.getBoundingClientRect().width;
      const sliceControl = card.querySelector(".cmr-slice-control");
      const right = sliceControl ? sliceControl.getBoundingClientRect().left - 8 : cardRect.right - 10;
      const min = cardRect.left + 10 - playbackRect.left;
      const max = right - playbackRect.left - width;
      const left = markerRect.left + markerRect.width / 2 - playbackRect.left - width / 2;
      preview.style.left = `${Math.max(min, Math.min(max, left))}px`;
    };
    const refreshImageState = () => {
      if (images.every(image => image.complete && image.naturalWidth > 0)) {
        preview.removeAttribute("data-loading");
        preview.setAttribute("aria-busy", "false");
        status.textContent = "";
      }
    };
    images.forEach(image => {
      image.addEventListener("load", refreshImageState);
      image.addEventListener("error", () => {
        preview.setAttribute("aria-busy", "false");
        status.textContent = "Preview unavailable.";
      });
    });
    const updatePreview = () => {
      if (openIndex === null) return;
      const label = frameLabel(openIndex);
      caption.textContent = label;
      preview.style.setProperty("--keyframe-index", openIndex);
      const prefix = depth !== null ? `depth_${String(depth).padStart(2, "0")}_` : "";
      const sources = ["GT", "Synthetic"].map(side => `${directory}/${prefix}${side}.png`);
      if (images.some((image, side) => image.getAttribute("src") !== sources[side])) {
        preview.dataset.loading = "true";
        preview.setAttribute("aria-busy", "true");
        status.textContent = "Loading preview…";
        images.forEach((image, side) => { image.src = sources[side]; });
      }
      images.forEach((image, side) => { image.alt = `${side ? "CardioFAD" : "Ground truth"}: ${label}`; });
      refreshImageState();
      positionPreview();
    };
    const showPreview = index => {
      clearTimeout(closeTimer);
      dismissed = false;
      if (activePreview && activePreview !== controller) activePreview.close();
      activePreview = controller;
      openIndex = index;
      preview.hidden = false;
      updateMarkers();
      updatePreview();
    };
    const close = (returnFocus = false) => {
      clearTimeout(closeTimer);
      const trigger = openIndex !== null ? buttons[openIndex] : null;
      const focusWasInside = preview.contains(document.activeElement);
      openIndex = null;
      pinnedIndex = null;
      hoveredIndex = null;
      overPreview = false;
      dismissed = true;
      preview.hidden = true;
      updateMarkers();
      if (activePreview === controller) activePreview = null;
      if (returnFocus && focusWasInside && trigger) {
        suppressFocus = true;
        trigger.focus({ preventScroll: true });
      }
    };
    const scheduleClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (dismissed) return;
        if (overPreview || hoveredIndex !== null || preview.contains(document.activeElement)) return;
        const focused = buttons.indexOf(document.activeElement);
        if (focused >= 0) showPreview(focused);
        else if (pinnedIndex !== null) showPreview(pinnedIndex);
        else close();
      }, 180);
    };
    indices.forEach((frame, index) => {
      const button = make("button", "cmr-keyframe-marker");
      button.type = "button";
      button.dataset.frame = String(frame);
      button.style.left = `${position(frame)}%`;
      button.setAttribute("aria-label", `${context}: keyframe ${index + 1} of ${indices.length}, frame ${frame + 1} of ${frameCount}`);
      button.setAttribute("aria-controls", preview.id);
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("pointerenter", event => {
        if (event.pointerType === "touch") return;
        hoveredIndex = index;
        showPreview(index);
      });
      button.addEventListener("pointerleave", () => { hoveredIndex = null; scheduleClose(); });
      button.addEventListener("focus", () => {
        if (suppressFocus) suppressFocus = false;
        else showPreview(index);
      });
      button.addEventListener("blur", scheduleClose);
      button.addEventListener("click", () => {
        selectedIndex = pinnedIndex = index;
        showPreview(index);
        onSelect(frame);
      });
      button.addEventListener("keydown", event => {
        const next = event.key === "ArrowLeft" ? Math.max(0, index - 1)
          : event.key === "ArrowRight" ? Math.min(indices.length - 1, index + 1)
          : event.key === "Home" ? 0 : event.key === "End" ? indices.length - 1 : null;
        if (next !== null) {
          event.preventDefault();
          buttons[next].focus();
        }
      });
      buttons.push(button);
      rail.append(button);
    });
    preview.addEventListener("pointerenter", () => { overPreview = true; clearTimeout(closeTimer); });
    preview.addEventListener("pointerleave", () => { overPreview = false; scheduleClose(); });
    preview.addEventListener("focusin", () => clearTimeout(closeTimer));
    preview.addEventListener("focusout", scheduleClose);
    closeButton.addEventListener("click", () => close(true));
    const controller = {
      card,
      close,
      setSlice(next) { depth = next; updateSliceControl(); updatePreview(); },
      setFrame(frame) { timeline.dataset.currentFrame = String(frame); }
    };
    if ("ResizeObserver" in window) new ResizeObserver(positionPreview).observe(card);
    else window.addEventListener("resize", positionPreview);
    updateSliceControl();
    positionPreview();
    return controller;
  };
})();

/* Shared CMR/ECHO playback; CMR also has a paired slice selector. */
(() => {
  "use strict";

  const examples = window.CARDIOFAD?.videos || {};
  const viewers = new Map();
  const playbackControllers = new Set();
  const playAllButton = document.getElementById("video-play-all");
  const anyPlaying = () => Array.from(playbackControllers).some(controller => controller.isPlaying());
  const updatePlayAllButton = () => {
    if (!playAllButton) return;
    const playing = anyPlaying();
    playAllButton.hidden = playbackControllers.size === 0;
    playAllButton.dataset.action = playing ? "pause" : "play";
    playAllButton.querySelector(".video-play-all-text").textContent = playing ? "Pause all" : "Play all";
  };
  const paintRange = input => {
    const min = Number(input.min);
    const span = Number(input.max) - min;
    const progress = span > 0 ? (Number(input.value) - min) / span * 100 : 0;
    input.style.setProperty("--range-progress", `${Math.max(0, Math.min(100, progress))}%`);
  };
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  document.querySelectorAll('.video-slot[data-side="original"]').forEach(originalSlot => {
    const modality = originalSlot.dataset.video;
    if (modality !== "cmr" && modality !== "echo") return;
    const modalityLabel = modality.toUpperCase();
    const hasSlices = modality === "cmr";
    const exampleIndex = Number(originalSlot.dataset.example);
    const example = examples[modality]?.[exampleIndex];
    const card = originalSlot.closest(".video-example");
    const pair = card?.querySelector(".video-pair");
    const syntheticSlot = card?.querySelector(`[data-video="${modality}"][data-side="synthetic"]`);
    if (!pair || !syntheticSlot || !example) return;
    if (hasSlices && (!example.sliceDirectory || !Number.isInteger(example.sliceCount) || example.sliceCount < 1)) return;
    if (!hasSlices && (!example.original || !example.synthetic || !example.observed)) return;

    const slots = [originalSlot, syntheticSlot];
    slots.forEach(slot => {
      const placeholderTitle = slot.querySelector(".placeholder-title");
      if (placeholderTitle) placeholderTitle.textContent = "Scroll to load";
    });
    const sliceCount = hasSlices ? example.sliceCount : 1;
    const minSlice = Math.max(0, example.minSlice ?? 0);
    const maxSlice = Math.min(sliceCount - 1, example.maxSlice ?? sliceCount - 1);
    let selectedSlice = Math.max(minSlice, Math.min(maxSlice,
      Number.isInteger(example.defaultSlice) ? example.defaultSlice : Math.floor(sliceCount / 2)));
    let loadedSlice = -1;
    let videos = [];
    let generation = 0;
    let playTicket = 0;
    let visible = false;
    let wantsPlay = true;
    let blocked = false;
    let failed = false;
    let alignmentPending = false;
    let seekTarget = 0;
    let playPending = false;
    let savedTime = 0;
    let duration = 0;
    let animation = 0;
    let sliceTimer = 0;
    let mediaEvents;

    card.classList.add("paired-viewer", `${modality}-viewer`);
    card.dataset.modality = modality;
    if (hasSlices) card.dataset.slice = String(selectedSlice);
    card.dataset.task = example.task || "";
    const observed = example.observed;
    const frameCount = example.frameCount || 50;
    const caseId = hasSlices ? example.sliceDirectory.split("/").pop()
      : example.original.split("/").pop().replace(/_GT\.mp4$/, "");
    const keyframeData = window.CARDIOFAD_KEYFRAMES?.[modality]?.[caseId];
    let keyframeTimeline = null;
    const observedLabelText = !hasSlices ? "Observed frame" : observed?.type === "volume" ? "Observed volume" : "Observed slice";
    let observedSlot;
    let observedCaption;
    let loadedObservedDepth = -1;
    let observedGeneration = 0;
    if (observed) {
      const observedPanel = make("div", "video-panel cmr-observed-panel");
      const observedLabel = make("p", "video-label", observedLabelText);
      observedSlot = make("div", "media-slot cmr-observed-slot");
      observedSlot.append(make("span", "cmr-observed-placeholder", "Scroll to load"));
      const observedMeta = make("p", "cmr-observed-meta");
      if (hasSlices) {
        observedCaption = make("span", "cmr-observed-depth");
        observedMeta.append(observedCaption);
      }
      const observedFrame = make("span", "cmr-observed-frame", `Frame: ${observed.frame + 1} / ${frameCount}`);
      observedMeta.append(observedFrame);
      observedPanel.append(observedLabel, observedSlot, observedMeta);
      pair.prepend(observedPanel);
      card.dataset.observedFrame = String(observed.frame);
    }
    const updateObserved = () => {
      if (!observed) return;
      // A volume supplies a static image at every depth; a slice stays fixed.
      const depth = hasSlices ? (observed.type === "volume" ? selectedSlice : observed.depth) : 0;
      if (hasSlices) {
        observedCaption.textContent = `Observed slice: ${depth + 1} / ${sliceCount}`;
        card.dataset.observedDepth = String(depth);
      }
      if (loadedObservedDepth === depth) return;
      loadedObservedDepth = depth;
      const token = ++observedGeneration;
      const img = new Image(128, 128);
      img.decoding = "async";
      img.className = "cmr-observed-image";
      img.alt = `${observedLabelText}: frame ${observed.frame + 1} of ${frameCount}${hasSlices ? `, slice ${depth + 1} of ${sliceCount}` : ""}`;
      observedSlot.setAttribute("aria-busy", "true");
      observedSlot.replaceChildren(make("span", "cmr-observed-placeholder", "Loading input…"));
      img.addEventListener("load", () => {
        if (token !== observedGeneration) return;
        observedSlot.replaceChildren(img);
        observedSlot.setAttribute("aria-busy", "false");
      }, { once: true });
      img.addEventListener("error", () => {
        if (token !== observedGeneration) return;
        loadedObservedDepth = -1;
        observedSlot.replaceChildren(make("span", "cmr-observed-placeholder", "Input unavailable. Retry videos."));
        observedSlot.setAttribute("aria-busy", "false");
        retryButton.hidden = false;
      }, { once: true });
      img.src = hasSlices ? `${observed.directory}/depth_${String(depth).padStart(2, "0")}.png` : observed.image;
    };
    let sliceInput;
    let sliceValue;
    if (hasSlices) {
      const sliceControl = make("div", "cmr-slice-control");
      const sliceLabel = make("label", "cmr-slice-label", "Slice");
      sliceInput = make("input", "cmr-slice-slider");
      sliceInput.type = "range";
      sliceInput.id = `cmr-slice-${exampleIndex}`;
      sliceInput.min = String(minSlice);
      sliceInput.max = String(maxSlice);
      sliceInput.step = "1";
      sliceInput.value = String(selectedSlice);
      sliceInput.setAttribute("aria-label", `CMR example ${exampleIndex + 1}: shared slice position`);
      const mobileSlider = window.matchMedia("(max-width: 760px)");
      const updateOrientation = () => sliceInput.setAttribute("aria-orientation", mobileSlider.matches ? "horizontal" : "vertical");
      updateOrientation();
      mobileSlider.addEventListener("change", updateOrientation);
      sliceLabel.htmlFor = sliceInput.id;
      sliceValue = make("output", "cmr-slice-value");
      sliceValue.htmlFor = sliceInput.id;
      sliceControl.append(sliceLabel, sliceInput, sliceValue);
      pair.append(sliceControl);
    }

    const playback = make("div", "cmr-playback");
    const playButton = make("button", "cmr-play-toggle", "Pause");
    playButton.type = "button";
    const timeInput = make("input", "cmr-time-slider");
    timeInput.type = "range";
    timeInput.min = "0";
    timeInput.max = "1";
    timeInput.step = "0.01";
    timeInput.value = "0";
    timeInput.disabled = true;
    timeInput.setAttribute("aria-label", `${modalityLabel} example ${exampleIndex + 1}: shared playback position`);
    playback.append(playButton, timeInput);
    const status = make("p", "cmr-status", "Videos load when this example is in view.");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const retryButton = make("button", "cmr-retry", "Retry videos");
    retryButton.type = "button";
    retryButton.hidden = true;
    card.append(playback, status, retryButton);

    const active = () => visible && !document.hidden;
    const current = token => token === generation && loadedSlice === selectedSlice;
    const setStatus = message => {
      if (status.textContent !== message) status.textContent = message;
    };
    const updateSlice = () => {
      if (!hasSlices) return;
      const label = `${selectedSlice + 1} / ${sliceCount}`;
      sliceValue.textContent = label;
      sliceInput.value = String(selectedSlice);
      sliceInput.setAttribute("aria-valuetext", `Slice ${selectedSlice + 1} of ${sliceCount}`);
      paintRange(sliceInput);
      card.dataset.slice = String(selectedSlice);
      keyframeTimeline?.setSlice(selectedSlice);
    };
    const updatePlayButton = () => {
      const playingIntent = wantsPlay && !blocked;
      playButton.textContent = playingIntent ? "Pause" : "Play";
      playButton.setAttribute("aria-label", `${playingIntent ? "Pause" : "Play"} both videos in ${modalityLabel} example ${exampleIndex + 1}`);
      updatePlayAllButton();
    };
    const updateTime = time => {
      const value = Math.max(0, Math.min(duration || (keyframeData ? frameCount / keyframeData.fps : 0), time || 0));
      const frame = keyframeData ? Math.min(frameCount - 1, Math.floor(value * keyframeData.fps)) : null;
      timeInput.value = String(frame ?? value);
      paintRange(timeInput);
      timeInput.setAttribute("aria-valuetext", frame !== null ? `Frame ${frame + 1} of ${frameCount}` : `${value.toFixed(1)} of ${duration.toFixed(1)} seconds`);
      if (frame !== null) keyframeTimeline?.setFrame(frame);
    };
    const pausePair = () => {
      playTicket += 1;
      playPending = false;
      cancelAnimationFrame(animation);
      videos.forEach(video => video.pause());
    };
    const rememberTime = () => {
      if (loadedSlice === selectedSlice && !alignmentPending && Number.isFinite(videos[0]?.currentTime)) {
        savedTime = videos[0].currentTime;
      }
    };
    const seekPair = time => {
      pausePair();
      savedTime = Math.max(0, Math.min(time, duration > 0 ? Math.max(0, duration - 0.001) : Infinity));
      seekTarget = savedTime;
      alignmentPending = true;
      updateTime(savedTime);
      maybeReady();
    };

    const tick = () => {
      if (!active() || !wantsPlay || failed || blocked || loadedSlice !== selectedSlice) return;
      const [master, follower] = videos;
      if (!master || videos.some(video => video.paused || video.seeking)) return;
      savedTime = master.currentTime;
      updateTime(savedTime);
      // Correct only visible drift; both decoders then restart from the same time.
      if (Math.abs(master.currentTime - follower.currentTime) > 0.06) {
        seekPair(master.currentTime);
        return;
      }
      animation = requestAnimationFrame(tick);
    };

    const startPair = async () => {
      if (playPending || !active() || !wantsPlay || blocked || failed || loadedSlice !== selectedSlice) return;
      if (videos.length !== 2 || videos.some(video => video.readyState < 3 || video.seeking)) return;
      if (videos.every(video => !video.paused)) return;
      const token = generation;
      const ticket = ++playTicket;
      playPending = true;
      const results = await Promise.allSettled(videos.map(video => video.play()));
      if (!current(token) || ticket !== playTicket) return;
      playPending = false;
      if (!active() || !wantsPlay) {
        pausePair();
        return;
      }
      const rejection = results.find(result => result.status === "rejected");
      if (rejection) {
        pausePair();
        blocked = true;
        updatePlayButton();
        setStatus("Playback paused. Select Play to start both videos.");
        return;
      }
      setStatus("");
      cancelAnimationFrame(animation);
      animation = requestAnimationFrame(tick);
    };

    function maybeReady() {
      if (failed || loadedSlice !== selectedSlice || videos.length !== 2) return;
      if (videos.some(video => video.readyState < 1)) return;
      duration = Math.min(...videos.map(video => video.duration));
      if (!Number.isFinite(duration) || duration <= 0) return;
      timeInput.max = String(keyframeData ? frameCount - 1 : duration);
      if (videos.some(video => video.seeking)) return;
      if (alignmentPending) {
        seekTarget = Math.max(0, Math.min(seekTarget, Math.max(0, duration - 0.001)));
        // Metadata can arrive before a server exposes a seekable time range.
        // Wait for progress rather than repeatedly seeking to a clamped zero.
        if (seekTarget > 0 && videos.some(video => !Array.from({ length: video.seekable.length }, (_, i) =>
          seekTarget >= video.seekable.start(i) && seekTarget <= video.seekable.end(i)).some(Boolean))) return;
        let seeking = false;
        videos.forEach(video => {
          if (Math.abs(video.currentTime - seekTarget) > 0.001) {
            video.currentTime = seekTarget;
            seeking = true;
          }
        });
        // Keep the target until both decoders confirm the seek; data arriving
        // during the load must not replace it with an old frame.
        if (seeking || videos.some(video => video.seeking || video.readyState < 2)) return;
        savedTime = seekTarget;
        alignmentPending = false;
      }
      if (videos.some(video => video.seeking || video.readyState < 2)) return;
      timeInput.disabled = false;
      card.setAttribute("aria-busy", "false");
      updateTime(videos[0].currentTime);
      if (!blocked) setStatus("");
      if (videos.every(video => video.readyState >= 3)) startPair();
    }

    const loadSlice = () => {
      clearTimeout(sliceTimer);
      if (!active()) return;
      pausePair();
      const token = ++generation;
      // Reuse two media elements so repeated slice changes do not accumulate
      // decoders. Abort the previous listeners before replacing their sources.
      mediaEvents?.abort();
      mediaEvents = new AbortController();
      const eventOptions = { signal: mediaEvents.signal };
      loadedSlice = selectedSlice;
      failed = false;
      alignmentPending = true;
      seekTarget = savedTime;
      retryButton.hidden = true;
      updateObserved();
      timeInput.disabled = true;
      card.setAttribute("aria-busy", "true");
      setStatus(hasSlices ? `Loading slice ${selectedSlice + 1} of ${sliceCount}…` : "Loading videos…");
      const depth = String(selectedSlice).padStart(2, "0");
      const directory = example.sliceDirectory?.replace(/\/$/, "");
      videos = slots.map((slot, side) => {
        const video = videos[side] || document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.controls = false;
        video.disablePictureInPicture = true;
        video.setAttribute("aria-label", `${slot.dataset.alt}${hasSlices ? `, slice ${selectedSlice + 1} of ${sliceCount}` : ""}`);
        // Native looping is disabled: reaching either end rewinds the shared clock.
        ["loadedmetadata", "loadeddata", "canplay", "seeked", "progress"].forEach(event => {
          video.addEventListener(event, () => {
            if (current(token)) maybeReady();
          }, eventOptions);
        });
        video.addEventListener("waiting", () => {
          if (!current(token) || failed || !wantsPlay) return;
          rememberTime();
          pausePair();
          if (active()) setStatus("Buffering both videos…");
        }, eventOptions);
        video.addEventListener("ended", () => {
          if (current(token) && !failed && video.ended) seekPair(0);
        }, eventOptions);
        video.addEventListener("error", () => {
          if (!current(token)) return;
          failed = true;
          pausePair();
          timeInput.disabled = true;
          retryButton.hidden = false;
          card.setAttribute("aria-busy", "false");
          setStatus(hasSlices ? `Could not load slice ${selectedSlice + 1}. Retry or choose another slice.` : "Could not load videos. Select Retry videos.");
        }, eventOptions);
        if (video.parentNode !== slot) slot.replaceChildren(video);
        slot.classList.add("has-media");
        slot.classList.remove("load-error");
        video.src = hasSlices ? `${directory}/depth_${depth}_${side === 0 ? "GT" : "Synthetic"}.mp4` : example[side === 0 ? "original" : "synthetic"];
        return video;
      });
      videos.forEach(video => {
        video.load();
        window.CardioFADPlayback?.apply(video);
      });
    };

    const selectSlice = (value, commit = false) => {
      const next = Math.max(minSlice, Math.min(maxSlice, Math.round(Number(value))));
      if (!Number.isFinite(next)) return;
      if (next !== selectedSlice) {
        rememberTime();
        pausePair();
        generation += 1;
        selectedSlice = next;
        loadedSlice = -1;
        updateSlice();
        timeInput.disabled = true;
        card.setAttribute("aria-busy", String(active()));
        clearTimeout(sliceTimer);
        // Both slice controls share the same phase and debounce while dragging.
        if (active()) sliceTimer = setTimeout(loadSlice, 90);
      }
      if (commit && loadedSlice !== selectedSlice && active()) loadSlice();
    };
    sliceInput?.addEventListener("input", () => selectSlice(sliceInput.value));
    sliceInput?.addEventListener("change", () => selectSlice(sliceInput.value, true));
    const setPlaying = playing => {
      wantsPlay = playing;
      if (playing) {
        blocked = false;
        if (failed || loadedSlice !== selectedSlice) loadSlice();
        else maybeReady();
      } else {
        rememberTime();
        if (loadedSlice === selectedSlice && duration > 0 && !alignmentPending) seekPair(savedTime);
        else pausePair();
      }
      updatePlayButton();
    };
    playButton.addEventListener("click", () => setPlaying(blocked || !wantsPlay));
    timeInput.addEventListener("input", () => seekPair(keyframeData
      ? (Number(timeInput.value) + .5) / keyframeData.fps : Number(timeInput.value)));
    retryButton.addEventListener("click", () => {
      blocked = false;
      loadSlice();
      updatePlayButton();
    });

    const refreshVisibility = () => {
      if (active()) {
        if (loadedSlice !== selectedSlice) loadSlice();
        else maybeReady();
      } else {
        clearTimeout(sliceTimer);
        keyframeTimeline?.close();
        rememberTime();
        pausePair();
        // Release offscreen decoders; restore the saved slice and time on return.
        mediaEvents?.abort();
        generation += 1;
        videos.forEach(video => {
          video.removeAttribute("src");
          video.load();
        });
        loadedSlice = -1;
        timeInput.disabled = true;
        card.setAttribute("aria-busy", "false");
      }
    };
    if (keyframeData && window.createCardioFADKeyframeTimeline) {
      keyframeTimeline = window.createCardioFADKeyframeTimeline({
        card, timeInput, data: keyframeData, observedFrame: observed?.frame, modality, exampleIndex,
        slice: hasSlices ? selectedSlice : null, sliceCount, minSlice, maxSlice,
        onSliceChange: selectSlice,
        onSelect: frame => {
          wantsPlay = false;
          blocked = false;
          seekPair((frame + .5) / keyframeData.fps);
          if (failed || loadedSlice !== selectedSlice) loadSlice();
          updatePlayButton();
        }
      });
    }
    viewers.set(card, inView => {
      visible = inView;
      refreshVisibility();
    });
    playbackControllers.add({ isPlaying: () => wantsPlay && !blocked, setPlaying });
    document.addEventListener("visibilitychange", refreshVisibility);
    updateSlice();
    if (observed && hasSlices) {
      const depth = observed.type === "volume" ? selectedSlice : observed.depth;
      observedCaption.textContent = `Observed slice: ${depth + 1} / ${sliceCount}`;
    }
    updatePlayButton();
  });

  playAllButton?.addEventListener("click", () => {
    const playing = !anyPlaying();
    // Update every example's intent; offscreen media still load only on demand.
    playbackControllers.forEach(controller => controller.setPlaying(playing));
    updatePlayAllButton();
  });
  updatePlayAllButton();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => viewers.get(entry.target)?.(entry.isIntersecting));
    }, { threshold: 0 });
    viewers.forEach((_, card) => observer.observe(card));
  } else {
    const refresh = () => viewers.forEach((setVisible, card) => {
      const rect = card.getBoundingClientRect();
      setVisible(rect.bottom > 0 && rect.top < window.innerHeight);
    });
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    refresh();
  }
})();

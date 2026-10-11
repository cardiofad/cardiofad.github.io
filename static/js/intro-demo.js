/* Illustrative anchors and synchronized playback, independent of the full gallery. */
(() => {
  "use strict";
  const section = document.getElementById("intro-demo");
  if (!section) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Keep the compact demo at 80% of the gallery's responsive media size.
  const galleryMedia = document.querySelector(".cmr-examples-grid .video-slot");
  if (galleryMedia) {
    const matchMediaSize = () => {
      const size = galleryMedia.getBoundingClientRect().width;
      if (size > 0) section.style.setProperty("--intro-media-size", `${size * .8}px`);
    };
    matchMediaSize();
    if ("ResizeObserver" in window) new ResizeObserver(matchMediaSize).observe(galleryMedia);
    else window.addEventListener("resize", matchMediaSize);
  }

  section.querySelectorAll(".intro-demo-card").forEach(card => {
    const modality = card.dataset.modality;
    const name = modality.toUpperCase();
    const frameCount = Number(card.dataset.frameCount);
    const fps = Number(card.dataset.fps);
    // These indices are sampled once for illustration, not learned anchor predictions.
    const keyframes = card.dataset.keyframes.split(",").map(Number);
    const videos = Array.from(card.querySelectorAll("video"));
    const [master, follower] = videos;
    const button = card.querySelector(".intro-demo-toggle");
    const status = card.querySelector(".intro-demo-status");
    const timeline = card.querySelector(".intro-demo-time-slider");
    const keySlider = card.querySelector(".intro-demo-keyframe-slider");
    const keyReadout = card.querySelector(".intro-demo-keyframe-readout");
    const keyImage = card.querySelector(".intro-demo-keyframe-image");
    const sliceSlider = card.querySelector(".intro-demo-slice-slider");
    let slice = sliceSlider ? Number(sliceSlider.value) : null;
    let keyIndex = Number(keySlider.value);
    let visible = false;
    let loaded = false;
    let failed = false;
    let wantsPlay = !reducedMotion.matches;
    let userChosePlayback = false;
    let targetTime = 0;
    let ticket = 0;
    let starting = false;
    let animation = 0;

    const inView = () => visible && !document.hidden;
    const paint = slider => {
      const progress = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
      slider.style.setProperty("--range-progress", `${Math.max(0, Math.min(1, progress)) * 100}%`);
    };
    const updateButton = () => {
      button.textContent = failed ? "Retry" : wantsPlay ? "Pause" : "Play";
      button.setAttribute("aria-label", `${failed ? "Retry" : wantsPlay ? "Pause" : "Play"} ${name} demo videos`);
    };
    const pause = () => {
      ticket += 1;
      starting = false;
      videos.forEach(video => video.pause());
    };
    const stop = () => {
      pause();
      cancelAnimationFrame(animation);
      animation = 0;
    };
    const fail = message => {
      failed = true;
      stop();
      card.setAttribute("aria-busy", "false");
      status.textContent = message;
      updateButton();
    };
    const setImage = (image, src, force) => {
      if (force || image.getAttribute("src") !== src) image.src = src;
    };
    const updateKeyframe = (force = false) => {
      const frame = keyframes[keyIndex];
      const label = `Keyframe ${keyIndex + 1} / ${keyframes.length} · Frame ${frame + 1} / ${frameCount}`;
      const directory = `static/images/intro-demo/keyframes/${modality}${slice !== null ? `/depth_${String(slice).padStart(2, "0")}` : ""}`;
      setImage(keyImage, `${directory}/frame_${String(frame).padStart(3, "0")}.png`, force);
      keyImage.alt = `Illustrative ${name} keyframe ${keyIndex + 1} of ${keyframes.length}: frame ${frame + 1} of ${frameCount}${slice !== null ? `, slice ${slice + 1} of 13` : ""}`;
      keyReadout.value = label;
      keySlider.setAttribute("aria-valuetext", label);
      paint(keySlider);
    };
    const updateObserved = (force = false) => {
      if (!sliceSlider) return;
      setImage(card.querySelector(".intro-demo-volume img"), `${card.dataset.observedDirectory}/depth_${String(slice).padStart(2, "0")}.png`, force);
      card.querySelector(".intro-demo-volume").setAttribute("aria-label", `Single 3D CMR volume; selected slice ${slice + 1} of 13, observed frame 19 of 50`);
      card.querySelector(".intro-demo-input-meta > span").textContent = `Slice ${slice + 1} / 13`;
      card.querySelector(".intro-demo-slice-control output").value = `${slice + 1} / 13`;
      sliceSlider.setAttribute("aria-valuetext", `Slice ${slice + 1} of 13`);
      videos.forEach(video => video.setAttribute("aria-label", `CMR ${video.dataset.side === "GT" ? "ground-truth" : "generated"} sequence, slice ${slice + 1} of 13`));
      paint(sliceSlider);
    };
    const updateTimeline = frame => {
      timeline.value = String(Math.max(0, Math.min(frameCount - 1, frame)));
      timeline.setAttribute("aria-valuetext", `Frame ${Number(timeline.value) + 1} of ${frameCount}`);
      paint(timeline);
    };
    const schedule = () => {
      if (!animation && inView() && loaded && !failed) animation = requestAnimationFrame(tick);
    };
    const start = async () => {
      if (starting || videos.every(video => !video.paused)) return;
      const currentTicket = ++ticket;
      starting = true;
      const results = await Promise.allSettled(videos.map(video => video.play()));
      if (currentTicket !== ticket) return;
      starting = false;
      if (!inView() || !wantsPlay || failed) return pause();
      if (results.some(result => result.status === "rejected")) {
        wantsPlay = false;
        pause();
        status.textContent = "Select Play to start the videos.";
        updateButton();
      }
    };
    const settle = () => {
      if (videos.some(video => video.readyState < 2 || video.seeking)) return;
      timeline.disabled = false;
      if (targetTime !== null) {
        const duration = Math.min(...videos.map(video => video.duration));
        const time = Math.max(0, Math.min(targetTime, duration - .001));
        // A byte-range-capable server makes every selected frame directly seekable.
        if (time > 0 && videos.some(video => !Array.from({length: video.seekable.length}, (_, i) =>
          time >= video.seekable.start(i) && time <= video.seekable.end(i)).some(Boolean))) return;
        let seeking = false;
        videos.forEach(video => {
          if (Math.abs(video.currentTime - time) > .001) {
            video.currentTime = time;
            seeking = true;
          }
        });
        if (seeking) return;
        targetTime = null;
        card.setAttribute("aria-busy", "false");
        status.textContent = "";
      }
      if (wantsPlay && videos.every(video => video.readyState >= 3)) start();
    };
    function tick() {
      animation = 0;
      if (!inView() || failed) return;
      if (targetTime === null && !starting && !master.paused && !follower.paused &&
          !master.seeking && !follower.seeking && Math.abs(master.currentTime - follower.currentTime) > .04) {
        pause();
        targetTime = master.currentTime;
      }
      settle();
      if (targetTime === null) updateTimeline(Math.floor(master.currentTime * fps));
      if (wantsPlay || targetTime !== null) schedule();
    }
    const loadVideos = () => {
      pause();
      loaded = true;
      card.setAttribute("aria-busy", "true");
      timeline.disabled = true;
      videos.forEach(video => {
        video.src = slice !== null
          ? `${card.dataset.sliceDirectory}/depth_${String(slice).padStart(2, "0")}_${video.dataset.side}.mp4`
          : video.dataset.demoSrc;
        if (slice !== null && slice !== 6) video.removeAttribute("poster");
        video.preload = "auto";
        video.load();
        window.CardioFADPlayback?.apply(video);
      });
      schedule();
    };
    const refresh = () => {
      if (!inView()) return stop();
      if (!loaded) loadVideos();
      schedule();
    };
    const seekFrame = frame => {
      userChosePlayback = true;
      wantsPlay = false;
      pause();
      // Seek inside the frame interval to avoid rounding onto the preceding frame.
      targetTime = (frame + .5) / fps;
      card.setAttribute("aria-busy", "true");
      updateTimeline(frame);
      updateButton();
      if (!loaded && inView()) loadVideos();
      schedule();
    };

    keySlider.addEventListener("input", () => {
      keyIndex = Number(keySlider.value);
      updateKeyframe();
      seekFrame(keyframes[keyIndex]);
    });
    timeline.addEventListener("input", () => seekFrame(Number(timeline.value)));
    sliceSlider?.addEventListener("input", () => {
      const nextSlice = Number(sliceSlider.value);
      if (nextSlice === slice) return;
      // Preserve both the selected anchor and the current cardiac phase across depths.
      targetTime = targetTime ?? master.currentTime;
      slice = nextSlice;
      updateObserved();
      updateKeyframe();
      if (loaded && inView()) loadVideos();
      else loaded = false;
    });
    button.addEventListener("click", () => {
      userChosePlayback = true;
      if (failed) {
        failed = false;
        loaded = false;
        targetTime = targetTime ?? master.currentTime;
        updateObserved(true);
        updateKeyframe(true);
        wantsPlay = true;
      } else wantsPlay = !wantsPlay;
      status.textContent = "";
      if (!wantsPlay) pause();
      updateButton();
      refresh();
    });
    videos.forEach(video => {
      video.muted = true;
      video.defaultMuted = true;
      video.disablePictureInPicture = true;
      ["loadedmetadata", "loadeddata", "canplay", "progress", "seeked"].forEach(event => video.addEventListener(event, () => {
        if (!inView() || failed) return;
        // Start and finish seeks on media readiness, even before the next paint.
        settle();
        if (targetTime === null) updateTimeline(Math.floor(master.currentTime * fps));
        schedule();
      }));
      video.addEventListener("ended", () => {
        if (!video.ended || failed) return;
        pause();
        targetTime = 0;
        schedule();
      });
      video.addEventListener("waiting", () => {
        // A queued waiting event can arrive after buffering has already finished.
        if (failed || !loaded || video.readyState >= 3) return;
        pause();
        targetTime = targetTime ?? master.currentTime;
        schedule();
      });
      video.addEventListener("error", () => {
        if (video.error) fail("The videos could not load. Select Retry.");
      });
    });
    card.querySelectorAll("img").forEach(image => image.addEventListener("error", () => {
      if (image.complete && !image.naturalWidth) fail("An input or keyframe could not load. Select Retry.");
    }));
    reducedMotion.addEventListener("change", () => {
      if (userChosePlayback) return;
      wantsPlay = !reducedMotion.matches;
      if (!wantsPlay) pause();
      updateButton();
      refresh();
    });
    document.addEventListener("visibilitychange", refresh);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        refresh();
      }).observe(card);
    } else {
      const checkVisibility = () => {
        const rect = card.getBoundingClientRect();
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
        refresh();
      };
      window.addEventListener("scroll", checkVisibility, {passive: true});
      window.addEventListener("resize", checkVisibility);
      checkVisibility();
    }
    updateKeyframe();
    updateObserved();
    updateTimeline(0);
    updateButton();
  });
})();

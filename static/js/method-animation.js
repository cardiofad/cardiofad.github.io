/* A user-started, chapter-aware player for the 38-second method schematic. */
(() => {
  "use strict";
  const root = document.querySelector("[data-method-animation]");
  if (!root) return;
  const video = root.querySelector("#method-video");
  const playButton = root.querySelector("[data-method-play]");
  const replayButton = root.querySelector("[data-method-replay]");
  const sceneLabel = root.querySelector("[data-method-scene]");
  const caption = root.querySelector("[data-method-caption]");
  const status = root.querySelector("[data-method-status]");
  const chapters = Array.from(root.querySelectorAll("[data-method-seek]"));
  const player = root.querySelector(".method-player");
  const scenes = [
    { start: 0, chapter: "overview", label: "Challenge", text: "One cardiac observation leaves the motion between frames unknown." },
    { start: 4, chapter: "focus", label: "Focus", text: "Learn motion-salient anchors that retain the information needed to reconstruct the trajectory." },
    { start: 11, chapter: "align", label: "Align", text: "Use informative anchors to connect visual states and time-series cues across modalities." },
    { start: 18, chapter: "diffuse", label: "Diffuse · Stage 1", text: "Generate keyframes from the sparse observation and aligned time-series guidance." },
    { start: 25, chapter: "diffuse", label: "Diffuse · Stage 2", text: "Condition on the generated anchors to interpolate the remaining frames." },
    { start: 32, chapter: "diffuse", label: "Output", text: "Combine the generated keyframes and interpolated frames into a complete cardiac sequence." }
  ];
  let activeScene = -1;
  let pendingSeek = null;
  let startAfterLoad = false;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  const update = () => {
    const currentTime = pendingSeek === null ? video.currentTime : pendingSeek;
    let index = 0;
    scenes.forEach((scene, sceneIndex) => { if (currentTime >= scene.start) index = sceneIndex; });
    if (index !== activeScene) {
      activeScene = index;
      const scene = scenes[index];
      sceneLabel.textContent = scene.label;
      caption.textContent = scene.text;
      player.dataset.scene = scene.chapter;
      chapters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.methodChapter === scene.chapter)));
    }
    playButton.textContent = video.ended ? "Replay animation" : video.paused ? "Play animation" : "Pause animation";
  };

  const reportError = message => {
    status.textContent = message;
    status.hidden = false;
  };

  const play = () => {
    status.hidden = true;
    const promise = video.play();
    if (promise) promise.catch(error => {
      // Scrolling away or changing chapters can intentionally interrupt play().
      if (error.name !== "AbortError") reportError("The animation could not start. Try the video controls or read the method details below.");
      update();
    });
  };

  const seek = (seconds, shouldPlay = false) => {
    status.hidden = true;
    if (video.readyState === 0) {
      pendingSeek = seconds;
      startAfterLoad = shouldPlay;
      video.load();
    } else {
      pendingSeek = null;
      video.currentTime = Math.min(seconds, Number.isFinite(video.duration) ? video.duration : 38);
      if (shouldPlay) play();
    }
    update();
  };

  chapters.forEach(button => {
    button.disabled = false;
    // Seeking preserves the viewer's choice to play or remain paused.
    button.addEventListener("click", () => seek(Number(button.dataset.methodSeek)));
  });
  playButton.addEventListener("click", () => {
    if (!video.paused) {
      video.pause();
    } else if (video.ended) {
      seek(0, true);
    } else {
      play();
    }
  });
  replayButton.addEventListener("click", () => seek(0, true));
  video.addEventListener("loadedmetadata", () => {
    if (pendingSeek !== null) {
      video.currentTime = Math.min(pendingSeek, video.duration);
      pendingSeek = null;
    }
    if (startAfterLoad) {
      startAfterLoad = false;
      play();
    }
    update();
  });
  ["timeupdate", "seeked", "play", "pause", "ended", "durationchange"].forEach(event => video.addEventListener(event, update));
  video.addEventListener("error", () => reportError("The animation could not load. You can still explore the full framework and text walkthrough below."));

  const pause = () => {
    startAfterLoad = false;
    video.pause();
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    });
    observer.observe(video);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  const reduceMotion = event => { if (event.matches) pause(); };
  if (motionPreference.addEventListener) motionPreference.addEventListener("change", reduceMotion);
  else if (motionPreference.addListener) motionPreference.addListener(reduceMotion);
  // No autoplay and no automatic resume, including when reduced motion is set.
  root.querySelector("[data-method-controls]").hidden = false;
  update();
})();

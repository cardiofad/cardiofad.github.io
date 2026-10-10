/* Two small opening examples, separate from the interactive slice gallery. */
(() => {
  "use strict";
  const section = document.getElementById("intro-demo");
  if (!section) return;
  const button = section.querySelector(".intro-demo-toggle");
  const status = section.querySelector(".intro-demo-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pairs = Array.from(section.querySelectorAll(".intro-demo-card"), card => ({
    videos: Array.from(card.querySelectorAll("video")), target: 0, ticket: 0, starting: false
  }));
  let visible = false;
  let loaded = false;
  let failed = false;
  let userChosePlayback = false;
  let wantsPlay = !reducedMotion.matches;
  let animation = 0;
  const active = () => visible && !document.hidden && wantsPlay && !failed;
  const updateButton = () => {
    button.textContent = failed ? "Retry demo" : wantsPlay ? "Pause demo" : "Play demo";
    button.setAttribute("aria-label", failed ? "Retry opening demo" : `${wantsPlay ? "Pause" : "Play"} opening demo`);
  };
  const pause = pair => {
    pair.ticket += 1;
    pair.starting = false;
    pair.videos.forEach(video => video.pause());
  };
  const pauseAll = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    pairs.forEach(pause);
  };

  const start = async pair => {
    if (pair.starting || pair.videos.every(video => !video.paused)) return;
    const ticket = ++pair.ticket;
    pair.starting = true;
    const results = await Promise.allSettled(pair.videos.map(video => video.play()));
    if (ticket !== pair.ticket) return;
    pair.starting = false;
    if (!active()) return pause(pair);
    if (results.some(result => result.status === "rejected")) {
      wantsPlay = false;
      pauseAll();
      status.textContent = "Select Play demo to start the videos.";
      updateButton();
    }
  };

  const settle = pair => {
    if (!active() || pair.videos.some(video => video.readyState < 3 || video.seeking)) return;
    if (pair.target !== null) {
      let seeking = false;
      for (const video of pair.videos) {
        if (Math.abs(video.currentTime - pair.target) <= 0.001) continue;
        // Wait until the server exposes the target in a seekable range.
        if (pair.target > 0 && !Array.from({ length: video.seekable.length }, (_, i) =>
          pair.target >= video.seekable.start(i) && pair.target <= video.seekable.end(i)).some(Boolean)) return;
        video.currentTime = pair.target;
        seeking = true;
      }
      if (seeking) return;
      pair.target = null;
    }
    start(pair);
  };

  const tick = () => {
    animation = 0;
    if (!active()) return;
    pairs.forEach(pair => {
      const [master, follower] = pair.videos;
      if (pair.target === null && !pair.starting && !master.paused && !follower.paused &&
          !master.seeking && !follower.seeking && Math.abs(master.currentTime - follower.currentTime) > 0.06) {
        pause(pair);
        pair.target = master.currentTime;
      }
      settle(pair);
    });
    animation = requestAnimationFrame(tick);
  };

  const load = () => {
    loaded = true;
    pairs.forEach(pair => {
      pair.target = 0;
      pair.videos.forEach(video => {
        video.src = video.dataset.demoSrc;
        video.preload = "auto";
        video.load();
      });
    });
  };
  const refresh = () => {
    if (!active()) return pauseAll();
    if (!loaded) load();
    if (!animation) animation = requestAnimationFrame(tick);
  };

  pairs.forEach(pair => pair.videos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.disablePictureInPicture = true;
    // Rewind both members together instead of independently looping each video.
    video.addEventListener("ended", () => {
      if (!video.ended || failed) return;
      pause(pair);
      pair.target = 0;
      settle(pair);
    });
    video.addEventListener("waiting", () => pause(pair));
    video.addEventListener("error", () => {
      failed = true;
      pauseAll();
      status.textContent = "The demo could not load. Select Retry demo or view all examples.";
      updateButton();
    });
  }));
  button.hidden = false;
  button.addEventListener("click", () => {
    userChosePlayback = true;
    if (failed) {
      failed = false;
      loaded = false;
      wantsPlay = true;
    } else wantsPlay = !wantsPlay;
    status.textContent = "";
    updateButton();
    refresh();
  });
  reducedMotion.addEventListener("change", () => {
    if (userChosePlayback) return;
    wantsPlay = !reducedMotion.matches;
    updateButton();
    refresh();
  });
  document.addEventListener("visibilitychange", refresh);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      refresh();
    }).observe(section);
  } else {
    const checkVisibility = () => {
      const rect = section.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      refresh();
    };
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);
    checkVisibility();
  }
  updateButton();
})();

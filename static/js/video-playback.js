/* One playback speed for the opening demo and every result viewer. */
(() => {
  "use strict";
  const buttons = Array.from(document.querySelectorAll("#video-speed-controls [data-rate]"));
  let rate = 1;
  const apply = video => {
    // Keep the chosen rate when lazy loading or replacing a slice's source.
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
  };
  window.CardioFADPlayback = { apply };
  buttons.forEach(button => button.addEventListener("click", () => {
    rate = Number(button.dataset.rate);
    buttons.forEach(option => option.setAttribute("aria-pressed", String(Number(option.dataset.rate) === rate)));
    document.querySelectorAll("video").forEach(apply);
  }));
  document.querySelectorAll("video").forEach(apply);
})();

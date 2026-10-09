/* Accessible, independent modality and task/dataset tabs. No data fetching. */
(() => {
  "use strict";
  const root = document.getElementById("quantitative-results");
  if (!root) return;

  const viewTablists = [...root.querySelectorAll("[data-results-view-tabs]")];

  const initTabs = (tablist, onChange = () => {}) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const activate = selected => {
      for (const tab of tabs) {
        const active = tab === selected;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
      }
      onChange(selected);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
    activate(tabs.find(tab => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  };

  // Each modality keeps its selected task/dataset when switching back to it.
  viewTablists.forEach(tablist => initTabs(tablist));
  initTabs(root.querySelector("[data-results-modality-tabs]"), selected => {
    viewTablists.forEach(tablist => {
      tablist.hidden = tablist.dataset.resultsViewTabs !== selected.dataset.modality;
    });
  });
  root.classList.add("is-enhanced");
  root.querySelector(".results-controls").hidden = false;
})();

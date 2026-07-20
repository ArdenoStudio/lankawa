/**
 * P63 — Lankawa widget SDK snippet scaffold.
 * Prefer iframe embeds from /embed until a full npm package ships.
 * Usage:
 *   <div id="lankawa-widget" data-widget="brief"></div>
 *   <script src="/embed/widget.js" defer></script>
 */
(function () {
  "use strict";

  function mount(el) {
    if (!el || el.getAttribute("data-lankawa-mounted") === "1") {
      return;
    }
    var widget = el.getAttribute("data-widget") || "brief";
    var allowed = { today: 1, pulse: 1, fuel: 1, fx: 1, cse: 1, brief: 1 };
    if (!allowed[widget]) {
      widget = "brief";
    }
    var height =
      widget === "brief" || widget === "today" || widget === "pulse"
        ? "320"
        : "220";
    var iframe = document.createElement("iframe");
    iframe.src = "/embed/" + widget;
    iframe.title = "Lankawa " + widget + " widget";
    iframe.width = "100%";
    iframe.height = height;
    iframe.style.border = "0";
    iframe.loading = "lazy";
    el.appendChild(iframe);
    el.setAttribute("data-lankawa-mounted", "1");
  }

  function boot() {
    var nodes = document.querySelectorAll(
      "#lankawa-widget, [data-lankawa-widget]",
    );
    for (var i = 0; i < nodes.length; i++) {
      mount(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

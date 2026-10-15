/**
 * Site preview: static screenshot of a website's top; on hover the full-page
 * screenshot scrolls automatically, and rewinds when the mouse leaves.
 *
 * Markup:
 *   <div class="site-preview">
 *     <div class="site-preview__scroller">
 *       <img class="site-preview__long" src="full-page.jpg" alt="Name website" />
 *     </div>
 *   </div>
 *
 * Scrolling is a CSS transform on the wrapper; this script only measures how
 * far to travel and how long it should take.
 */
(function () {
  "use strict";

  var SPEED = 90; // displayed px per second
  var MIN_TIME = 5; // seconds
  var MAX_TIME = 16;
  var START_DELAY = 150; // ms of hover before scrolling starts
  var canHover = window.matchMedia("(hover: hover)").matches;

  function init(el) {
    var img = el.querySelector(".site-preview__long");
    if (!img) return;

    function measure() {
      var dist = Math.max(0, img.offsetHeight - el.clientHeight);
      var time = Math.min(MAX_TIME, Math.max(MIN_TIME, dist / SPEED));
      el.style.setProperty("--scroll-dist", -dist + "px");
      el.style.setProperty("--scroll-time", time + "s");
    }

    if (img.complete) measure();
    else img.addEventListener("load", measure);
    window.addEventListener("resize", measure);

    if (!canHover) return;

    var trigger = el.closest("a.portfolio-item") || el;
    var timer = null;

    trigger.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      measure();
      timer = setTimeout(function () {
        el.classList.add("is-scrolling");
      }, START_DELAY);
    });
    trigger.addEventListener("pointerleave", function () {
      clearTimeout(timer);
      el.classList.remove("is-scrolling");
    });
  }

  document.querySelectorAll(".site-preview").forEach(init);
})();

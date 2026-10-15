(function () {
  var cta = document.querySelector("[data-floating-cta]");
  if (!cta) return;
  var mark = cta.querySelector(".dock-pill-mark");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DEG_PER_PX = 0.36; // 360deg per 1000px scrolled
  var visible = false;
  var ticking = false;
  var hideCount = 0; // how many "hide zones" (footer) are on screen

  // Hide the pill while the footer is on screen so it never covers footer links.
  var zones = [document.querySelector(".ftr")];
  if ("IntersectionObserver" in window) {
    zones.forEach(function (zone) {
      if (!zone) return;
      var inside = false;
      new IntersectionObserver(function (entries) {
        var now = entries[0].isIntersecting;
        if (now === inside) return;
        inside = now;
        hideCount += now ? 1 : -1;
        update();
      }).observe(zone);
    });
  }

  function update() {
    ticking = false;
    var y = window.scrollY;
    var show = y > window.innerHeight && hideCount === 0;
    if (show !== visible) {
      visible = show;
      cta.classList.toggle("is-visible", show);
    }
    if (mark && !reduce) {
      mark.style.transform = "rotate(" + (y * DEG_PER_PX).toFixed(1) + "deg)";
    }
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

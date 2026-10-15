/* Smooth in-page navigation with GSAP ScrollToPlugin */
(function () {
  if (!window.gsap || !window.ScrollToPlugin) return;
  gsap.registerPlugin(ScrollToPlugin);

  var OFFSET = 96; // room for the fixed navbar
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(hash, push) {
    var target = null;
    if (hash === "#" || hash === "" || hash === "#top") {
      target = 0;
    } else {
      target = document.getElementById(hash.slice(1));
      if (!target) return false;
    }
    var distance = Math.abs(
      (typeof target === "number" ? 0 : target.getBoundingClientRect().top + window.scrollY) -
        window.scrollY
    );
    var duration = reduce ? 0 : Math.min(1.6, Math.max(0.8, distance / 1800));

    gsap.to(window, {
      duration: duration,
      scrollTo: { y: target, offsetY: typeof target === "number" ? 0 : OFFSET, autoKill: true },
      ease: "power3.inOut",
    });
    if (push && window.history && history.pushState) {
      history.pushState(null, "", hash === "#" ? location.pathname + location.search : hash);
    }
    return true;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var hash = a.getAttribute("href");
    if (go(hash, true)) e.preventDefault();
  });

  // Deep link (e.g. /#pricing): glide to the section once the page is ready
  window.addEventListener("load", function () {
    if (location.hash && location.hash.length > 1) {
      setTimeout(function () { go(location.hash, false); }, 600);
    }
  });
})();

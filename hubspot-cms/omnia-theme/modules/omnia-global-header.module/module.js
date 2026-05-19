(function () {
  var header = document.querySelector("[data-omnia-header]");
  var toggle = document.querySelector("[data-omnia-menu-toggle]");
  var mobile = document.querySelector("[data-omnia-mobile-nav]");
  if (!header) return;

  header.classList.add("omnia-header--light");

  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = mobile.hidden;
      mobile.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobile.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }
})();

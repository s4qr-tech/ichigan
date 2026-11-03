/* ICHIGAN — 画面の動き（CSPで inline script を禁止するため、HTMLから分離）
   1) Webフォントの非同期読み込み 2) 表示アニメーション 3) スマホメニュー 4) 目次の現在地 5) 日本語の改行（BudouX：vendor/ に置いた同梱版を読み込む） */
var SITE_JS = document.currentScript && document.currentScript.src;
(function () {
  document.querySelectorAll('link[data-async-font]').forEach(function (l) { l.media = "all"; });

  var o = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { o.observe(el); });

  var hd = document.querySelector(".hd"), b = document.querySelector(".menu-btn");
  if (hd && b) b.addEventListener("click", function () {
    var on = hd.classList.toggle("open");
    b.setAttribute("aria-expanded", on);
    var en = document.documentElement.lang === "en";
    b.setAttribute("aria-label", on ? (en ? "Close menu" : "メニューを閉じる") : (en ? "Open menu" : "メニューを開く"));
  });

  var links = [].slice.call(document.querySelectorAll(".toc a"));
  if (links.length) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) so.observe(s); });
  }

  if (document.documentElement.lang === "ja") {
    import(new URL("vendor/budoux-0.6.4.js", SITE_JS || location.href).href).then(function (m) {
      var parser = m.loadDefaultJapaneseParser();
      document.querySelectorAll("h1 span, h2, h3, h4, p, li, summary, td, .lead, .answer, dt, dd").forEach(function (el) {
        if (el.closest("form, .giant")) return;
        parser.applyToElement(el);
      });
    }).catch(function () {});
  }
})();

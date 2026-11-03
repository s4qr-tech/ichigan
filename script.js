/* ICHIGAN — 共通スクリプト
   1) スマホ用メニューの開閉
   2) フォーム送信（既存のGoogle Apps Scriptへ送り、スプレッドシートに記録）   */

// 送信先。Apps Scriptを再デプロイしてURLが変わった場合はここだけ書き換えます。
var ENDPOINT = "https://script.google.com/macros/s/AKfycbyAcaekZC-RBVe4j0lDcsSDkzpOQ6egVXZEgR-ZYsC1Q1PzteJmIVDWNfRNz9xFgHz0/exec";
var CONTACT_MAIL = "info@morinoa.com";

/* ----- メニュー ----- */
document.addEventListener("click", function (e) {
  var btn = e.target.closest(".nav-toggle");
  if (!btn) return;
  var nav = document.getElementById("nav");
  var open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open ? "true" : "false");
});

/* ----- 18歳未満のときだけ保護者同意を表示 ----- */
document.addEventListener("input", function (e) {
  if (e.target.id !== "age") return;
  var box = document.getElementById("guardian-wrap");
  if (!box) return;
  var age = parseInt(e.target.value, 10);
  var minor = !isNaN(age) && age < 18;
  box.classList.toggle("hidden", !minor);
  var cb = document.getElementById("guardianConsent");
  if (cb) cb.required = minor;
  if (!minor && cb) cb.checked = false;
});

/* ----- 送信 ----- */
document.addEventListener("submit", function (e) {
  var form = e.target;
  if (!form.matches("form[data-form-type]")) return;
  e.preventDefault();

  // 必須項目・同意チェックが未入力なら送信しない（ブラウザ標準のメッセージを表示）
  if (!form.reportValidity()) return;

  var status = form.querySelector(".form-status");
  var button = form.querySelector("button[type=submit]");
  var payload = { formType: form.dataset.formType };

  if (form.dataset.source) payload.source = form.dataset.source;

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    if (!el.name) return;
    payload[el.name] = el.type === "checkbox" ? el.checked : el.value.trim();
  });

  button.disabled = true;
  status.className = "form-status";
  status.textContent = "送信しています…";

  fetch(ENDPOINT, {
    method: "POST",
    // Apps Scriptはプリフライトに対応しないため text/plain で送信します
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(function (res) { return res.json(); })
    .then(function (res) {
      if (res.result !== "success") throw new Error(res.message || "送信に失敗しました");
      form.reset();
      var g = document.getElementById("guardian-wrap");
      if (g) g.classList.add("hidden");
      status.className = "form-status ok";
      status.textContent = "送信を受け付けました。担当よりメールでご連絡します。";
    })
    .catch(function () {
      status.className = "form-status ng";
      status.textContent = "送信できませんでした。お手数ですが " + CONTACT_MAIL + " までご連絡ください。";
    })
    .finally(function () { button.disabled = false; });
});

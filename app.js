(function () {
  "use strict";
  var settings = window.MSTextileSettings.load();
  var products = settings.products;
  var cart = {};
  var productGrid = document.getElementById("productGrid");
  var filters = document.querySelectorAll("[data-filter]");
  var bagCount = document.getElementById("bagCount");
  var cartItems = document.getElementById("cartItems");
  var cartButton = document.getElementById("cartButton");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartBackdrop = document.getElementById("cartBackdrop");
  var cartClose = document.getElementById("cartClose");
  var orderWhatsapp = document.getElementById("orderWhatsapp");
  var cartLive = document.getElementById("cartLive");
  var toast = document.getElementById("toast");
  var toastTimer;
  var menuToggle = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");

  function text(selector, value) { var el = document.querySelector(selector); if (el && value != null) el.textContent = value; }
  function image(selector, src, alt) { var el = document.querySelector(selector); if (el && src) { el.src = src; if (alt) el.alt = alt; } }
  function filterFor(category) { return Array.prototype.find.call(document.querySelectorAll("[data-filter]"), function (button) { return button.dataset.filter === category; }); }
  function formatPrice(price) { return settings.currencySymbol + Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
  function safeLink(value) { var url = String(value || "#").trim(); return /^(https?:|mailto:|tel:|#)/i.test(url) ? url : "#"; }
  function safeImage(value) { var url = String(value || "").trim(); return /^(https?:|data:image\/)/i.test(url) ? url : ""; }
  function applySettings() {
    var c = settings;
    var root = document.documentElement;
    Object.keys(c.colors || {}).forEach(function (name) { root.style.setProperty("--" + ({ deepGreen: "deep-green", warmWhite: "warm-white" }[name] || name.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); })), c.colors[name]); });
    document.title = c.brand + " | Everyday clothing, thoughtfully made";
    document.querySelectorAll(".brand > span:last-child, .utility-inner > strong").forEach(function (el) { el.textContent = c.brand; });
    text(".utility-inner", c.announcement);
    text(".hero-copy .eyebrow", c.heroEyebrow); text(".hero-copy h1", c.heroTitle); text(".hero-copy > p:not(.eyebrow)", c.heroDescription);
    text(".hero-actions .button-primary", c.heroPrimary); text(".hero-actions .button-light", c.heroSecondary);
    document.querySelectorAll(".hero-note").forEach(function (el, i) { if (c.heroNotes[i] != null) el.textContent = c.heroNotes[i]; });
    text(".fabric-tag", c.heroTag); text(".hero-caption span", c.heroCaptionKicker); text(".hero-caption strong", c.heroCaption);
    image(".hero-image > img", c.heroImage, "MS TEXTILE apparel collection"); image(".hero-inset img", c.heroInsetImage, "Apparel from MS TEXTILE");
    document.querySelectorAll(".benefit").forEach(function (el, i) { if (c.benefits[i] != null) { var svg = el.querySelector("svg"); el.textContent = c.benefits[i]; if (svg) el.prepend(svg); } });
    text(".collections .eyebrow", c.collectionsEyebrow); text(".collections h2", c.collectionsTitle); text(".collections .section-heading > p", c.collectionsDescription);
    var categoryGrid = document.querySelector(".category-grid");
    while (categoryGrid.children.length < c.categories.length) categoryGrid.appendChild(categoryGrid.children[0].cloneNode(true));
    document.querySelectorAll(".category-card").forEach(function (el, i) { var item = c.categories[i]; if (!item) { el.hidden = true; return; } el.hidden = false; el.dataset.categoryLink = item.category; var img = el.querySelector("img"); img.src = safeImage(item.image); img.alt = item.alt; el.querySelector(".category-content span").textContent = item.kicker; el.querySelector(".category-content h3").childNodes[0].textContent = item.title + " "; });
    text(".shop-top .eyebrow", c.shopEyebrow); text(".shop-top h2", c.shopTitle); text(".shop-intro", c.shopDescription); text(".product-note", c.productNote);
    var filterWrap = document.querySelector(".filters");
    c.categories.forEach(function (item) { if (!filterFor(item.category)) { var button = document.createElement("button"); button.className = "filter"; button.type = "button"; button.setAttribute("role", "tab"); button.setAttribute("aria-selected", "false"); button.dataset.filter = item.category; button.textContent = item.title; filterWrap.appendChild(button); } });
    filters = document.querySelectorAll("[data-filter]");
    filters.forEach(function (el) { var filter = el.dataset.filter; if (c.filterLabels[filter]) el.textContent = c.filterLabels[filter]; });
    text(".story-copy .eyebrow", c.storyEyebrow); text(".story-copy h2", c.storyTitle); text(".story-copy > p:not(.eyebrow)", c.storyDescription);
    var facts = document.querySelectorAll(".story-fact"); if (facts[0]) { facts[0].querySelector("strong").textContent = c.storyFact1Title; facts[0].childNodes[1].textContent = c.storyFact1Text; } if (facts[1]) { facts[1].querySelector("strong").textContent = c.storyFact2Title; facts[1].childNodes[1].textContent = c.storyFact2Text; }
    image(".story-image img", c.storyImage, "MS TEXTILE workshop");
    text(".custom-copy .eyebrow", c.customEyebrow); text(".custom-copy h2", c.customTitle); text(".custom-copy > p", c.customDescription); text(".custom-copy .button-primary", c.customButton); document.querySelector(".custom-copy .button-primary").href = "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent("Hello " + c.brand + ", I would like to discuss a custom apparel order."); image(".custom-visual img", c.customImage, "MS TEXTILE custom apparel");
    document.querySelectorAll(".custom-list li").forEach(function (el, i) { if (c.customItems[i] != null) { var svg = el.querySelector("svg"); el.textContent = c.customItems[i]; if (svg) el.prepend(svg); } });
    text(".contact-copy .eyebrow", c.contactEyebrow); text(".contact-copy h2", c.contactTitle); text(".contact-copy > p:not(.eyebrow)", c.contactDescription);
    var contact = document.querySelectorAll(".contact-details a"); if (contact[0]) { contact[0].href = "https://wa.me/" + c.whatsapp; contact[0].lastChild.textContent = "+" + c.whatsapp; } if (contact[1]) { contact[1].href = "tel:" + c.phone; contact[1].lastChild.textContent = c.phone; } if (contact[2]) { contact[2].href = "mailto:" + c.email; contact[2].lastChild.textContent = c.email; } var mobileContact = document.querySelector(".mobile-contact"); if (mobileContact) mobileContact.href = "https://wa.me/" + c.whatsapp;
    text(".contact-details p", c.location); var form = document.querySelector(".contact-form"); if (form) form.action = "https://formsubmit.co/" + c.email;
    text(".footer-brand p", c.footerDescription); var footerLinks = document.querySelectorAll(".footer-group:last-child a"); if (footerLinks[0]) footerLinks[0].href = "https://wa.me/" + c.whatsapp; if (footerLinks[1]) { footerLinks[1].href = "tel:" + c.phone; footerLinks[1].textContent = c.phone; } if (footerLinks[2]) { footerLinks[2].href = "mailto:" + c.email; footerLinks[2].textContent = "Email " + c.brand; }
    document.querySelectorAll(".footer-bottom p:last-child").forEach(function (el) { el.textContent = c.location; });
    document.querySelectorAll(".cart-footer p").forEach(function (el) { el.textContent = "Send this list to " + c.brand + " on WhatsApp. We’ll confirm stock, sizes, colours and your final price before the order is placed."; });
    renderCustomSections();
  }
  function iconPlus() { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'; }
  function productMarkup(p) { var price = settings.showPrices && Number(p.price) > 0 ? '<span class="product-price">' + escapeHtml(formatPrice(p.price)) + '</span>' : ''; return '<article class="product-card"><div class="product-image"><img src="' + escapeAttr(safeImage(p.image)) + '" alt="' + escapeAttr(p.alt) + '" loading="lazy"><span class="product-tag">' + escapeHtml(p.tag) + '</span></div><div class="product-meta"><div><h3>' + escapeHtml(p.name) + '</h3><p>' + escapeHtml(p.detail) + '</p>' + price + '</div><button class="product-add" type="button" data-add="' + escapeAttr(p.id) + '" aria-label="Add ' + escapeAttr(p.name) + ' to enquiry bag">' + iconPlus() + '</button></div></article>'; }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function escapeAttr(value) { return escapeHtml(value); }
  function renderProducts(filter) { var visible = products.filter(function (p) { return filter === "all" || p.category === filter; }); productGrid.innerHTML = visible.map(productMarkup).join(""); }
  function findProduct(id) { return products.find(function (p) { return p.id === id; }); }
  function cartCount() { return Object.keys(cart).reduce(function (total, id) { return total + cart[id]; }, 0); }
  function cartRow(p, quantity) { var price = settings.showPrices && Number(p.price) > 0 ? '<p class="cart-price">' + escapeHtml(formatPrice(p.price)) + '</p>' : ''; return '<div class="cart-row"><img src="' + escapeAttr(safeImage(p.image)) + '" alt="" aria-hidden="true"><div class="cart-row-info"><h3>' + escapeHtml(p.name) + '</h3><p>' + escapeHtml(p.detail) + '</p>' + price + '<div class="quantity-control" aria-label="Quantity for ' + escapeAttr(p.name) + '"><button type="button" data-change="-1" data-id="' + escapeAttr(p.id) + '" aria-label="Remove one ' + escapeAttr(p.name) + '">−</button><span aria-label="Quantity">' + quantity + '</span><button type="button" data-change="1" data-id="' + escapeAttr(p.id) + '" aria-label="Add one ' + escapeAttr(p.name) + '">+</button></div></div></div>'; }
  function updateWhatsAppLink() { var selections = Object.keys(cart).map(function (id) { var p = findProduct(id); return "• " + p.name + " — Qty " + cart[id] + (settings.showPrices && Number(p.price) > 0 ? " — " + formatPrice(p.price) + " each" : ""); }); var message = "Hello " + settings.brand + ", I would like to enquire about these items:\n\n" + selections.join("\n") + "\n\nPlease share availability, colour/size options and final pricing."; orderWhatsapp.href = "https://wa.me/" + settings.whatsapp + "?text=" + encodeURIComponent(message); }
  function renderCustomSections() {
    var host = document.getElementById("customSections");
    host.innerHTML = (settings.customSections || []).filter(function (section) { return section.visible !== false; }).map(function (section) {
      var photo = section.image ? '<div class="admin-custom-photo"><img src="' + escapeAttr(safeImage(section.image)) + '" alt="' + escapeAttr(section.imageAlt || "") + '"></div>' : "";
      var button = section.buttonLabel ? '<a class="button button-primary" href="' + escapeAttr(safeLink(section.buttonLink)) + '">' + escapeHtml(section.buttonLabel) + '</a>' : "";
      return '<section class="admin-custom-section"><div class="shell admin-custom-inner' + (section.image ? ' has-photo' : '') + '">' + photo + '<div class="admin-custom-copy">' + (section.eyebrow ? '<p class="eyebrow">' + escapeHtml(section.eyebrow) + '</p>' : '') + '<h2>' + escapeHtml(section.title || "") + '</h2>' + (section.body ? '<p>' + escapeHtml(section.body) + '</p>' : '') + button + '</div></div></section>';
    }).join("");
  }
  function renderCart() { var ids = Object.keys(cart), count = cartCount(); bagCount.textContent = count; cartButton.setAttribute("aria-label", "Open order enquiry bag with " + count + " item" + (count === 1 ? "" : "s")); if (!ids.length) { cartItems.innerHTML = '<div class="empty-cart"><strong>Your enquiry bag is empty.</strong><p>Choose a piece from the collection and send your request directly to our team.</p></div>'; orderWhatsapp.hidden = true; return; } cartItems.innerHTML = ids.map(function (id) { return cartRow(findProduct(id), cart[id]); }).join(""); orderWhatsapp.hidden = false; updateWhatsAppLink(); }
  function showToast(message) { window.clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("show"); toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2600); }
  function closeMenu() { mobileNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }
  function addToCart(id) { var p = findProduct(id); if (!p) return; cart[id] = (cart[id] || 0) + 1; renderCart(); cartLive.textContent = p.name + " added to your enquiry bag."; showToast(p.name + " added to your enquiry bag"); }
  function changeQuantity(id, amount) { if (!cart[id]) return; cart[id] += amount; if (cart[id] <= 0) delete cart[id]; renderCart(); }
  function openCart() { closeMenu(); cartDrawer.classList.add("open"); cartBackdrop.classList.add("open"); document.body.classList.add("locked"); cartDrawer.setAttribute("aria-hidden", "false"); cartButton.setAttribute("aria-expanded", "true"); cartClose.focus(); }
  function closeCart() { cartDrawer.classList.remove("open"); cartBackdrop.classList.remove("open"); document.body.classList.remove("locked"); cartDrawer.setAttribute("aria-hidden", "true"); cartButton.setAttribute("aria-expanded", "false"); }
  applySettings();
  filters.forEach(function (filter) { filter.addEventListener("click", function () { var selected = this.dataset.filter; filters.forEach(function (button) { button.classList.remove("active"); button.setAttribute("aria-selected", "false"); }); this.classList.add("active"); this.setAttribute("aria-selected", "true"); renderProducts(selected); }); });
  document.querySelectorAll("[data-category-link]").forEach(function (link) { link.addEventListener("click", function () { var filter = filterFor(this.dataset.categoryLink); if (filter) filter.click(); }); });
  productGrid.addEventListener("click", function (event) { var button = event.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
  cartItems.addEventListener("click", function (event) { var button = event.target.closest("[data-change]"); if (button) changeQuantity(button.dataset.id, Number(button.dataset.change)); });
  cartButton.addEventListener("click", openCart); cartClose.addEventListener("click", closeCart); cartBackdrop.addEventListener("click", closeCart);
  menuToggle.addEventListener("click", function () { var open = mobileNav.classList.toggle("open"); menuToggle.setAttribute("aria-expanded", String(open)); });
  mobileNav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") { closeCart(); closeMenu(); } });
  document.getElementById("year").textContent = new Date().getFullYear(); renderProducts("all"); renderCart();
}());

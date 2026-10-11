(function () {
  "use strict";
  var settings = MSTextileSettings.load();
  var state = document.getElementById("saveState");
  var preview = document.querySelector(".preview iframe");
  var passwordKey = "mstextile-admin-password-v1";
  var authGate = document.getElementById("authGate");
  var adminApp = document.getElementById("adminApp");
  var authForm = document.getElementById("authForm");
  var authError = document.getElementById("authError");
  var confirmPasswordWrap = document.getElementById("confirmPasswordWrap");
  var setupMode = !localStorage.getItem(passwordKey);
  function updateAuthView() {
    setupMode = !localStorage.getItem(passwordKey);
    document.getElementById("authTitle").textContent = setupMode ? "Create admin password" : "Admin sign in";
    document.getElementById("authDescription").textContent = setupMode ? "Choose a password to protect this admin panel on this device." : "Enter your admin password to manage the storefront.";
    document.getElementById("authSubmit").textContent = setupMode ? "Set password" : "Sign in";
    document.getElementById("adminPassword").autocomplete = setupMode ? "new-password" : "current-password";
    confirmPasswordWrap.hidden = !setupMode;
    document.getElementById("confirmPassword").required = setupMode;
  }
  function encodeBytes(bytes) { return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes))); }
  function derivePassword(password, salt, iterations) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) return Promise.reject(new Error("Password protection needs a modern browser. Open this folder in VS Code and use Live Server."));
    return crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]).then(function (key) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" }, key, 256);
    }).then(encodeBytes);
  }
  function savePasswordHash(password) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iterations = 120000;
    return derivePassword(password, salt, iterations).then(function (hash) { localStorage.setItem(passwordKey, JSON.stringify({ salt: encodeBytes(salt), hash: hash, iterations: iterations })); });
  }
  function unlockAdmin() { authGate.hidden = true; adminApp.hidden = false; }
  updateAuthView();
  authGate.hidden = false;
  adminApp.hidden = true;
  authForm.addEventListener("submit", function (event) {
    event.preventDefault(); authError.textContent = "";
    var password = document.getElementById("adminPassword").value;
    if (setupMode) {
      if (password.length < 8) { authError.textContent = "Use at least 8 characters for your password."; return; }
      if (password !== document.getElementById("confirmPassword").value) { authError.textContent = "The passwords do not match."; return; }
      savePasswordHash(password).then(function () { unlockAdmin(); }).catch(function (error) { authError.textContent = error.message; });
      return;
    }
    var saved;
    try { saved = JSON.parse(localStorage.getItem(passwordKey)); } catch (error) { saved = null; }
    if (!saved || !saved.salt || !saved.hash) { localStorage.removeItem(passwordKey); updateAuthView(); authError.textContent = "Password settings were invalid. Create a new password."; return; }
    derivePassword(password, Uint8Array.from(atob(saved.salt), function (character) { return character.charCodeAt(0); }), saved.iterations).then(function (hash) {
      if (hash !== saved.hash) { authError.textContent = "That password is not correct."; return; }
      unlockAdmin();
    }).catch(function (error) { authError.textContent = error.message; });
  });
  document.getElementById("logoutButton").addEventListener("click", function () { adminApp.hidden = true; authGate.hidden = false; authForm.reset(); authError.textContent = ""; updateAuthView(); document.getElementById("adminPassword").focus(); });
  function field(label, path, value, type, wide) {
    type = type || "text"; var id = "f-" + path.replace(/[^a-z0-9]/gi, "-");
    var control;
    if (type === "image") control = '<div class="image-control"><img class="upload-preview" data-image-preview="' + path + '" src="' + esc(value || "") + '" alt=""' + (value ? '' : ' hidden') + '><div class="upload-actions"><label class="upload-button" for="' + id + '">Choose image</label><input class="visually-hidden-file" id="' + id + '" type="file" accept="image/*" data-image-path="' + path + '"><span class="upload-hint">JPG, PNG, WebP or another image file</span><button type="button" class="remove-button" data-clear-image="' + path + '"' + (value ? '' : ' hidden') + '>Remove image</button></div></div>';
    else if (type === "textarea") control = '<textarea id="' + id + '" data-path="' + path + '">' + esc(value) + '</textarea>';
    else if (type === "checkbox") control = '<label class="toggle-control"><input id="' + id + '" type="checkbox" data-path="' + path + '"' + (value !== false ? ' checked' : '') + '> Show this section</label>';
    else control = '<input id="' + id + '" type="' + type + '" data-path="' + path + '" value="' + esc(value) + '"' + (type === "color" ? ' data-color="true"' : "") + (type === "number" ? ' min="0" step="0.01"' : "") + '>';
    return '<div class="field' + (wide ? ' wide' : '') + '"><label for="' + id + '">' + label + '</label>' + control + '</div>';
  }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]; }); }
  function inputType(path) { if (/Image$|\.image$/i.test(path)) return "image"; if (/\.price$/i.test(path)) return "number"; return "text"; }
  function textType(path) { return /Description|description|\.detail$|\.alt$|\.text$|\.body$/i.test(path) ? "textarea" : inputType(path); }
  function renderFields(target, definitions) { document.getElementById(target).innerHTML = definitions.map(function (d) { return field(d[0], d[1], get(d[1]), d[2] || textType(d[1]), !!d[3]); }).join(""); }
  function get(path) { return path.split(".").reduce(function (obj, part) { return obj == null ? "" : obj[part]; }, settings); }
  function set(path, value) { var bits = path.split("."), obj = settings; bits.slice(0, -1).forEach(function (part) { obj = obj[part]; }); obj[bits[bits.length - 1]] = value; }
  function renderRepeaters() {
    document.getElementById("categoryList").innerHTML = settings.categories.map(function (item, i) {
      return '<article class="repeat-card"><div class="repeat-head"><strong>Collection card ' + (i + 1) + '</strong><button type="button" class="remove-button" data-remove="categories" data-index="' + i + '">Remove</button></div><div class="field-grid">' + field("Card title", "categories." + i + ".title", item.title) + field("Short label", "categories." + i + ".kicker", item.kicker) + field("Product category key", "categories." + i + ".category", item.category) + field("Card image", "categories." + i + ".image", item.image, "image", true) + field("Image description", "categories." + i + ".alt", item.alt, "textarea", true) + '</div></article>';
    }).join("");
    document.getElementById("productList").innerHTML = settings.products.map(function (item, i) {
      return '<article class="repeat-card"><div class="repeat-head"><strong>Product ' + (i + 1) + ' · ' + esc(item.name || "New product") + '</strong><button type="button" class="remove-button" data-remove="products" data-index="' + i + '">Remove</button></div><div class="field-grid">' + field("Product name", "products." + i + ".name", item.name) + field("Category key", "products." + i + ".category", item.category) + field("Short description", "products." + i + ".detail", item.detail, "textarea") + field("Product tag", "products." + i + ".tag", item.tag) + field("Price", "products." + i + ".price", item.price || 0, "number") + field("Product photo", "products." + i + ".image", item.image, "image", true) + field("Image description", "products." + i + ".alt", item.alt, "textarea", true) + '</div></article>';
    }).join("");
    document.getElementById("productCount").textContent = settings.products.length + " items";
    document.getElementById("customSectionList").innerHTML = (settings.customSections || []).map(function (item, i) {
      return '<article class="repeat-card"><div class="repeat-head"><strong>Storefront section ' + (i + 1) + '</strong><button type="button" class="remove-button" data-remove="customSections" data-index="' + i + '">Remove</button></div><div class="field-grid">' + field("Section label", "customSections." + i + ".eyebrow", item.eyebrow) + field("Heading", "customSections." + i + ".title", item.title) + field("Text", "customSections." + i + ".body", item.body, "textarea", true) + field("Section image", "customSections." + i + ".image", item.image, "image", true) + field("Image description", "customSections." + i + ".imageAlt", item.imageAlt, "textarea", true) + field("Button label (optional)", "customSections." + i + ".buttonLabel", item.buttonLabel) + field("Button link (optional)", "customSections." + i + ".buttonLink", item.buttonLink) + field("Visibility", "customSections." + i + ".visible", item.visible, "checkbox", true) + '</div></article>';
    }).join("");
    document.getElementById("sectionCount").textContent = (settings.customSections || []).length + " sections";
  }
  var fields = {
    homeFields: [["Store name", "brand"], ["Top announcement", "announcement", "textarea", true], ["Hero label", "heroEyebrow"], ["Main headline", "heroTitle", "textarea", true], ["Intro paragraph", "heroDescription", "textarea", true], ["Main button", "heroPrimary"], ["Secondary button", "heroSecondary"], ["Highlight 1", "heroNotes.0"], ["Highlight 2", "heroNotes.1"], ["Highlight 3", "heroNotes.2"], ["Image label", "heroTag"], ["Image caption label", "heroCaptionKicker"], ["Image caption", "heroCaption"], ["Main photo", "heroImage", "image", true], ["Inset photo", "heroInsetImage", "image", true], ["Benefit 1", "benefits.0"], ["Benefit 2", "benefits.1"], ["Benefit 3", "benefits.2"]],
    collectionFields: [["Section label", "collectionsEyebrow"], ["Section heading", "collectionsTitle", "textarea", true], ["Section description", "collectionsDescription", "textarea", true]],
    shopFields: [["Section label", "shopEyebrow"], ["Section heading", "shopTitle", "textarea", true], ["Section description", "shopDescription", "textarea", true], ["All items tab", "filterLabels.all"], ["T-shirts tab", "filterLabels.tees"], ["Polos tab", "filterLabels.polos"], ["Oversized tab", "filterLabels.oversized"], ["Custom print tab", "filterLabels.printed"], ["Currency symbol", "currencySymbol"], ["Display product prices", "showPrices", "checkbox", true], ["Note below products", "productNote", "textarea", true]],
    storyFields: [["Section label", "storyEyebrow"], ["Heading", "storyTitle", "textarea", true], ["Story paragraph", "storyDescription", "textarea", true], ["Fact 1 heading", "storyFact1Title"], ["Fact 1 description", "storyFact1Text", "textarea"], ["Fact 2 heading", "storyFact2Title"], ["Fact 2 description", "storyFact2Text", "textarea"], ["Workshop photo", "storyImage", "image", true]],
    customFields: [["Section label", "customEyebrow"], ["Heading", "customTitle", "textarea", true], ["Description", "customDescription", "textarea", true], ["Service 1", "customItems.0"], ["Service 2", "customItems.1"], ["Service 3", "customItems.2"], ["Service 4", "customItems.3"], ["Button label", "customButton"], ["Photo", "customImage", "image", true]],
    contactFields: [["Section label", "contactEyebrow"], ["Heading", "contactTitle", "textarea", true], ["Description", "contactDescription", "textarea", true], ["WhatsApp number (country code, no +)", "whatsapp"], ["Phone number", "phone"], ["Email", "email"], ["Location", "location"], ["Footer description", "footerDescription", "textarea", true]],
    colorFields: [["Ink", "colors.ink", "color"], ["Deep green", "colors.deepGreen", "color"], ["Moss", "colors.moss", "color"], ["Clay", "colors.clay", "color"], ["Sand", "colors.sand", "color"], ["Cream", "colors.cream", "color"], ["Warm white", "colors.warmWhite", "color"]]
  };
  Object.keys(fields).forEach(function (id) { renderFields(id, fields[id]); }); renderRepeaters();
  function markUnsaved(message) { state.textContent = message || "Unsaved changes"; state.style.color = "#a76530"; }
  document.addEventListener("input", function (event) { var control = event.target.closest("[data-path]"); if (!control) return; var value = control.type === "checkbox" ? control.checked : (control.type === "number" && control.value !== "" ? Number(control.value) : control.value); set(control.dataset.path, value); markUnsaved(); });
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file.type || file.type.indexOf("image/") !== 0) { reject(new Error("Choose an image file.")); return; }
      var objectUrl = URL.createObjectURL(file), image = new Image();
      image.onload = function () {
        var scale = Math.min(1, 1500 / Math.max(image.naturalWidth, image.naturalHeight));
        var canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        var context = canvas.getContext("2d"); context.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(objectUrl);
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error("This image could not be optimized.")); return; }
          var reader = new FileReader(); reader.onload = function () { resolve(reader.result); }; reader.onerror = function () { reject(new Error("This image could not be read.")); }; reader.readAsDataURL(blob);
        }, "image/webp", 0.78);
      };
      image.onerror = function () { URL.revokeObjectURL(objectUrl); reject(new Error("This image file could not be opened.")); };
      image.src = objectUrl;
    });
  }
  document.addEventListener("change", function (event) {
    var control = event.target.closest("[data-image-path]"); if (!control || !control.files || !control.files[0]) return;
    var path = control.dataset.imagePath, previewImage = document.querySelector('[data-image-preview="' + path.replace(/"/g, '\\"') + '"]'), clearButton = document.querySelector('[data-clear-image="' + path.replace(/"/g, '\\"') + '"]');
    state.textContent = "Optimizing image…";
    compressImage(control.files[0]).then(function (dataUrl) { set(path, dataUrl); if (previewImage) { previewImage.src = dataUrl; previewImage.hidden = false; } if (clearButton) clearButton.hidden = false; markUnsaved("Image ready · save changes"); }).catch(function (error) { window.alert(error.message); state.textContent = "Image not changed"; });
  });
  document.addEventListener("click", function (event) {
    var remove = event.target.closest("[data-remove]");
    if (remove) { settings[remove.dataset.remove].splice(Number(remove.dataset.index), 1); renderRepeaters(); state.textContent = "Unsaved changes"; state.style.color = "#a76530"; }
    var clearImage = event.target.closest("[data-clear-image]");
    if (clearImage) { var path = clearImage.dataset.clearImage, imagePreview = document.querySelector('[data-image-preview="' + path.replace(/"/g, '\\"') + '"]'), input = clearImage.parentElement.querySelector("input[type=file]"); set(path, ""); if (imagePreview) { imagePreview.src = ""; imagePreview.hidden = true; } clearImage.hidden = true; if (input) input.value = ""; markUnsaved(); }
  });
  function save() { try { MSTextileSettings.save(settings); state.textContent = "All changes saved"; state.style.color = "#398063"; preview.src = "index.html?preview=" + Date.now(); } catch (error) { state.textContent = "Could not save · browser storage is full"; state.style.color = "#a45140"; window.alert("The browser could not save these settings. Try smaller or fewer uploaded images."); } }
  document.getElementById("saveButton").addEventListener("click", save); document.getElementById("saveBottom").addEventListener("click", save);
  document.getElementById("resetButton").addEventListener("click", function () { if (!window.confirm("Restore all storefront settings to the original defaults?")) return; settings = JSON.parse(JSON.stringify(MSTextileSettings.defaults)); MSTextileSettings.save(settings); window.location.reload(); });
  document.getElementById("addCategory").addEventListener("click", function () { settings.categories.push({ title: "New collection", kicker: "Collection label", category: "tees", image: "", alt: "" }); renderRepeaters(); state.textContent = "Unsaved changes"; });
  document.getElementById("addProduct").addEventListener("click", function () { settings.products.push({ id: "product-" + Date.now(), name: "New product", detail: "Add a short description", category: "tees", tag: "New", price: 0, image: "", alt: "" }); renderRepeaters(); markUnsaved(); });
  document.getElementById("addCustomSection").addEventListener("click", function () { settings.customSections.push({ id: "section-" + Date.now(), eyebrow: "New section", title: "Section heading", body: "Add your text here.", image: "", imageAlt: "", buttonLabel: "", buttonLink: "#shop", visible: true }); renderRepeaters(); markUnsaved(); });
}());

(function () {
  "use strict";
  var key = "mstextile-site-settings-v1";
  var defaults = {
    brand: "MS TEXTILE",
    announcement: "Retail & custom apparel orders • Talk to us directly on WhatsApp",
    heroEyebrow: "Made for everyday",
    heroTitle: "Clothes that feel as good as they look.",
    heroDescription: "Thoughtful essentials, easy silhouettes and custom pieces made by MS TEXTILE in Kolkata — designed to become part of your daily rotation.",
    heroPrimary: "Shop the collection",
    heroSecondary: "Custom & bulk orders",
    heroNotes: ["Kolkata-made", "Direct support", "Order on WhatsApp"],
    heroTag: "The new everyday edit",
    heroCaptionKicker: "Designed to live in",
    heroCaption: "Easy layers, elevated.",
    heroImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88",
    heroInsetImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=84",
    benefits: ["Direct help before you order", "Retail, gifting & custom orders", "Send your order request in minutes"],
    collectionsEyebrow: "Find your everyday",
    collectionsTitle: "Built around the pieces you reach for most.",
    collectionsDescription: "Easy-to-style clothing, made for individual orders and thoughtfully produced custom runs.",
    categories: [
      { title: "Classic Tees", kicker: "Everyday essential", category: "tees", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=84", alt: "Model wearing a relaxed light-coloured T-shirt" },
      { title: "Polo Edit", kicker: "Smart casual", category: "polos", image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=84", alt: "A person wearing a crisp polo shirt" },
      { title: "Oversized", kicker: "Relaxed fit", category: "oversized", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=84", alt: "Person in an oversized neutral outfit" },
      { title: "Custom Print", kicker: "Made for your brief", category: "printed", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=84", alt: "Fashion clothing arranged in a design studio" }
    ],
    shopEyebrow: "The MS edit",
    shopTitle: "Choose your next everyday favourite.",
    shopDescription: "Add pieces to your enquiry bag and we’ll confirm availability, colours, sizes and your final price directly.",
    filterLabels: { all: "All pieces", tees: "T-shirts", polos: "Polos", oversized: "Oversized", printed: "Custom print" },
    productNote: "Every item is added as an enquiry. MS TEXTILE will confirm current availability and pricing before your order is finalised.",
    currencySymbol: "₹",
    showPrices: true,
    products: [
      { id: "everyday-tee", name: "Everyday Crew Tee", detail: "Classic crew neck · easy fit", category: "tees", tag: "Core essential", price: 0, image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=900&q=84", alt: "A plain black crew neck T-shirt" },
      { id: "signature-polo", name: "Signature Piqué Polo", detail: "Polished collar · versatile wear", category: "polos", tag: "Smart casual", price: 0, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=84", alt: "A neatly folded light-coloured polo shirt" },
      { id: "relaxed-tee", name: "Relaxed Fit Tee", detail: "Roomy silhouette · laid-back feel", category: "oversized", tag: "Relaxed fit", price: 0, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=84", alt: "A relaxed casual T-shirt on a clothes hanger" },
      { id: "studio-graphic", name: "Studio Graphic Tee", detail: "Your artwork · print-ready base", category: "printed", tag: "Custom print", price: 0, image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=84", alt: "A person wearing a white graphic T-shirt" },
      { id: "minimal-tee", name: "Minimal Pocket Tee", detail: "Simple detail · daily staple", category: "tees", tag: "New edit", price: 0, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=84", alt: "A person wearing a clean white casual T-shirt" },
      { id: "heritage-polo", name: "Heritage Polo", detail: "Textured knit · refined finish", category: "polos", tag: "Polo edit", price: 0, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=84", alt: "A person in a casual polo shirt" }
    ],
    customSections: [],
    storyEyebrow: "From Kolkata, with care",
    storyTitle: "Direct from our workshop to your wardrobe.",
    storyDescription: "MS TEXTILE brings together the care of a local apparel maker with a simpler way to order. Whether you are choosing one everyday piece or planning a larger run, our team is here to guide the details.",
    storyFact1Title: "For everyday", storyFact1Text: "Timeless silhouettes designed to be worn often.",
    storyFact2Title: "For your idea", storyFact2Text: "Custom apparel support for groups, events and teams.",
    storyImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1300&q=86",
    customEyebrow: "Beyond the collection",
    customTitle: "Made to carry your story.",
    customDescription: "Have a logo, event, team or retail idea in mind? Let us know what you need and our team will help shape the right custom apparel order.",
    customItems: ["Corporate & team wear", "Event & gifting orders", "DTF & sublimation prints", "Bulk garment enquiries"],
    customButton: "Start a custom order",
    customImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1100&q=86",
    contactEyebrow: "Let’s make it easy",
    contactTitle: "Tell us what you are looking for.",
    contactDescription: "Send an enquiry and the MS TEXTILE team will get back to you about product availability, custom requirements or bulk orders.",
    whatsapp: "918910458018",
    phone: "+917439024036",
    email: "mstextileindia.co@gmail.com",
    location: "Kolkata, West Bengal, India",
    footerDescription: "Everyday clothing and custom apparel, made with care in Kolkata.",
    colors: { ink: "#172523", deepGreen: "#163631", moss: "#31574f", clay: "#b85e42", sand: "#e7d4b8", cream: "#f7f5ef", warmWhite: "#fdfcf9" }
  };
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function load() {
    try {
      var stored = JSON.parse(localStorage.getItem(key));
      if (stored && typeof stored === "object") return Object.assign(clone(defaults), stored);
    } catch (error) { /* Ignore invalid browser storage and use defaults. */ }
    return clone(defaults);
  }
  window.MSTextileSettings = { key: key, defaults: defaults, load: load, save: function (settings) { localStorage.setItem(key, JSON.stringify(settings)); } };
}());

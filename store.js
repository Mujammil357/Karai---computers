
const API_URL = "/api/products";
const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("storeMessage");

let products = [];
let selectedCategory = "All";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderProducts() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = products.filter(product => {
    const name = (product.name || product.title || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    const description = (product.description || "").toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      category.includes(search) ||
      description.includes(search);

    const matchesCategory =
      selectedCategory === "All" ||
      category.includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">No products found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const name = product.name || product.title || "Product";
    const category = product.category || "Product";
    const description = product.description || "Contact us for more details.";
    const price = product.price ?? product.displayed_price;
    const image = product.image || product.imageUrl || product.photo || "";

    const priceText = price !== undefined && price !== null && price !== ""
      ? "₹" + Number(price).toLocaleString("en-IN")
      : "Contact for price";

    const whatsappText = encodeURIComponent(
      `Hi Karai Computers, I am interested in ${name}. Please share the details.`
    );

    return `
      <article class="product-card">
        <div class="product-image">
          ${
            image
              ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}"
                   onerror="this.style.display='none'">`
              : `<div class="product-placeholder">💻</div>`
          }
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(category)}</span>
          <h3>${escapeHTML(name)}</h3>
          <p class="product-desc">${escapeHTML(description)}</p>
          <div class="product-bottom">
            <span class="price">${escapeHTML(priceText)}</span>
            <a class="enquire"
               href="https://wa.me/919750817586?text=${whatsappText}"
               target="_blank" rel="noopener">Enquire ↗</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    products = Array.isArray(data) ? data : (data.products || []);
    message.textContent = "";
    renderProducts();
  } catch (error) {
    grid.innerHTML = `
      <div class="empty">
        Products are currently unavailable.
        Please contact Karai Computers for details.
      </div>`;
    message.textContent =
      "Product server is not connected. Please try again later.";
  }
}

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll(".filter, .category-card").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category || "All";

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.category === selectedCategory
      );
    });

    renderProducts();
    document.getElementById("products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

loadProducts();

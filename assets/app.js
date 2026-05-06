let artworks = [];
let activeFilter = "all";

const gallery = document.querySelector("[data-gallery]");
const filterBar = document.querySelector("[data-filters]");
const modal = document.querySelector("[data-modal]");
const menu = document.querySelector("[data-menu]");
const menuButton = document.querySelector("[data-menu-button]");


function categoryLabel(category) {
  const labels = {
    pintura: "Pintura",
    serie: "Série",
    escultura: "Escultura"
  };

  return labels[category] || category || "Obra";
}

function renderFilters() {
  const categories = [...new Set(artworks.map((item) => item.category).filter(Boolean))];
  const filters = [{ label: "Destaques", value: "featured" }].concat(
  categories.map((category) => ({
    label: categoryLabel(category),
    value: category
  }))
);
return filters;

function getFilteredArtworks(selectedFilter) {

  if (selectedFilter === "featured") {
    return artworks.filter(item => item.featured);
  }

  return artworks.filter(item => item.category === selectedFilter);
}

  filterBar.innerHTML = filters
    .map(
      (filter) => `
        <button class="${activeFilter === filter.value ? "active" : ""}" type="button" data-filter="${filter.value}">
          ${filter.label}
        </button>
      `
    )
    .join("");
}

function renderGallery(filter = "all") {
  activeFilter = filter;
  renderFilters();

  const filtered = filter === "all" ? artworks : artworks.filter((item) => item.category === filter);

  if (!filtered.length) {
    gallery.innerHTML = '<p class="gallery-empty">Nenhuma obra cadastrada nesta categoria.</p>';
    return;
  }

  gallery.innerHTML = filtered
    .map(
      (item) => `
        <article class="art-card reveal" style="--ratio: ${item.ratio || "3 / 4"}" data-artwork="${item.id}" tabindex="0">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <div class="art-info">
            <h3>${item.title}</h3>
            <p>${item.technique} · ${item.year}</p>
          </div>
        </article>
      `
    )
    .join("");

  observeReveals();
}

function openModal(item) {
  modal.querySelector("[data-modal-image]").src = item.image;
  modal.querySelector("[data-modal-image]").alt = item.title;
  modal.querySelector("[data-modal-category]").textContent = categoryLabel(item.category);
  modal.querySelector("[data-modal-title]").textContent = item.title;
  modal.querySelector("[data-modal-technique]").textContent = item.technique;
  modal.querySelector("[data-modal-year]").textContent = item.year;
  modal.querySelector("[data-modal-size]").textContent = item.size;
  modal.querySelector("[data-modal-description]").textContent = item.description;

  const message = encodeURIComponent(
    `Olá! Tenho interesse na obra "${item.title}". Gostaria de mais informações.`
  );
  modal.querySelector("[data-modal-whatsapp]").href = `https://wa.me/5500000000000?text=${message}`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function observeReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal:not(.visible)").forEach((element) => {
    observer.observe(element);
  });
}

async function loadArtworks() {
  try {
    const response = await fetch("./data/artworks.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível carregar data/artworks.json");
    artworks = await response.json();
    renderGallery();
  } catch (error) {
    gallery.innerHTML = `
      <p class="gallery-empty">
        Não foi possível carregar as obras. Verifique o arquivo data/artworks.json.
      </p>
    `;
    console.error(error);
  }
}

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  renderGallery(button.dataset.filter);
});

gallery.addEventListener("click", (event) => {
  const card = event.target.closest("[data-artwork]");
  if (!card) return;
  const item = artworks.find((artwork) => artwork.id === Number(card.dataset.artwork));
  if (item) openModal(item);
});

gallery.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const card = event.target.closest("[data-artwork]");
  if (!card) return;
  const item = artworks.find((artwork) => artwork.id === Number(card.dataset.artwork));
  if (item) openModal(item);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

menuButton.addEventListener("click", () => {
  menu.classList.toggle("open");
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => menu.classList.remove("open"));
});

loadArtworks();
observeReveals();

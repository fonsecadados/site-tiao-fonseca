const artworks = [
  {
    id: 1,
    title: "Paisagem de Dentro",
    category: "pintura",
    image: "./assets/images/work-1.png",
    technique: "Acrílico e técnica mista",
    year: "2024",
    size: "90 x 120 cm",
    ratio: "4 / 5",
    description:
      "Camadas terrosas e gestos largos evocam uma paisagem emocional entre memória, matéria e silêncio."
  },
  {
    id: 2,
    title: "Terra em Suspensão",
    category: "serie",
    image: "./assets/images/work-2.png",
    technique: "Óleo sobre tela",
    year: "2023",
    size: "80 x 100 cm",
    ratio: "1 / 1",
    description:
      "Uma composição de contraste quente, criada para sugerir profundidade sem abandonar a força do gesto."
  },
  {
    id: 3,
    title: "Memória Mineral",
    category: "pintura",
    image: "./assets/images/work-3.png",
    technique: "Técnica mista sobre tela",
    year: "2024",
    size: "70 x 110 cm",
    ratio: "3 / 4",
    description:
      "Textura densa, paleta mineral e movimento circular em diálogo com a tradição da pintura matérica."
  },
  {
    id: 4,
    title: "Cidade Antiga",
    category: "serie",
    image: "./assets/images/work-4.png",
    technique: "Acrílico sobre tela",
    year: "2022",
    size: "100 x 140 cm",
    ratio: "5 / 4",
    description:
      "Arquitetura, corpo e lembrança se cruzam em uma superfície que parece escavada pela cor."
  },
  {
    id: 5,
    title: "Rastro do Gesto",
    category: "pintura",
    image: "./assets/images/work-5.png",
    technique: "Óleo e espátula",
    year: "2025",
    size: "60 x 90 cm",
    ratio: "4 / 3",
    description:
      "Obra de ritmo intenso, pensada para aproximar o olhar do observador da mão que constrói a imagem."
  }
];

const gallery = document.querySelector("[data-gallery]");
const filterButtons = document.querySelectorAll("[data-filter]");
const modal = document.querySelector("[data-modal]");
const menu = document.querySelector("[data-menu]");
const menuButton = document.querySelector("[data-menu-button]");

function renderGallery(filter = "all") {
  const filtered = filter === "all" ? artworks : artworks.filter((item) => item.category === filter);

  gallery.innerHTML = filtered
    .map(
      (item) => `
        <article class="art-card reveal" style="--ratio: ${item.ratio}" data-artwork="${item.id}" tabindex="0">
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
  modal.querySelector("[data-modal-category]").textContent =
    item.category === "pintura" ? "Pintura" : "Série";
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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderGallery(button.dataset.filter);
  });
});

gallery.addEventListener("click", (event) => {
  const card = event.target.closest("[data-artwork]");
  if (!card) return;
  const item = artworks.find((artwork) => artwork.id === Number(card.dataset.artwork));
  openModal(item);
});

gallery.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const card = event.target.closest("[data-artwork]");
  if (!card) return;
  const item = artworks.find((artwork) => artwork.id === Number(card.dataset.artwork));
  openModal(item);
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

renderGallery();
observeReveals();

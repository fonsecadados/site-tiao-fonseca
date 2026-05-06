const form = document.querySelector("[data-artwork-form]");
const formTitle = document.querySelector("[data-form-title]");
const list = document.querySelector("[data-artwork-list]");
const count = document.querySelector("[data-count]");
const output = document.querySelector("[data-json-output]");
const statusMessage = document.querySelector("[data-status]");
const submitButton = document.querySelector("[data-submit-button]");

let artworks = [];

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.dataset.type = type;
}

function categoryLabel(category) {
  const labels = {
    pintura: "Pintura",
    serie: "Série",
    escultura: "Escultura"
  };
  return labels[category] || category;
}

function updateJsonOutput() {
  output.value = JSON.stringify(artworks, null, 2);
}

function renderList() {
  count.textContent = artworks.length;

  if (!artworks.length) {
    list.innerHTML = '<p class="helper-text">Nenhuma obra cadastrada ainda.</p>';
    updateJsonOutput();
    return;
  }

  list.innerHTML = artworks
    .map(
      (item) => `
        <article class="admin-artwork-card">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='./assets/images/hero.png'">
          <div>
            <h3>${item.title}</h3>
            <p>${categoryLabel(item.category)} · ${item.technique} · ${item.year}</p>
            <p>${item.size}</p>
          </div>
          <div class="card-actions">
            <button class="secondary-button" type="button" data-edit="${item.id}">Editar</button>
            <button class="danger-button" type="button" data-delete="${item.id}">Excluir</button>
          </div>
        </article>
      `
    )
    .join("");

  updateJsonOutput();
}

function clearForm() {
  form.reset();
  form.elements.id.value = "";
  formTitle.textContent = "Adicionar obra";
  submitButton.textContent = "Salvar obra";
}

function fillForm(item) {
  form.elements.id.value = item.id;
  form.elements.title.value = item.title;
  form.elements.category.value = item.category;
  form.elements.image.value = item.image;
  form.elements.technique.value = item.technique;
  form.elements.year.value = item.year;
  form.elements.size.value = item.size;
  form.elements.ratio.value = item.ratio;
  form.elements.description.value = item.description;
  formTitle.textContent = "Editar obra";
  submitButton.textContent = "Atualizar obra";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao comunicar com o servidor.");
  }

  if (response.status === 204) return null;
  return response.json();
}

async function uploadImageIfNeeded(rawData) {
  const file = form.elements.imageFile.files[0];
  if (!file) return rawData.image.trim();

  const uploadData = new FormData();
  uploadData.append("imageFile", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: uploadData
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao enviar imagem.");
  }

  const result = await response.json();
  return result.image;
}

function formToArtwork(imagePath) {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    id: data.id ? Number(data.id) : undefined,
    title: data.title.trim(),
    category: data.category,
    image: imagePath,
    technique: data.technique.trim(),
    year: data.year.trim(),
    size: data.size.trim(),
    ratio: data.ratio || "4 / 5",
    description: data.description.trim()
  };
}

async function loadArtworks() {
  artworks = await requestJson("/api/artworks");
  renderList();
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(artworks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "artworks.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function copyJson() {
  await navigator.clipboard.writeText(JSON.stringify(artworks, null, 2));
  setStatus("JSON copiado para a area de transferencia.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  setStatus("Salvando obra...", "info");

  try {
    const rawData = Object.fromEntries(new FormData(form).entries());
    const imagePath = await uploadImageIfNeeded(rawData);
    const artwork = formToArtwork(imagePath);
    const id = form.elements.id.value;

    if (id) {
      await requestJson(`/api/artworks/${id}`, {
        method: "PUT",
        body: JSON.stringify(artwork)
      });
      setStatus("Obra atualizada com sucesso.", "success");
    } else {
      await requestJson("/api/artworks", {
        method: "POST",
        body: JSON.stringify(artwork)
      });
      setStatus("Obra cadastrada com sucesso.", "success");
    }

    clearForm();
    await loadArtworks();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

list.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const item = artworks.find((artwork) => Number(artwork.id) === Number(editButton.dataset.edit));
    if (item) fillForm(item);
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    setStatus("Excluindo obra...", "info");
    try {
      await requestJson(`/api/artworks/${id}`, { method: "DELETE" });
      await loadArtworks();
      setStatus("Obra excluida com sucesso.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }
});

document.querySelector("[data-clear-form]").addEventListener("click", clearForm);
document.querySelector("[data-export-json]").addEventListener("click", downloadJson);
document.querySelector("[data-copy-json]").addEventListener("click", copyJson);

document.querySelector("[data-import-json]").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("O JSON precisa ser uma lista de obras.");

      for (const item of imported) {
        await requestJson(item.id ? `/api/artworks/${item.id}` : "/api/artworks", {
          method: item.id ? "PUT" : "POST",
          body: JSON.stringify(item)
        }).catch(async () => {
          await requestJson("/api/artworks", {
            method: "POST",
            body: JSON.stringify({ ...item, id: undefined })
          });
        });
      }

      await loadArtworks();
      setStatus("JSON importado e salvo no servidor.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
  reader.readAsText(file);
});

loadArtworks()
  .then(() => setStatus("Pronto para cadastrar obras.", "success"))
  .catch((error) => setStatus(error.message, "error"));

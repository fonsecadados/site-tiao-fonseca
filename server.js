const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const imagesDir = path.join(rootDir, "assets", "images");
const artworksPath = path.join(dataDir, "artworks.json");

async function ensureProjectDirs() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
}

async function readArtworks() {
  try {
    const content = await fs.readFile(artworksPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeArtworks(artworks) {
  await ensureProjectDirs();
  await fs.writeFile(artworksPath, `${JSON.stringify(artworks, null, 2)}\n`, "utf8");
}

function nextId(artworks) {
  return artworks.length ? Math.max(...artworks.map((item) => Number(item.id) || 0)) + 1 : 1;
}

function normalizeArtwork(raw, fallbackId) {
  return {
    id: Number(raw.id) || fallbackId,
    title: String(raw.title || "").trim(),
    category: String(raw.category || "pintura").trim(),
    image: String(raw.image || "").trim(),
    technique: String(raw.technique || "").trim(),
    year: String(raw.year || "").trim(),
    size: String(raw.size || "").trim(),
    ratio: String(raw.ratio || "4 / 5").trim(),
    description: String(raw.description || "").trim()
  };
}

function validateArtwork(artwork) {
  const required = ["title", "category", "image", "technique", "year", "size", "description"];
  const missing = required.filter((field) => !artwork[field]);
  return missing.length ? `Campos obrigatorios ausentes: ${missing.join(", ")}` : null;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, imagesDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    const basename = slugify(path.basename(file.originalname, extension)) || "obra";
    callback(null, `${Date.now()}-${basename}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Envie apenas arquivos de imagem."));
      return;
    }
    callback(null, true);
  }
});

// 🔥 REDIRECT PARA WWW
app.use((req, res, next) => {
  const host = req.headers.host;

  // evita loop infinito
  if (host && !host.startsWith("www.")) {
    return res.redirect(301, `https://www.${host}${req.url}`);
  }

  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir, { extensions: ["html"] }));

app.get("/api/artworks", async (req, res, next) => {
  try {
    res.json(await readArtworks());
  } catch (error) {
    next(error);
  }
});

app.post("/api/artworks", async (req, res, next) => {
  try {
    const artworks = await readArtworks();
    const artwork = normalizeArtwork(req.body, nextId(artworks));
    const validationError = validateArtwork(artwork);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    artworks.push(artwork);
    await writeArtworks(artworks);
    res.status(201).json(artwork);
  } catch (error) {
    next(error);
  }
});

app.put("/api/artworks/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const artworks = await readArtworks();
    const index = artworks.findIndex((item) => Number(item.id) === id);

    if (index === -1) {
      res.status(404).json({ error: "Obra nao encontrada." });
      return;
    }

    const artwork = normalizeArtwork({ ...req.body, id }, id);
    const validationError = validateArtwork(artwork);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    artworks[index] = artwork;
    await writeArtworks(artworks);
    res.json(artwork);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/artworks/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const artworks = await readArtworks();
    const nextArtworks = artworks.filter((item) => Number(item.id) !== id);

    if (nextArtworks.length === artworks.length) {
      res.status(404).json({ error: "Obra nao encontrada." });
      return;
    }

    await writeArtworks(nextArtworks);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/upload", upload.single("imageFile"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Nenhuma imagem enviada." });
    return;
  }

  res.status(201).json({
    image: `./assets/images/${req.file.filename}`
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Erro interno do servidor." });
});

ensureProjectDirs()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Site rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

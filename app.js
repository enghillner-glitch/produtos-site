const config = window.APP_CONFIG;
const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

const localStorageKey = "produtos-site-products";
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const form = document.querySelector("#productForm");
const productIdInput = document.querySelector("#productId");
const nameInput = document.querySelector("#name");
const descriptionInput = document.querySelector("#description");
const priceInput = document.querySelector("#price");
const imageInput = document.querySelector("#image");
const preview = document.querySelector("#imagePreview");
const grid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const template = document.querySelector("#productCardTemplate");
const submitButton = document.querySelector("#submitButton");
const cancelButton = document.querySelector("#cancelButton");
const clearFormButton = document.querySelector("#clearFormButton");
const searchInput = document.querySelector("#search");
const totalProducts = document.querySelector("#totalProducts");
const storageStatus = document.querySelector("#storageStatus");

let products = [];
let selectedImageData = "";

storageStatus.textContent = hasSupabaseConfig
  ? "Supabase ativo"
  : "Banco local ativo";

init();

async function init() {
  bindEvents();
  await loadProducts();
  renderProducts();
}

function bindEvents() {
  form.addEventListener("submit", handleSubmit);
  imageInput.addEventListener("change", handleImageChange);
  cancelButton.addEventListener("click", resetForm);
  clearFormButton.addEventListener("click", resetForm);
  searchInput.addEventListener("input", renderProducts);
}

async function loadProducts() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from(config.productsTable)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(`Erro ao carregar produtos: ${error.message}`);
      products = [];
      return;
    }

    products = data ?? [];
    return;
  }

  products = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
}

async function saveLocalProducts() {
  localStorage.setItem(localStorageKey, JSON.stringify(products));
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = productIdInput.value;
  const imageUrl = await resolveImageUrl(id);
  const product = {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    price: Number(priceInput.value),
    image_url: imageUrl
  };

  if (!product.name || !product.description || Number.isNaN(product.price)) {
    alert("Preencha nome, descrição e preço.");
    return;
  }

  if (supabaseClient) {
    await saveSupabaseProduct(id, product);
  } else {
    await saveBrowserProduct(id, product);
  }

  resetForm();
  await loadProducts();
  renderProducts();
}

async function saveBrowserProduct(id, product) {
  if (id) {
    products = products.map((item) =>
      item.id === id ? { ...item, ...product, updated_at: new Date().toISOString() } : item
    );
  } else {
    products.unshift({
      ...product,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    });
  }

  await saveLocalProducts();
}

async function saveSupabaseProduct(id, product) {
  const query = id
    ? supabaseClient.from(config.productsTable).update(product).eq("id", id)
    : supabaseClient.from(config.productsTable).insert(product);

  const { error } = await query;

  if (error) {
    alert(`Erro ao salvar produto: ${error.message}`);
  }
}

async function resolveImageUrl(id) {
  if (!selectedImageData) {
    const existing = products.find((product) => product.id === id);
    return existing?.image_url || "";
  }

  if (!supabaseClient) {
    return selectedImageData;
  }

  const file = imageInput.files?.[0];
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseClient.storage
    .from(config.storageBucket)
    .upload(path, file, { upsert: false });

  if (error) {
    alert(`Erro ao enviar imagem: ${error.message}`);
    return "";
  }

  const { data } = supabaseClient.storage.from(config.storageBucket).getPublicUrl(path);
  return data.publicUrl;
}

function handleImageChange() {
  const file = imageInput.files?.[0];

  if (!file) {
    selectedImageData = "";
    renderPreview("");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    selectedImageData = String(reader.result);
    renderPreview(selectedImageData);
  });
  reader.readAsDataURL(file);
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const text = `${product.name} ${product.description}`.toLowerCase();
    return text.includes(term);
  });

  grid.innerHTML = "";
  emptyState.classList.toggle("is-visible", visibleProducts.length === 0);
  totalProducts.textContent = `${products.length} ${products.length === 1 ? "produto" : "produtos"}`;

  for (const product of visibleProducts) {
    const card = template.content.firstElementChild.cloneNode(true);
    const image = card.querySelector(".product-image");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const price = card.querySelector("strong");

    if (product.image_url) {
      const img = document.createElement("img");
      img.src = product.image_url;
      img.alt = product.name;
      image.appendChild(img);
    } else {
      image.textContent = "Sem imagem";
    }

    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = currency.format(product.price || 0);

    card.querySelector(".edit-button").addEventListener("click", () => editProduct(product));
    card.querySelector(".delete-button").addEventListener("click", () => deleteProduct(product));
    grid.appendChild(card);
  }
}

function editProduct(product) {
  productIdInput.value = product.id;
  nameInput.value = product.name;
  descriptionInput.value = product.description;
  priceInput.value = product.price;
  selectedImageData = "";
  imageInput.value = "";
  submitButton.textContent = "Atualizar produto";
  renderPreview(product.image_url);
  nameInput.focus();
}

async function deleteProduct(product) {
  const confirmed = confirm(`Apagar o produto "${product.name}"?`);

  if (!confirmed) {
    return;
  }

  if (supabaseClient) {
    const { error } = await supabaseClient
      .from(config.productsTable)
      .delete()
      .eq("id", product.id);

    if (error) {
      alert(`Erro ao apagar produto: ${error.message}`);
      return;
    }
  } else {
    products = products.filter((item) => item.id !== product.id);
    await saveLocalProducts();
  }

  await loadProducts();
  renderProducts();
}

function resetForm() {
  form.reset();
  productIdInput.value = "";
  selectedImageData = "";
  submitButton.textContent = "Salvar produto";
  renderPreview("");
}

function renderPreview(imageUrl) {
  preview.innerHTML = "";

  if (!imageUrl) {
    const placeholder = document.createElement("span");
    placeholder.textContent = "Sem imagem selecionada";
    preview.appendChild(placeholder);
    return;
  }

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Prévia da imagem";
  preview.appendChild(img);
}

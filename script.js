/* ============================================================
   script.js — Biblioteca Pessoal
   ============================================================

   COMO ADICIONAR LIVROS:
   ─────────────────────
   1. Coloque o arquivo (PDF ou EPUB) na pasta /books/
      Exemplo: /books/duna.pdf

   2. Coloque a capa (JPG, PNG ou WEBP) na pasta /covers/
      Exemplo: /covers/duna.jpg
      Se não tiver capa, deixe o campo "capa" como "" (string vazia).

   3. Adicione um novo objeto ao array LIVROS abaixo.
      Copie o modelo e preencha os campos.

   MODELO DE LIVRO:
   ─────────────────
   {
     titulo:    "Nome do Livro",          // Título exibido no card
     autor:     "Nome do Autor",          // Autor(a)
     descricao: "Breve descrição...",     // Até 2 linhas visíveis
     categoria: "Romance",               // Veja CATEGORIAS abaixo
     capa:      "nome-do-arquivo.jpg",   // Só o nome, sem o caminho
     arquivo:   "nome-do-arquivo.pdf",   // Só o nome, sem o caminho
   }

   CATEGORIAS DISPONÍVEIS:
   ───────────────────────
   Edite o array CATEGORIAS para adicionar ou remover categorias.
   A categoria "Todos" é gerada automaticamente — não precisa incluir.

   ============================================================ */


/* ── 1. CATEGORIAS ──────────────────────────────────────────── */
/*
   Adicione ou remova categorias conforme sua coleção.
   Use exatamente o mesmo texto nos campos "categoria" dos livros.
*/
const CATEGORIAS = [
  "Mangá",
  "Romance",
  "Fantasia",
  "Ficção Científica",
  "Terror",
  "Clássico",
  "HQ",
  "Não-ficção",
];


/* ── 2. ACERVO DE LIVROS ────────────────────────────────────── */
/*
   Adicione seus livros aqui.
   Cada {} é um livro. Separe com vírgulas.
*/
const LIVROS = [
  {
    titulo:    "Assombrando Adeline",
    autor:     "H.D Carlton",
    descricao: " A história acompanha a escritora Adeline Reilly, que herda a misteriosa mansão de sua avó em Washington, onde passa a ser alvo da obsessão de Zade Meadows, um vigilante sombrio e justiceiro.",
    categoria: "Romance",
    capa:      "assombrando-adeline.png",         // coloque a imagem em /covers/assombrando-adeline.jpg
    arquivo:   "assombrando-adeline.pdf",         // coloque o PDF em /books/assombrando-adeline.pdf
  },

   {
     titulo:    "Perseguindo Adeline",          // Título exibido no card
     autor:     "H.D Carlton",          // Autor(a)
     descricao: "A continuação da história de Adeline Reilly, que enfrenta novos desafios em sua jornada.",     // Até 2 linhas visíveis
     categoria: "Romance",               // Veja CATEGORIAS abaixo
     capa:      "perseguindo-adeline.png",   // Só o nome, sem o caminho
     arquivo:   "perseguindo-adeline.pdf",   // Só o nome, sem o caminho
   },

   {
     titulo:    "Nome do Livro",          // Título exibido no card
     autor:     "Nome do Autor",          // Autor(a)
     descricao: "Breve descrição...",     // Até 2 linhas visíveis
     categoria: "Romance",               // Veja CATEGORIAS abaixo
     capa:      "nome-do-arquivo.jpg",   // Só o nome, sem o caminho
     arquivo:   "nome-do-arquivo.pdf",   // Só o nome, sem o caminho
   }


];


/* ============================================================
   ── A partir daqui você não precisa editar nada ──
   O código abaixo gerencia a interface automaticamente.
   ============================================================ */


/* ── Referências ao DOM ─────────────────────────────────────── */
const bookGrid      = document.getElementById("book-grid");
const emptyState    = document.getElementById("empty-state");
const searchInput   = document.getElementById("search-input");
const searchClear   = document.getElementById("search-clear");
const filterWrapper = document.getElementById("filter-wrapper");
const bookCount     = document.getElementById("book-count");
const epubModal     = document.getElementById("epub-modal");
const modalTitle    = document.getElementById("modal-title");
const modalClose    = document.getElementById("modal-close");
const epubDownBtn   = document.getElementById("epub-download-btn");


/* ── Estado da aplicação ────────────────────────────────────── */
let categoriaAtiva = "Todos";
let termoBusca     = "";
let epubArquivoAtual = "";   // guarda o arquivo EPUB para download no modal


/* ── Inicialização ──────────────────────────────────────────── */
function init() {
  renderFiltros();
  renderLivros();
  bindEventos();
}


/* ── Renderiza os botões de filtro por categoria ────────────── */
function renderFiltros() {
  const todasCategorias = ["Todos", ...CATEGORIAS];

  filterWrapper.innerHTML = todasCategorias.map(cat => `
    <button
      class="filter-btn ${cat === categoriaAtiva ? "active" : ""}"
      data-categoria="${cat}"
      aria-pressed="${cat === categoriaAtiva}"
    >
      ${cat}
    </button>
  `).join("");

  /* Clique nos filtros */
  filterWrapper.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaAtiva = btn.dataset.categoria;
      /* Atualiza estado visual de todos os botões */
      filterWrapper.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.categoria === categoriaAtiva);
        b.setAttribute("aria-pressed", b.dataset.categoria === categoriaAtiva);
      });
      renderLivros();
    });
  });
}


/* ── Filtra os livros com base na busca e categoria ─────────── */
function getLivrosFiltrados() {
  const termo = termoBusca.toLowerCase().trim();

  return LIVROS.filter(livro => {
    /* Filtro de categoria */
    const categoriaOk =
      categoriaAtiva === "Todos" || livro.categoria === categoriaAtiva;

    /* Filtro de busca (título ou autor) */
    const buscaOk =
      !termo ||
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo);

    return categoriaOk && buscaOk;
  });
}


/* ── Detecta o tipo de arquivo (PDF ou EPUB) ────────────────── */
function getTipoArquivo(nomeArquivo) {
  const ext = nomeArquivo.split(".").pop().toLowerCase();
  return ext === "pdf" ? "PDF" : "EPUB";
}


/* ── Gera o HTML de um card de livro ────────────────────────── */
function criarCardHTML(livro, indice) {
  const tipo = getTipoArquivo(livro.arquivo);

  /* Caminho da capa (relativo à raiz do projeto) */
  const capaSrc = livro.capa ? `covers/${livro.capa}` : null;

  /* HTML da capa ou placeholder */
  const capaHTML = capaSrc
    ? `<img
         class="book-cover"
         src="${capaSrc}"
         alt="Capa de ${livro.titulo}"
         loading="lazy"
         onerror="this.parentElement.innerHTML = placeholderHTML('${livro.titulo}')"
       />`
    : `<div class="book-cover-placeholder">
         <span class="cover-placeholder-icon">◈</span>
         <span class="cover-placeholder-text">${livro.titulo}</span>
       </div>`;

  /* Atraso de animação escalonado */
  const delay = `animation-delay: ${indice * 50}ms`;

  return `
    <article class="book-card" style="${delay}" data-index="${indice}">
      <div class="book-cover-wrapper">
        ${capaHTML}
        <span class="book-type-badge">${tipo}</span>
      </div>
      <div class="book-body">
        <span class="book-category">${livro.categoria}</span>
        <h2 class="book-title">${livro.titulo}</h2>
        <p class="book-author">${livro.autor}</p>
        <p class="book-description">${livro.descricao}</p>
        <div class="book-actions">
          <button
            class="btn btn-primary"
            onclick="abrirLivro(${LIVROS.indexOf(livro)})"
            aria-label="Ler ${livro.titulo}"
          >
            Ler
          </button>
          <button
            class="btn btn-secondary"
            onclick="baixarLivro(${LIVROS.indexOf(livro)})"
            aria-label="Baixar ${livro.titulo}"
          >
            ⤓
          </button>
        </div>
      </div>
    </article>
  `;
}

/* Placeholder HTML gerado por string (usado no onerror da img) */
function placeholderHTML(titulo) {
  return `<div class="book-cover-placeholder">
    <span class="cover-placeholder-icon">◈</span>
    <span class="cover-placeholder-text">${titulo}</span>
  </div>`;
}
/* Expõe no escopo global para o onerror inline da img */
window.placeholderHTML = placeholderHTML;


/* ── Renderiza os cards no grid ─────────────────────────────── */
function renderLivros() {
  const filtrados = getLivrosFiltrados();

  /* Atualiza contador na navbar */
  const total = LIVROS.length;
  bookCount.textContent = `${total} ${total === 1 ? "obra" : "obras"}`;

  if (filtrados.length === 0) {
    bookGrid.innerHTML = "";
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";
  bookGrid.innerHTML = filtrados.map((livro, i) => criarCardHTML(livro, i)).join("");
}


/* ── Ação: Ler livro ────────────────────────────────────────── */
function abrirLivro(indice) {
  const livro = LIVROS[indice];
  const tipo  = getTipoArquivo(livro.arquivo);
  const url   = `books/${livro.arquivo}`;

  if (tipo === "PDF") {
    /* PDF: abre direto no navegador em nova aba */
    window.open(url, "_blank");
  } else {
    /* EPUB: abre modal com explicação e botão de download */
    epubArquivoAtual = url;
    modalTitle.textContent = livro.titulo;
    epubModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}
window.abrirLivro = abrirLivro;


/* ── Ação: Baixar livro ─────────────────────────────────────── */
function baixarLivro(indice) {
  const livro = LIVROS[indice];
  const url   = `books/${livro.arquivo}`;

  /* Cria um link temporário para forçar o download */
  const link      = document.createElement("a");
  link.href       = url;
  link.download   = livro.arquivo;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
window.baixarLivro = baixarLivro;


/* ── Fecha o modal EPUB ─────────────────────────────────────── */
function fecharModal() {
  epubModal.style.display = "none";
  document.body.style.overflow = "";
  epubArquivoAtual = "";
}


/* ── Eventos globais ────────────────────────────────────────── */
function bindEventos() {
  /* Busca em tempo real */
  searchInput.addEventListener("input", () => {
    termoBusca = searchInput.value;
    searchClear.classList.toggle("visible", termoBusca.length > 0);
    renderLivros();
  });

  /* Botão de limpar busca */
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    termoBusca = "";
    searchClear.classList.remove("visible");
    searchInput.focus();
    renderLivros();
  });

  /* Fecha modal com botão × */
  modalClose.addEventListener("click", fecharModal);

  /* Fecha modal clicando fora (overlay) */
  epubModal.addEventListener("click", (e) => {
    if (e.target === epubModal) fecharModal();
  });

  /* Fecha modal com tecla Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && epubModal.style.display === "flex") fecharModal();
  });

  /* Botão de download dentro do modal EPUB */
  epubDownBtn.addEventListener("click", () => {
    const link      = document.createElement("a");
    link.href       = epubArquivoAtual;
    link.download   = epubArquivoAtual.split("/").pop();
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}


/* ── Inicia tudo quando o DOM estiver pronto ────────────────── */
document.addEventListener("DOMContentLoaded", init);

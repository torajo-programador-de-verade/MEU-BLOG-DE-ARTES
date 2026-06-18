// script.js
// Comportamento do botão "like" com persistência em localStorage
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "blogArtistico.likes";
  const THEME_KEY = "blogArtistico.theme";
  const FONT_KEY = "blogArtistico.fontScale";
  const saved = safeParse(localStorage.getItem(STORAGE_KEY)) || {};
  const themeToggle = document.getElementById("theme-toggle");
  const fontIncrease = document.getElementById("font-increase");
  const fontDecrease = document.getElementById("font-decrease");
  const readPage = document.getElementById("read-page");
  const announcementToggle = document.getElementById("announcement-toggle");
  const announcementPanel = document.getElementById("announcement-panel");
  const announcementClose = document.querySelector(".announcement-close");
  const storedTheme = localStorage.getItem(THEME_KEY);
  const storedFontScale = parseInt(localStorage.getItem(FONT_KEY), 10);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  let currentFontScale = Number.isFinite(storedFontScale) ? storedFontScale : 100;

  setTheme(initialTheme);
  setFontScale(currentFontScale);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  if (fontIncrease) {
    fontIncrease.addEventListener("click", () => setFontScale(currentFontScale + 5));
  }
  if (fontDecrease) {
    fontDecrease.addEventListener("click", () => setFontScale(currentFontScale - 5));
  }
  const scrollTopBtn = document.getElementById("scroll-top-btn");
  const backgroundAudio = document.getElementById("background-audio");
  const audioToggleBtn = document.getElementById("audio-toggle-btn");
  const AUDIO_KEY = "blogArtistico.audioPlaying";
  let isAudioPlaying = false;

  if (announcementToggle) {
    announcementToggle.addEventListener("click", toggleAnnouncement);
  }
  if (announcementClose) {
    announcementClose.addEventListener("click", closeAnnouncement);
  }
  if (scrollTopBtn) {
    window.addEventListener("scroll", handleScrollTopVisibility);
    scrollTopBtn.addEventListener("click", scrollToTop);
  }
  if (audioToggleBtn && backgroundAudio) {
    backgroundAudio.volume = 0.45;
    backgroundAudio.preload = "metadata";
    backgroundAudio.loop = true;
    const savedAudioState = localStorage.getItem(AUDIO_KEY) === "true";
    isAudioPlaying = savedAudioState;
    updateAudioButton();
    if (savedAudioState) {
      backgroundAudio.play().catch(() => {
        isAudioPlaying = false;
        updateAudioButton();
      });
    }
    audioToggleBtn.addEventListener("click", toggleAudioPlayback);
    backgroundAudio.addEventListener("play", () => {
      isAudioPlaying = true;
      updateAudioButton();
      saveAudioState(true);
    });
    backgroundAudio.addEventListener("pause", () => {
      isAudioPlaying = false;
      updateAudioButton();
      saveAudioState(false);
    });
    backgroundAudio.addEventListener("ended", () => {
      isAudioPlaying = false;
      updateAudioButton();
      saveAudioState(false);
    });
  }
  if (readPage) {
    if (!("speechSynthesis" in window)) {
      readPage.disabled = true;
      readPage.textContent = "Leitura indisponível";
    } else {
      readPage.addEventListener("click", toggleReadPage);
    }
  }

  let isReading = false;
  let utterance = null;

  function toggleReadPage() {
    if (isReading) {
      stopReading();
    } else {
      startReading();
    }
  }

  function startReading() {
    const text = getPageText();
    if (!text) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      isReading = false;
      updateReadButton();
    };
    utterance.onerror = () => {
      isReading = false;
      updateReadButton();
    };
    window.speechSynthesis.speak(utterance);
    isReading = true;
    updateReadButton();
  }

  function stopReading() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    isReading = false;
    updateReadButton();
  }

  function updateReadButton() {
    if (!readPage) return;
    readPage.textContent = isReading ? "Parar leitura" : "Ler página";
  }

  function getPageText() {
    const title = document.querySelector(".site-title")?.textContent?.trim() || "";
    const subtitle = document.querySelector(".site-subtitle")?.textContent?.trim() || "";
    const cardsText = Array.from(document.querySelectorAll(".card")).map((card) => {
      const cardTitle = card.querySelector(".card-title")?.textContent?.trim() || "";
      const cardDesc = card.querySelector(".card-desc")?.textContent?.trim() || "";
      return `${cardTitle}. ${cardDesc}`;
    }).join(" ");
    return `${title}. ${subtitle}. ${cardsText}`;
  }

  function setTheme(theme) {
    document.body.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.textContent = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";
    }
    try { localStorage.setItem(THEME_KEY, theme); }
    catch (e) { console.warn("Não foi possível salvar tema:", e); }
  }

  function setFontScale(scale) {
    const min = 85;
    const max = 140;
    const clamped = Math.min(max, Math.max(min, scale));
    currentFontScale = clamped;
    document.documentElement.style.fontSize = `${clamped}%`;
    if (fontDecrease) fontDecrease.disabled = clamped <= min;
    if (fontIncrease) fontIncrease.disabled = clamped >= max;
    try { localStorage.setItem(FONT_KEY, String(clamped)); }
    catch (e) { console.warn("Não foi possível salvar tamanho da fonte:", e); }
  }

  function toggleAnnouncement() {
    if (!announcementPanel) return;
    const isHidden = announcementPanel.getAttribute("aria-hidden") === "true";
    announcementPanel.setAttribute("aria-hidden", isHidden ? "false" : "true");
    if (announcementToggle) announcementToggle.setAttribute("aria-expanded", String(isHidden));
  }

  function closeAnnouncement() {
    if (!announcementPanel) return;
    announcementPanel.setAttribute("aria-hidden", "true");
    if (announcementToggle) announcementToggle.setAttribute("aria-expanded", "false");
  }

  function handleScrollTopVisibility() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 240) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleAudioPlayback() {
    if (!backgroundAudio) return;
    if (backgroundAudio.paused) {
      backgroundAudio.play().catch(() => {
        isAudioPlaying = false;
        updateAudioButton();
      });
    } else {
      backgroundAudio.pause();
    }
  }

  function updateAudioButton() {
    if (!audioToggleBtn) return;
    audioToggleBtn.textContent = isAudioPlaying ? "❚❚" : "▶";
    audioToggleBtn.setAttribute("aria-pressed", String(isAudioPlaying));
    audioToggleBtn.title = isAudioPlaying ? "Pausar trilha sonora" : "Tocar trilha sonora";
  }

  function saveAudioState(value) {
    try {
      localStorage.setItem(AUDIO_KEY, String(value));
    } catch (e) {
      console.warn("Não foi possível salvar estado de áudio:", e);
    }
  }

  // Inicializa likes e configura modal
  const cards = Array.from(document.querySelectorAll(".card"));
  cards.forEach((card, idx) => {
    const id = card.dataset.id;
    const btn = card.querySelector(".like-btn");
    const countEl = card.querySelector(".count");
    const img = card.querySelector("img");
    const title = card.querySelector(".card-title")?.textContent || "";

    const count = saved[id] && typeof saved[id].count === "number" ? saved[id].count : 0;
    const liked = saved[id] ? !!saved[id].liked : false;

    countEl.textContent = String(count);
    if (liked) btn.classList.add("liked");
    btn.setAttribute("aria-pressed", liked ? "true" : "false");

    btn.addEventListener("click", () => toggleLike(id, btn, countEl));
    // duplo clique na imagem também curte
    if (img) {
      img.addEventListener("dblclick", () => {
        if (!btn.classList.contains("liked")) toggleLike(id, btn, countEl, true);
        else toggleLike(id, btn, countEl, false);
      });

      // clique abre modal
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModalAtIndex(idx));
    }

    // garante índice consistente para navegação
    card.dataset.index = String(idx);
  });

  // ---------- Funções de Like ----------
  function toggleLike(id, btn, countEl, forceLike) {
    const liked = btn.classList.contains("liked");
    const willLike = typeof forceLike === "boolean" ? forceLike : !liked;
    let count = parseInt(countEl.textContent, 10) || 0;
    count = willLike ? count + 1 : Math.max(0, count - 1);

    const heart = btn.querySelector(".heart");
    if (heart) {
      heart.classList.remove("pop");
      void heart.offsetWidth;
      heart.classList.add("pop");
    }

    countEl.textContent = String(count);
    btn.setAttribute("aria-pressed", willLike ? "true" : "false");
    btn.classList.toggle("liked", willLike);

    const data = safeParse(localStorage.getItem(STORAGE_KEY)) || {};
    data[id] = { liked: willLike, count: count };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { console.warn("Não foi possível salvar likes:", e); }
  }

  function safeParse(str){
    try { return JSON.parse(str); }
    catch { return null; }
  }

  // ---------- Modal de Imagem ----------
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const modalCaption = document.getElementById("modal-caption");
  const modalDownload = document.getElementById("modal-download");
  const btnClose = document.querySelector(".modal-close");
  const btnPrev = document.querySelector(".modal-prev");
  const btnNext = document.querySelector(".modal-next");
  const overlay = document.querySelector(".modal-overlay");

  let currentIndex = 0;
  let lastFocused = null;

  // coleta dados das imagens (src, alt, título)
  const galleryImages = cards.map(card => {
    const img = card.querySelector("img");
    return {
      src: img ? img.getAttribute("src") : "",
      alt: img ? img.getAttribute("alt") : "",
      title: card.querySelector(".card-title")?.textContent || ""
    };
  });

  function openModalAtIndex(index) {
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const data = galleryImages[currentIndex];
    modalImage.src = data.src;
    modalImage.alt = data.alt || data.title || "";
    modalCaption.textContent = data.title || data.alt || "";
    if (modalDownload) {
      modalDownload.href = data.src;
      modalDownload.download = getDownloadFileName(data.src);
    }
    showModal();
  }

  function getDownloadFileName(src) {
    return src.split("/").pop() || "imagem.png";
  }

  function showModal() {
    lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // evitar scroll do fundo
    btnClose.focus();
    addModalListeners();
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    removeModalListeners();
    // restaurar foco no último elemento
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function showNext() { openModalAtIndex(currentIndex + 1); }
  function showPrev() { openModalAtIndex(currentIndex - 1); }

  function onKeyDown(e) {
    if (modal.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); showNext(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); showPrev(); }
    else if (e.key === "Tab") {
      // foco simples: ciclar entre close, prev, next
      const focusables = [btnClose, btnPrev, btnNext].filter(Boolean);
      const idx = focusables.indexOf(document.activeElement);
      if (idx === -1 && focusables[0]) { focusables[0].focus(); e.preventDefault(); return; }
      const nextIdx = e.shiftKey ? (idx - 1 + focusables.length) % focusables.length : (idx + 1) % focusables.length;
      focusables[nextIdx].focus();
      e.preventDefault();
    }
  }

  function onOverlayClick(e) {
    if (e.target && e.target.dataset && e.target.dataset.close === "true") closeModal();
  }

  function addModalListeners() {
    document.addEventListener("keydown", onKeyDown);
    btnClose.addEventListener("click", closeModal);
    btnNext.addEventListener("click", showNext);
    btnPrev.addEventListener("click", showPrev);
    overlay.addEventListener("click", onOverlayClick);
    // clique na imagem não fecha, mas permite zoom (nativo)
  }

  function removeModalListeners() {
    document.removeEventListener("keydown", onKeyDown);
    try {
      btnClose.removeEventListener("click", closeModal);
      btnNext.removeEventListener("click", showNext);
      btnPrev.removeEventListener("click", showPrev);
      overlay.removeEventListener("click", onOverlayClick);
    } catch (e) { /* ignore */ }
  }

  // Fechar ao carregar nova imagem por falha de src? mantém mensagem
  modalImage.addEventListener("error", () => {
    modalCaption.textContent = "Não foi possível carregar a imagem.";
  });

  // ---------- Sistema de Comentários ----------
  const COMMENTS_KEY = "blogArtistico.comments";
  const commentForm = document.getElementById("comment-form");
  const commentName = document.getElementById("comment-name");
  const commentText = document.getElementById("comment-text");
  const commentsList = document.getElementById("comments-list");
  const charUsed = document.getElementById("char-used");

  let comments = safeParse(localStorage.getItem(COMMENTS_KEY)) || [];
  renderComments();

  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (commentName.value.trim() && commentText.value.trim()) {
        const newComment = {
          id: Date.now(),
          name: commentName.value.trim(),
          text: commentText.value.trim(),
          date: new Date().toLocaleString("pt-BR")
        };
        comments.unshift(newComment);
        saveComments();
        renderComments();
        commentForm.reset();
        charUsed.textContent = "0";
      }
    });
  }

  if (commentText) {
    commentText.addEventListener("input", () => {
      charUsed.textContent = commentText.value.length;
    });
  }

  // ---------- Quiz de Desenho ----------
  const quizStart = document.getElementById("quiz-start");
  const quizBox = document.getElementById("quiz-box");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizNext = document.getElementById("quiz-next");
  const quizProgress = document.getElementById("quiz-progress");
  const quizResult = document.getElementById("quiz-result");

  const quizData = [
    {
      question: "Qual é o termo usado para desenhar formas com linhas e sombras?",
      options: ["Perspectiva", "Sombreamento", "Contorno", "Pintura"],
      answer: 1,
    },
    {
      question: "Qual material é mais comum para esboços iniciais?",
      options: ["Tinta acrílica", "Lápis", "Aquarela", "Pastel óleo"],
      answer: 1,
    },
    {
      question: "O que ajuda a criar profundidade em um desenho?",
      options: ["Linhas paralelas", "Sombra e perspectiva", "Contorno escuro", "Cores vibrantes"],
      answer: 1,
    },
    {
      question: "Como se chama o estilo de desenhar algo rápido para capturar a ideia?",
      options: ["Esboço", "Cena", "Quadro final", "Edição"],
      answer: 0,
    },
    {
      question: "Qual é um bom primeiro passo ao desenhar uma figura?",
      options: ["Começar pelos detalhes", "Desenhar linhas de guia", "Pintar primeiro", "Usar caneta permanente"],
      answer: 1,
    },
  ];
  let quizIndex = 0;
  let quizScore = 0;
  let selectedAnswer = null;

  if (quizStart) {
    quizStart.addEventListener("click", () => {
      quizStart.classList.add("hidden");
      quizResult.classList.add("hidden");
      quizBox.classList.remove("hidden");
      quizIndex = 0;
      quizScore = 0;
      selectedAnswer = null;
      renderQuiz();
    });
  }

  if (quizNext) {
    quizNext.addEventListener("click", () => {
      if (selectedAnswer === null) return;
      const question = quizData[quizIndex];
      if (selectedAnswer === question.answer) quizScore += 1;
      quizIndex += 1;
      selectedAnswer = null;
      if (quizIndex >= quizData.length) {
        showQuizResult();
      } else {
        renderQuiz();
      }
    });
  }

  function renderQuiz() {
    const current = quizData[quizIndex];
    quizProgress.textContent = `Pergunta ${quizIndex + 1} de ${quizData.length}`;
    quizQuestion.textContent = current.question;
    quizOptions.innerHTML = "";
    current.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = option;
      button.addEventListener("click", () => selectQuizOption(index, button));
      quizOptions.appendChild(button);
    });
    quizNext.disabled = true;
  }

  function selectQuizOption(index, button) {
    selectedAnswer = index;
    Array.from(quizOptions.children).forEach((child) => {
      child.classList.remove("selected");
    });
    button.classList.add("selected");
    if (quizNext) quizNext.disabled = false;
  }

  function showQuizResult() {
    quizBox.classList.add("hidden");
    quizResult.classList.remove("hidden");
    const percentage = Math.round((quizScore / quizData.length) * 100);
    let message = "Muito bom! Você entende bastante de desenho.";
    if (percentage <= 40) {
      message = "Ainda tem espaço para aprender mais, mas continue praticando!";
    } else if (percentage <= 80) {
      message = "Ótimo! Você sabe bastante e pode continuar evoluindo.";
    }
    quizResult.innerHTML = `
      <h3>Resultado: ${quizScore} de ${quizData.length}</h3>
      <p>${message}</p>
      <button id="quiz-restart" class="quiz-start-btn" type="button">Refazer quiz</button>
    `;
    const restartButton = document.getElementById("quiz-restart");
    if (restartButton) {
      restartButton.addEventListener("click", () => {
        quizResult.classList.add("hidden");
        quizStart.classList.remove("hidden");
      });
    }
  }

  function renderComments() {
    commentsList.innerHTML = "";
    if (comments.length === 0) {
      commentsList.innerHTML = '<div class="empty-state">Nenhum comentário ainda. Seja o primeiro a compartilhar seu feedback!</div>';
      return;
    }
    comments.forEach((comment) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment-item";
      commentEl.innerHTML = `
        <div class="comment-header">
          <p class="comment-name">${escapeHtml(comment.name)}</p>
          <span class="comment-date">${comment.date}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
        <div class="comment-actions">
          <button class="delete-btn" data-id="${comment.id}">Deletar</button>
        </div>
      `;
      const deleteBtn = commentEl.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          comments = comments.filter((c) => c.id !== comment.id);
          saveComments();
          renderComments();
        });
      }
      commentsList.appendChild(commentEl);
    });
  }

  function saveComments() {
    try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments)); }
    catch (e) { console.warn("Não foi possível salvar comentários:", e); }
  }

  function escapeHtml(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

});

// Fechar ao carregar nova imagem por falha de src? mantém mensagem
modalImage.addEventListener("error", () => {
  modalCaption.textContent = "Não foi possível carregar a imagem.";
});

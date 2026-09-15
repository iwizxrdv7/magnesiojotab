/**
 * MAGNÉSIO B12 JOTA'B - INTERACTIVE LOGIC & ANIMATIONS
 * Mobile-first gallery, review rendering, kit selection, FAQ accordion, scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initKitSelection();
  initReviews();
  initFAQ();
  initScrollAnimations();
  initStickyBar();
  initSideMenu();
  initTracking();
});

/* ==========================================================================
   1. GALERIA INTERATIVA MOBILE (MINIATURAS, TOUCH SWIPE & LIGHTBOX)
   ========================================================================== */
function initGallery() {
  const mainImg = document.getElementById('mainProductImage');
  const mainContainer = document.getElementById('mainImageContainer');
  const thumbItems = document.querySelectorAll('.thumb-item');
  const counter = document.getElementById('galleryCounter');
  const btnZoom = document.getElementById('btnZoomGallery');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImage');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');

  if (!mainImg || !thumbItems.length) return;

  const totalImages = thumbItems.length;
  let currentIndex = 0;

  function setActiveImage(index) {
    if (index < 0) index = 0;
    if (index >= totalImages) index = totalImages - 1;
    currentIndex = index;

    const targetThumb = thumbItems[currentIndex];
    const newSrc = targetThumb.getAttribute('data-src');

    // Transição suave
    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      mainImg.src = newSrc;
      if (lightboxImg) lightboxImg.src = newSrc;
      mainImg.style.opacity = '1';
    }, 150);

    // Atualiza miniaturas
    thumbItems.forEach(t => t.classList.remove('active'));
    targetThumb.classList.add('active');

    // Scroll da miniatura para o campo visível
    targetThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    // Atualiza contador
    if (counter) counter.textContent = `${currentIndex + 1} / ${totalImages}`;
  }

  // Click nas miniaturas
  thumbItems.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      setActiveImage(idx);
    });
  });

  // Touch Swipe para Mobile na imagem principal
  let touchStartX = 0;
  let touchEndX = 0;

  mainContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  mainContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && currentIndex < totalImages - 1) {
        // Swipe para esquerda -> próxima imagem
        setActiveImage(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe para direita -> imagem anterior
        setActiveImage(currentIndex - 1);
      }
    }
  }

  // Lightbox Zoom
  if (btnZoom && lightbox && lightboxImg) {
    btnZoom.addEventListener('click', () => {
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    btnCloseLightbox.addEventListener('click', () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ==========================================================================
   2. SELEÇÃO INTERATIVA DE KITS
   ========================================================================== */
function initKitSelection() {
  const kitCards = document.querySelectorAll('.kit-card');
  const stickyPriceDisplay = document.getElementById('stickyPriceDisplay');

  if (!kitCards.length) return;

  kitCards.forEach(card => {
    card.addEventListener('click', () => {
      kitCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const price = card.getAttribute('data-price');
      if (stickyPriceDisplay && price) {
        stickyPriceDisplay.textContent = `R$ ${price}`;
      }
    });

    const buyBtn = card.querySelector('.btn-select-kit');
    if (buyBtn) {
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        kitCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const kitNum = card.getAttribute('data-kit') || '3';
        
        // Efeito de feedback tátil e redirecionamento ao checkout
        buyBtn.style.transform = 'scale(0.96)';
        setTimeout(() => {
          window.location.href = `checkout.html?kit=${kitNum}`;
        }, 150);
      });
    }
  });
}

/* ==========================================================================
   3. AVALIAÇÕES REAIS (RENDERIZAÇÃO, BLUR E FILTROS)
   ========================================================================== */
function initReviews() {
  const container = document.getElementById('reviewsContainer');
  const btnLoadMore = document.getElementById('btnLoadMoreReviews');
  const filterPills = document.querySelectorAll('#reviewFilterPills .pill-btn');

  if (!container || typeof REVIEWS_DATA === 'undefined') return;

  let currentFilter = 'all';
  let displayedCount = 5;
  const pageSize = 5;

  function getFilteredReviews() {
    if (currentFilter === 'photos') {
      return REVIEWS_DATA.filter(r => r.photos && r.photos.length > 0);
    }
    if (currentFilter === '5stars') {
      return REVIEWS_DATA.filter(r => r.rating === 5);
    }
    if (currentFilter === 'repurchase') {
      return REVIEWS_DATA.filter(r => 
        r.comment.toLowerCase().includes('compro') || 
        r.comment.toLowerCase().includes('vez que') ||
        r.comment.toLowerCase().includes('frasco') ||
        r.comment.toLowerCase().includes('recomendo')
      );
    }
    return REVIEWS_DATA;
  }

  function createStarSvg() {
    return `<svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }

  function renderReviews() {
    const list = getFilteredReviews();
    const toShow = list.slice(0, displayedCount);

    container.innerHTML = toShow.map(item => {
      const stars = Array(item.rating).fill(createStarSvg()).join('');
      
      const photosHtml = (item.photos && item.photos.length > 0)
        ? `<div class="review-photos-grid">
            ${item.photos.map(photoSrc => `
              <div class="review-photo-thumb" data-photo="${photoSrc}" title="Clique para ampliar">
                <img src="${photoSrc}" alt="Foto da avaliação" loading="lazy">
              </div>
            `).join('')}
          </div>`
        : '';
      
      return `
        <article class="review-item fade-in-scroll visible" data-id="${item.id}">
          <div class="review-header">
            <div class="reviewer-meta">
              <div class="reviewer-avatar" aria-hidden="true">
                ${item.avatarInitials}
              </div>
              <div class="reviewer-name-col">
                <span class="reviewer-name-blurred" title="Nome protegido por privacidade">${item.username}</span>
                <span class="reviewer-city">
                  <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  ${item.location}
                </span>
              </div>
            </div>
            <div class="verified-buyer-badge">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>Verificado</span>
            </div>
          </div>

          <div class="review-stars-date">
            <div class="stars-group">${stars}</div>
            <span>•</span>
            <span>${item.date}</span>
          </div>

          <p class="review-comment">${escapeHtml(item.comment)}</p>
          ${photosHtml}
          <div class="review-spec">${item.specification}</div>
        </article>
      `;
    }).join('');

    // Adiciona evento de ampliação para as fotos das avaliações
    const photoThumbs = container.querySelectorAll('.review-photo-thumb');
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImage');

    if (lightbox && lightboxImg) {
      photoThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          const photoSrc = thumb.getAttribute('data-photo');
          if (photoSrc) {
            lightboxImg.src = photoSrc;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
          }
        });
      });
    }

    if (btnLoadMore) {
      btnLoadMore.style.display = displayedCount >= list.length ? 'none' : 'flex';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Filtragem por abas
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      displayedCount = pageSize;
      renderReviews();
    });
  });

  // Botão carregar mais
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      displayedCount += pageSize;
      renderReviews();
    });
  }

  // Render inicial
  renderReviews();
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fecha outros itens
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      // Alterna o atual
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   5. ANIMAÇÕES FADE-IN ON SCROLL
   ========================================================================== */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in-scroll');

  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   6. BARRA STICKY MOBILE INTELIGENTE
   ========================================================================== */
function initStickyBar() {
  const stickyBar = document.getElementById('stickyMobileBar');
  const heroBuyBtn = document.getElementById('btnHeroBuy');

  if (!stickyBar || !heroBuyBtn) return;

  window.addEventListener('scroll', () => {
    const rect = heroBuyBtn.getBoundingClientRect();
    if (rect.bottom < 0) {
      stickyBar.style.transform = 'translateY(0)';
    } else {
      stickyBar.style.transform = 'translateY(100%)';
    }
  }, { passive: true });
}

/* ==========================================================================
   7. MENU LATERAL (DRAWER OFF-CANVAS)
   ========================================================================== */
function initSideMenu() {
  const btnOpen = document.getElementById('btnOpenSideMenu');
  const btnClose = document.getElementById('btnCloseSideMenu');
  const drawer = document.getElementById('sideMenuDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const drawerLinks = document.querySelectorAll('[data-close-drawer]');

  if (!drawer || !overlay) return;

  function openMenu() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  if (btnOpen) btnOpen.addEventListener('click', openMenu);
  if (btnClose) btnClose.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Fecha no ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Fecha ao clicar em links da navegação
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Feedback ao tocar no WhatsApp Bloqueado
  const btnWhatsappLocked = document.getElementById('btnWhatsappLocked');
  if (btnWhatsappLocked) {
    btnWhatsappLocked.addEventListener('click', () => {
      btnWhatsappLocked.classList.remove('shake');
      void btnWhatsappLocked.offsetWidth; // trigger reflow
      btnWhatsappLocked.classList.add('shake');
    });
  }
}

/* ==========================================================================
   8. SISTEMA DE RASTREAMENTO DE PEDIDOS
   ========================================================================== */
function initTracking() {
  const form = document.getElementById('trackingForm');
  const input = document.getElementById('trackingInput');
  const btnClear = document.getElementById('btnClearTracking');
  const resultBox = document.getElementById('trackingResultBox');

  if (!form || !input || !resultBox) return;

  // Mostra/oculta botão de limpar e transforma em maiúsculo
  input.addEventListener('input', () => {
    const val = input.value;
    input.value = val.toUpperCase();
    if (btnClear) {
      btnClear.style.display = val.trim().length > 0 ? 'flex' : 'none';
    }
    if (val.trim().length === 0) {
      resultBox.style.display = 'none';
      resultBox.className = 'tracking-result-box';
      resultBox.innerHTML = '';
    }
  });

  // Limpar campo
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      input.value = '';
      btnClear.style.display = 'none';
      resultBox.style.display = 'none';
      resultBox.className = 'tracking-result-box';
      resultBox.innerHTML = '';
      input.focus();
    });
  }

  // Submissão do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();

    if (!code) {
      resultBox.className = 'tracking-result-box error';
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg style="width: 14px; height: 14px; fill: #b91c1c; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span>Por favor, digite o código de rastreamento do seu pedido.</span>
        </div>
      `;
      input.focus();
      return;
    }

    if (code.length < 5) {
      resultBox.className = 'tracking-result-box error';
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg style="width: 14px; height: 14px; fill: #b91c1c; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span>Código inválido. Verifique o código recebido no seu e-mail/WhatsApp.</span>
        </div>
      `;
      return;
    }

    // Feedback de carregamento
    resultBox.className = 'tracking-result-box info';
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg style="width: 14px; height: 14px; fill: #1e40af; animation: spin 1s linear infinite;" viewBox="0 0 24 24"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>
        <span>Localizando encomenda <strong>${code}</strong>...</span>
      </div>
    `;

    setTimeout(() => {
      resultBox.className = 'tracking-result-box success';
      resultBox.innerHTML = `
        <div class="tracking-feedback-content">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <svg style="width: 15px; height: 15px; fill: #166534; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <strong>Código identificado: ${code}</strong>
          </div>
          <p style="color: #475569; font-size: 0.74rem; margin-bottom: 8px;">Acompanhe todos os eventos e movimentações da sua encomenda através do rastreador oficial:</p>
          <a href="https://linketrack.com/rastreio?codigo=${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer" class="tracking-action-link">
            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
            <span>Ver Rastreio Oficial</span>
          </a>
        </div>
      `;
    }, 450);
  });
}


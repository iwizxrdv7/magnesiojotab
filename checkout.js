/**
 * MAGNÉSIO B12 JOTA'B - CHECKOUT ENGINE (3-STEP MOBILE-FIRST)
 * Accordion de resumo, sistema de cupom secreto, ViaCEP, máscaras, validações e gateway ready
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

function initCheckout() {
  // 1. DADOS DOS KITS
  const DEFAULT_SHIPPING_PRICE = 9.74;

  const KITS = {
    '1': {
      id: 1,
      name: "6 Magnésios + B12 Jota'B - 1 Pote",
      sub: "Tratamento para 1 Mês • 60 Cápsulas",
      price: 24.90,
      oldPrice: 35.90,
      image: "assets/images/product_1.webp",
      qty: 1
    },
    '2': {
      id: 2,
      name: "6 Magnésios + B12 Jota'B - Kit 2 Potes",
      sub: "Tratamento para 2 Meses • 120 Cápsulas",
      price: 47.90,
      oldPrice: 79.90,
      image: "assets/images/product_1.webp",
      qty: 2
    },
    '3': {
      id: 3,
      name: "6 Magnésios + B12 Jota'B - Kit 3 Potes (Mais Vendido)",
      sub: "Tratamento para 3 Meses • 180 Cápsulas",
      price: 92.90,
      oldPrice: 185.90,
      image: "assets/images/kit_3.jpg",
      qty: 3
    }
  };

  // Estado do Checkout
  const state = {
    kit: KITS['3'],
    currentStep: 1,
    couponApplied: null,
    hasFreeShippingCoupon: false,
    hasInformedCep: false,
    customer: {
      fullName: '',
      email: '',
      phone: '',
      cpf: generateValidCPF() // Gerado em segundo plano e válido para o gateway
    },
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    paymentMethod: 'pix'
  };

  // Ler parâmetro da URL (?kit=1, ?kit=2, ?kit=3)
  const urlParams = new URLSearchParams(window.location.search);
  const kitParam = urlParams.get('kit');
  if (kitParam && KITS[kitParam]) {
    state.kit = KITS[kitParam];
  }

  // Inicializações
  setupSummaryAccordion();
  setupCouponSystem();
  setupInputMasks();
  setupViaCEP();
  setupStepNavigation();
  setupPaymentTabs();
  renderOrderSummary();

  /* ==========================================================================
     A. RESUMO DO PEDIDO & ACCORDION (FECHADO POR PADRÃO)
     ========================================================================== */
  function setupSummaryAccordion() {
    const btnToggle = document.getElementById('btnToggleSummary');
    const contentDrawer = document.getElementById('summaryContentDrawer');

    if (!btnToggle || !contentDrawer) return;

    btnToggle.addEventListener('click', () => {
      const isOpen = btnToggle.classList.contains('open');
      if (isOpen) {
        btnToggle.classList.remove('open');
        btnToggle.setAttribute('aria-expanded', 'false');
        contentDrawer.style.display = 'none';
      } else {
        btnToggle.classList.add('open');
        btnToggle.setAttribute('aria-expanded', 'true');
        contentDrawer.style.display = 'block';
      }
    });
  }

  function renderOrderSummary() {
    const kit = state.kit;
    const subtotal = kit.price;
    const isFreeShipping = state.hasFreeShippingCoupon;
    const isCepInformed = state.hasInformedCep;

    // O frete só é somado após informar o CEP ou se tiver cupom de frete grátis
    let shipping = 0.00;
    if (isFreeShipping) {
      shipping = 0.00;
    } else if (isCepInformed) {
      shipping = DEFAULT_SHIPPING_PRICE;
    } else {
      shipping = 0.00; // Antes de informar o CEP, o total é o subtotal
    }

    const total = subtotal + shipping;

    // Formatações
    const fmt = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Atualiza elementos
    const elImg = document.getElementById('summaryProductImage');
    const elName = document.getElementById('summaryProductName');
    const elSub = document.getElementById('summaryProductSub');
    const elPrice = document.getElementById('summaryProductPrice');
    const elQty = document.getElementById('summaryQtyBadge');
    const elHeaderTotal = document.getElementById('summaryHeaderTotal');
    const elSubtotal = document.getElementById('summarySubtotalVal');
    const elShipping = document.getElementById('summaryShippingVal');
    const elDiscountRow = document.getElementById('summaryDiscountRow');
    const elDiscountVal = document.getElementById('summaryDiscountVal');
    const elFinalTotal = document.getElementById('summaryFinalTotal');
    const elPixLabel = document.getElementById('btnPixLabel');
    const elShippingBadge = document.getElementById('shippingPriceBadge');
    const elShippingBox = document.getElementById('shippingMethodBox');

    if (elImg) elImg.src = kit.image;
    if (elName) elName.textContent = kit.name;
    if (elSub) elSub.textContent = kit.sub;
    if (elPrice) elPrice.textContent = `R$ ${fmt(subtotal)}`;
    if (elQty) elQty.textContent = kit.qty;
    if (elHeaderTotal) elHeaderTotal.textContent = `R$ ${fmt(total)}`;
    if (elSubtotal) elSubtotal.textContent = `R$ ${fmt(subtotal)}`;

    if (elShipping) {
      if (isFreeShipping) {
        elShipping.textContent = 'GRÁTIS (Jota B Transportes)';
        elShipping.className = 'calc-val text-success';
      } else if (isCepInformed) {
        elShipping.textContent = `R$ ${fmt(DEFAULT_SHIPPING_PRICE)}`;
        elShipping.className = 'calc-val';
      } else {
        elShipping.textContent = 'Calcular na entrega';
        elShipping.className = 'calc-val text-muted';
      }
    }

    if (elShippingBadge) {
      if (isFreeShipping) {
        elShippingBadge.textContent = 'GRÁTIS';
        elShippingBadge.className = 'shipping-price-badge is-free';
      } else {
        elShippingBadge.textContent = `R$ ${fmt(DEFAULT_SHIPPING_PRICE)}`;
        elShippingBadge.className = 'shipping-price-badge';
      }
    }

    if (elShippingBox) {
      if (isCepInformed) {
        elShippingBox.style.display = 'block';
      } else {
        elShippingBox.style.display = 'none';
      }
    }

    if (elDiscountRow && elDiscountVal) {
      if (isFreeShipping) {
        elDiscountRow.style.display = 'flex';
        elDiscountVal.textContent = `- R$ ${fmt(DEFAULT_SHIPPING_PRICE)} (Frete Grátis)`;
      } else {
        elDiscountRow.style.display = 'none';
      }
    }

    if (elFinalTotal) elFinalTotal.textContent = fmt(total);
    if (elPixLabel) elPixLabel.textContent = `GERAR PIX DE R$ ${fmt(total)}`;

    // Atualiza opções de parcelamento do cartão
    updateCardInstallments(total);
  }

  function updateCardInstallments(total) {
    const select = document.getElementById('cardInstallmentsSelect');
    if (!select) return;

    select.innerHTML = '';
    const fmt = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    for (let i = 1; i <= 12; i++) {
      const installmentVal = total / i;
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i}x de R$ ${fmt(installmentVal)}${i <= 6 ? ' (sem juros)' : ''}`;
      if (i === 12) opt.selected = true;
      select.appendChild(opt);
    }
  }

  /* ==========================================================================
     B. SISTEMA DE CUPOM DE DESCONTO (ÚNICO VÁLIDO: "PRIMEIRA" -> FRETE GRÁTIS)
     ========================================================================== */
  function setupCouponSystem() {
    const input1 = document.getElementById('couponInput');
    const btn1 = document.getElementById('btnApplyCoupon');
    const feedback1 = document.getElementById('couponFeedback');

    const input2 = document.getElementById('step2CouponInput');
    const btn2 = document.getElementById('btnApplyCouponStep2');
    const feedback2 = document.getElementById('step2CouponFeedback');

    function applyCouponCode(rawCode) {
      const code = (rawCode || '').trim().toUpperCase();

      if (!code) {
        showFeedback('Por favor, digite o código do cupom.', 'error');
        return;
      }

      // Único cupom válido exigido: PRIMEIRA -> Frete Grátis com Jota B Transportes
      if (code === 'PRIMEIRA') {
        state.couponApplied = 'PRIMEIRA';
        state.hasFreeShippingCoupon = true;

        showFeedback('Cupom PRIMEIRA aplicado com sucesso! Frete Grátis com Jota B Transportes.', 'success');

        [input1, input2].forEach(inp => {
          if (inp) {
            inp.value = 'PRIMEIRA';
            inp.disabled = true;
          }
        });
        [btn1, btn2].forEach(b => {
          if (b) {
            b.disabled = true;
            b.textContent = 'Aplicado';
          }
        });

        renderOrderSummary();
      } else {
        showFeedback('Cupom inválido ou expirado.', 'error');
      }
    }

    function showFeedback(msg, type) {
      [feedback1, feedback2].forEach(fb => {
        if (fb) {
          fb.className = `coupon-feedback ${type}`;
          fb.style.display = 'block';
          fb.textContent = msg;
        }
      });
    }

    if (btn1 && input1) {
      btn1.addEventListener('click', () => applyCouponCode(input1.value));
      input1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCouponCode(input1.value);
        }
      });
    }

    if (btn2 && input2) {
      btn2.addEventListener('click', () => applyCouponCode(input2.value));
      input2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCouponCode(input2.value);
        }
      });
    }
  }

  /* ==========================================================================
     C. FORMATAÇÃO E MÁSCARAS DE ENTRADA
     ========================================================================== */
  function setupInputMasks() {
    // Máscara de Telefone: (XX) XXXXX-XXXX
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 6) {
          e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
        } else if (v.length > 2) {
          e.target.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
        } else if (v.length > 0) {
          e.target.value = `(${v}`;
        }
      });
    }

    // Máscara de CEP: XXXXX-XXX
    const cepInput = document.getElementById('cepInput');
    if (cepInput) {
      cepInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length > 5) {
          e.target.value = `${v.substring(0, 5)}-${v.substring(5)}`;
        } else {
          e.target.value = v;
        }
      });
    }

    // Máscara de Cartão: XXXX XXXX XXXX XXXX
    const cardInput = document.getElementById('cardNumberInput');
    if (cardInput) {
      cardInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 16) v = v.substring(0, 16);
        const parts = v.match(/[\s\S]{1,4}/g) || [];
        e.target.value = parts.join(' ');
      });
    }

    // Máscara de Validade do Cartão: MM/AA
    const expInput = document.getElementById('cardExpiryInput');
    if (expInput) {
      expInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 4) v = v.substring(0, 4);
        if (v.length > 2) {
          e.target.value = `${v.substring(0, 2)}/${v.substring(2)}`;
        } else {
          e.target.value = v;
        }
      });
    }

    // CVV: Apenas dígitos
    const cvvInput = document.getElementById('cardCvvInput');
    if (cvvInput) {
      cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
      });
    }
  }

  /* ==========================================================================
     D. INTEGRAÇÃO API VIACEP
     ========================================================================== */
  function setupViaCEP() {
    const cepInput = document.getElementById('cepInput');
    const spinner = document.getElementById('cepSpinner');
    const streetInput = document.getElementById('streetInput');
    const neighborhoodInput = document.getElementById('neighborhoodInput');
    const cityInput = document.getElementById('cityInput');
    const stateInput = document.getElementById('stateInput');
    const numberInput = document.getElementById('numberInput');
    const cepError = document.getElementById('cepError');

    if (!cepInput) return;

    function handleCepChange(e) {
      const cepClean = cepInput.value.replace(/\D/g, '');
      if (cepClean.length === 8) {
        if (!state.hasInformedCep) {
          state.hasInformedCep = true;
          renderOrderSummary();
        }
        if (e.type === 'blur' || e.type === 'keyup') {
          consultarViaCEP(cepClean);
        }
      } else {
        if (state.hasInformedCep) {
          state.hasInformedCep = false;
          renderOrderSummary();
        }
      }
    }

    cepInput.addEventListener('input', handleCepChange);
    cepInput.addEventListener('blur', handleCepChange);
    cepInput.addEventListener('keyup', handleCepChange);

    async function consultarViaCEP(cep) {
      if (spinner) spinner.style.display = 'block';
      if (cepError) {
        cepError.textContent = '';
        cepError.classList.remove('show');
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          if (cepError) {
            cepError.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
            cepError.classList.add('show');
          }
          return;
        }

        if (streetInput && data.logradouro) streetInput.value = data.logradouro;
        if (neighborhoodInput && data.bairro) neighborhoodInput.value = data.bairro;
        if (cityInput && data.localidade) cityInput.value = data.localidade;
        if (stateInput && data.uf) stateInput.value = data.uf;

        // Garante que o frete está calculado e visível
        state.hasInformedCep = true;
        renderOrderSummary();

        // Foca no número para agilidade
        if (numberInput) numberInput.focus();

      } catch (err) {
        console.warn('Erro ao consultar ViaCEP:', err);
      } finally {
        if (spinner) spinner.style.display = 'none';
      }
    }
  }

  /* ==========================================================================
     E. NAVEGAÇÃO DOS 3 PASSOS (STEPPER MULTI-STEP)
     ========================================================================== */
  function setupStepNavigation() {
    const stepPanel1 = document.getElementById('stepPanel1');
    const stepPanel2 = document.getElementById('stepPanel2');
    const stepPanel3 = document.getElementById('stepPanel3');

    const stepNode1 = document.getElementById('stepNode1');
    const stepNode2 = document.getElementById('stepNode2');
    const stepNode3 = document.getElementById('stepNode3');
    const stepperFill = document.getElementById('stepperFill');

    const btnGoToStep2 = document.getElementById('btnGoToStep2');
    const btnBackToStep1 = document.getElementById('btnBackToStep1');
    const btnGoToStep3 = document.getElementById('btnGoToStep3');
    const btnBackToStep2FromPix = document.getElementById('btnBackToStep2FromPix');
    const btnBackToStep2FromCard = document.getElementById('btnBackToStep2FromCard');

    function goToStep(stepNumber) {
      state.currentStep = stepNumber;

      // Oculta todos os painéis
      [stepPanel1, stepPanel2, stepPanel3].forEach(panel => {
        if (panel) {
          panel.style.display = 'none';
          panel.classList.remove('fade-in');
        }
      });

      // Reseta nós do stepper
      [stepNode1, stepNode2, stepNode3].forEach(node => {
        if (node) {
          node.classList.remove('active', 'completed');
        }
      });

      if (stepNumber === 1) {
        stepPanel1.style.display = 'block';
        stepPanel1.classList.add('fade-in');
        stepNode1.classList.add('active');
        stepperFill.style.width = '0%';
      } else if (stepNumber === 2) {
        stepPanel2.style.display = 'block';
        stepPanel2.classList.add('fade-in');
        stepNode1.classList.add('completed');
        stepNode2.classList.add('active');
        stepperFill.style.width = '50%';
      } else if (stepNumber === 3) {
        stepPanel3.style.display = 'block';
        stepPanel3.classList.add('fade-in');
        stepNode1.classList.add('completed');
        stepNode2.classList.add('completed');
        stepNode3.classList.add('active');
        stepperFill.style.width = '100%';
      }

      // Rola até o topo do card do formulário
      const card = document.querySelector('.checkout-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Passo 1 -> Passo 2
    if (btnGoToStep2) {
      btnGoToStep2.addEventListener('click', () => {
        if (validateStep1()) {
          goToStep(2);
        }
      });
    }

    // Passo 2 -> Passo 1
    if (btnBackToStep1) {
      btnBackToStep1.addEventListener('click', () => {
        goToStep(1);
      });
    }

    // Passo 2 -> Passo 3
    if (btnGoToStep3) {
      btnGoToStep3.addEventListener('click', () => {
        if (validateStep2()) {
          goToStep(3);
        }
      });
    }

    // Passo 3 -> Passo 2
    if (btnBackToStep2FromPix) {
      btnBackToStep2FromPix.addEventListener('click', () => {
        goToStep(2);
      });
    }
    if (btnBackToStep2FromCard) {
      btnBackToStep2FromCard.addEventListener('click', () => {
        goToStep(2);
      });
    }
  }

  // Validação do Passo 1
  function validateStep1() {
    let isValid = true;
    const name = document.getElementById('fullNameInput');
    const email = document.getElementById('emailInput');
    const phone = document.getElementById('phoneInput');

    const errName = document.getElementById('fullNameError');
    const errEmail = document.getElementById('emailError');
    const errPhone = document.getElementById('phoneError');

    // Valida Nome
    if (!name || name.value.trim().length < 3 || !name.value.trim().includes(' ')) {
      showError(name, errName, 'Digite seu nome e sobrenome completo.');
      isValid = false;
    } else {
      clearError(name, errName);
      state.customer.fullName = name.value.trim();
    }

    // Valida E-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email.value.trim())) {
      showError(email, errEmail, 'Digite um e-mail válido (ex: seuemail@exemplo.com).');
      isValid = false;
    } else {
      clearError(email, errEmail);
      state.customer.email = email.value.trim().toLowerCase();
    }

    // Valida Telefone
    const phoneClean = phone ? phone.value.replace(/\D/g, '') : '';
    if (phoneClean.length < 10) {
      showError(phone, errPhone, 'Digite um número de telefone/WhatsApp válido com DDD.');
      isValid = false;
    } else {
      clearError(phone, errPhone);
      state.customer.phone = phone.value;
    }

    return isValid;
  }

  // Validação do Passo 2
  function validateStep2() {
    let isValid = true;
    const cep = document.getElementById('cepInput');
    const street = document.getElementById('streetInput');
    const number = document.getElementById('numberInput');
    const neighborhood = document.getElementById('neighborhoodInput');
    const city = document.getElementById('cityInput');
    const stateEl = document.getElementById('stateInput');

    const errCep = document.getElementById('cepError');
    const errStreet = document.getElementById('streetError');
    const errNumber = document.getElementById('numberError');
    const errNeighborhood = document.getElementById('neighborhoodError');
    const errCity = document.getElementById('cityError');
    const errState = document.getElementById('stateError');

    // CEP
    const cepClean = cep ? cep.value.replace(/\D/g, '') : '';
    if (cepClean.length !== 8) {
      showError(cep, errCep, 'Digite um CEP válido com 8 dígitos.');
      isValid = false;
    } else {
      clearError(cep, errCep);
      state.address.cep = cep.value;
    }

    // Rua
    if (!street || street.value.trim().length < 3) {
      showError(street, errStreet, 'Informe o nome da sua rua ou avenida.');
      isValid = false;
    } else {
      clearError(street, errStreet);
      state.address.street = street.value.trim();
    }

    // Número
    if (!number || number.value.trim().length < 1) {
      showError(number, errNumber, 'Informe o número.');
      isValid = false;
    } else {
      clearError(number, errNumber);
      state.address.number = number.value.trim();
    }

    // Bairro
    if (!neighborhood || neighborhood.value.trim().length < 2) {
      showError(neighborhood, errNeighborhood, 'Informe o seu bairro.');
      isValid = false;
    } else {
      clearError(neighborhood, errNeighborhood);
      state.address.neighborhood = neighborhood.value.trim();
    }

    // Cidade
    if (!city || city.value.trim().length < 2) {
      showError(city, errCity, 'Informe a sua cidade.');
      isValid = false;
    } else {
      clearError(city, errCity);
      state.address.city = city.value.trim();
    }

    // Estado (UF)
    if (!stateEl || stateEl.value.trim().length !== 2) {
      showError(stateEl, errState, 'Informe o estado com 2 letras (ex: SP).');
      isValid = false;
    } else {
      clearError(stateEl, errState);
      state.address.state = stateEl.value.trim().toUpperCase();
    }

    return isValid;
  }

  function showError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }

  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
  }

  /* ==========================================================================
     F. ABAS DE FORMA DE PAGAMENTO (PIX & CARTÃO)
     ========================================================================== */
  function setupPaymentTabs() {
    const tabBtnPix = document.getElementById('tabBtnPix');
    const tabBtnCard = document.getElementById('tabBtnCard');
    const panePix = document.getElementById('panePix');
    const paneCard = document.getElementById('paneCard');

    const btnSubmitPix = document.getElementById('btnSubmitPix');
    const btnSubmitCard = document.getElementById('btnSubmitCard');

    if (tabBtnPix && tabBtnCard && panePix && paneCard) {
      tabBtnPix.addEventListener('click', () => {
        tabBtnPix.classList.add('active');
        tabBtnPix.setAttribute('aria-selected', 'true');
        tabBtnCard.classList.remove('active');
        tabBtnCard.setAttribute('aria-selected', 'false');

        panePix.style.display = 'block';
        panePix.classList.add('fade-in');
        paneCard.style.display = 'none';
        state.paymentMethod = 'pix';
      });

      tabBtnCard.addEventListener('click', () => {
        tabBtnCard.classList.add('active');
        tabBtnCard.setAttribute('aria-selected', 'true');
        tabBtnPix.classList.remove('active');
        tabBtnPix.setAttribute('aria-selected', 'false');

        paneCard.style.display = 'block';
        paneCard.classList.add('fade-in');
        panePix.style.display = 'none';
      });
    }

    // Configurar Modal PIX e Botão Copiar
    setupPixModal();

    // Submissão PIX
    if (btnSubmitPix) {
      btnSubmitPix.addEventListener('click', () => {
        processPixPayment();
      });
    }

    // Submissão Cartão
    if (btnSubmitCard) {
      btnSubmitCard.addEventListener('click', () => {
        processCardPayment();
      });
    }
  }

  /* ==========================================================================
     G. PROCESSAMENTO DE PAGAMENTO PIX (GATEWAY 100% WHITE-LABEL)
     ========================================================================== */
  let pixPollingInterval = null;
  let pixCountdownInterval = null;

  function setupPixModal() {
    const overlay = document.getElementById('pixModalOverlay');
    const btnClose = document.getElementById('btnClosePixModal');
    const btnCopy = document.getElementById('btnCopyPix');
    const copyInput = document.getElementById('pixCopyCodeInput');
    const feedback = document.getElementById('pixCopyFeedback');
    const btnCopyText = document.getElementById('btnCopyPixText');

    if (btnClose && overlay) {
      btnClose.addEventListener('click', () => {
        overlay.style.display = 'none';
        if (pixPollingInterval) clearInterval(pixPollingInterval);
        if (pixCountdownInterval) clearInterval(pixCountdownInterval);
      });
    }

    if (btnCopy && copyInput) {
      btnCopy.addEventListener('click', async () => {
        const textToCopy = copyInput.value;
        if (!textToCopy) return;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            copyInput.select();
            document.execCommand('copy');
          }

          if (btnCopyText) btnCopyText.textContent = '✓ Copiado!';
          if (feedback) feedback.style.display = 'block';

          setTimeout(() => {
            if (btnCopyText) btnCopyText.textContent = 'Copiar Código PIX';
          }, 3500);

        } catch (err) {
          copyInput.select();
          document.execCommand('copy');
          if (btnCopyText) btnCopyText.textContent = '✓ Copiado!';
          if (feedback) feedback.style.display = 'block';
        }
      });
    }
  }

  async function processPixPayment() {
    const btnSubmitPix = document.getElementById('btnSubmitPix');
    const fmt = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const currentShipping = state.hasFreeShippingCoupon ? 0 : (state.hasInformedCep ? DEFAULT_SHIPPING_PRICE : 0);
    const totalAmount = state.kit.price + currentShipping;
    const amountInCents = Math.round(totalAmount * 100);
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = `JB-${orderNumber}`;

    if (btnSubmitPix) {
      btnSubmitPix.disabled = true;
      btnSubmitPix.innerHTML = `
        <svg style="width: 16px; height: 16px; fill: #ffffff; animation: spin 1s linear infinite;" viewBox="0 0 24 24"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>
        <span>Gerando chave PIX segura...</span>
      `;
    }

    try {
      const payload = {
        amount: amountInCents,
        orderId: orderId,
        customer: {
          name: state.customer.fullName || 'Cliente Jota B',
          email: state.customer.email || 'contato@jotabsuplementos.com.br',
          phone: state.customer.phone || '11999998888',
          documentNumber: state.customer.cpf
        },
        items: [
          {
            title: state.kit.name,
            unitPrice: amountInCents,
            quantity: 1,
            tangible: true
          }
        ]
      };

      const response = await fetch('/api/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível gerar a chave PIX no momento.');
      }

      // Preenche dados no Modal PIX
      const elModalAmount = document.getElementById('pixModalAmount');
      const elModalOrder = document.getElementById('pixModalOrderId');
      const elCopyInput = document.getElementById('pixCopyCodeInput');
      const elQrContainer = document.getElementById('pixQrContainer');
      const overlay = document.getElementById('pixModalOverlay');

      if (elModalAmount) elModalAmount.textContent = `R$ ${fmt(totalAmount)}`;
      if (elModalOrder) elModalOrder.textContent = `#${data.orderId || orderId}`;
      if (elCopyInput) elCopyInput.value = data.qrCodeText || '';

      // Renderiza QR Code
      if (elQrContainer && data.qrCodeText) {
        elQrContainer.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(elQrContainer, {
            text: data.qrCodeText,
            width: 200,
            height: 200
          });
        } else {
          const qrImg = document.createElement('img');
          qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=1&data=${encodeURIComponent(data.qrCodeText)}`;
          qrImg.alt = 'QR Code PIX';
          qrImg.style.width = '200px';
          qrImg.style.height = '200px';
          qrImg.style.borderRadius = '8px';
          elQrContainer.appendChild(qrImg);
        }
      }

      // Inicia timer de 15 minutos
      startPixCountdown(15 * 60);

      // Exibe Modal
      if (overlay) {
        overlay.style.display = 'flex';
      }

      // Inicia polling de verificação de status
      const txId = data.transactionId;
      if (txId) {
        startPixStatusPolling(txId, data.orderId || orderId, totalAmount);
      }

    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
      alert(`Atenção: Não foi possível conectar ao gateway de pagamento.\n\nDetalhes: ${err.message}\n\nPor favor, tente novamente.`);
    } finally {
      if (btnSubmitPix) {
        btnSubmitPix.disabled = false;
        renderOrderSummary();
      }
    }
  }

  function startPixCountdown(durationSeconds) {
    if (pixCountdownInterval) clearInterval(pixCountdownInterval);
    let remaining = durationSeconds;
    const timerDisplay = document.getElementById('pixTimerDisplay');

    function updateTimer() {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      if (remaining <= 0) {
        clearInterval(pixCountdownInterval);
        if (timerDisplay) timerDisplay.textContent = 'Expirado';
      }
      remaining--;
    }

    updateTimer();
    pixCountdownInterval = setInterval(updateTimer, 1000);
  }

  function startPixStatusPolling(transactionId, orderId, totalAmount) {
    if (pixPollingInterval) clearInterval(pixPollingInterval);

    pixPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-status?id=${encodeURIComponent(transactionId)}`);
        const data = await response.json();

        if (data.success && (data.paid || data.status === 'paid' || data.status === 'approved')) {
          clearInterval(pixPollingInterval);
          if (pixCountdownInterval) clearInterval(pixCountdownInterval);

          const fmt = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const redirectUrl = `obrigado.html?orderId=${encodeURIComponent(orderId)}&method=pix&name=${encodeURIComponent(state.customer.fullName)}&amount=${encodeURIComponent('R$ ' + fmt(totalAmount))}`;
          
          window.location.href = redirectUrl;
        }
      } catch (e) {
        console.warn('Erro ao consultar status PIX:', e);
      }
    }, 3000);
  }

  /* ==========================================================================
     H. PROCESSAMENTO DE PAGAMENTO CARTÃO (GATEWAY 100% WHITE-LABEL)
     ========================================================================== */
  async function processCardPayment() {
    if (!validateCardPayment()) return;

    const btnSubmitCard = document.getElementById('btnSubmitCard');
    const fmt = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const currentShipping = state.hasFreeShippingCoupon ? 0 : (state.hasInformedCep ? DEFAULT_SHIPPING_PRICE : 0);
    const totalAmount = state.kit.price + currentShipping;
    const amountInCents = Math.round(totalAmount * 100);
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = `JB-${orderNumber}`;

    const numInput = document.getElementById('cardNumberInput');
    const holderInput = document.getElementById('cardHolderInput');
    const expInput = document.getElementById('cardExpiryInput');
    const cvvInput = document.getElementById('cardCvvInput');
    const installmentsSelect = document.getElementById('cardInstallmentsSelect');

    const expParts = (expInput ? expInput.value : '').split('/');
    let expMonth = parseInt(expParts[0] || '12', 10);
    let expYear = parseInt(expParts[1] || '2028', 10);
    if (expYear < 100) expYear += 2000;

    const installments = installmentsSelect ? parseInt(installmentsSelect.value, 10) || 1 : 1;

    if (btnSubmitCard) {
      btnSubmitCard.disabled = true;
      btnSubmitCard.innerHTML = `
        <svg style="width: 16px; height: 16px; fill: #ffffff; animation: spin 1s linear infinite;" viewBox="0 0 24 24"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>
        <span>Processando pagamento blindado...</span>
      `;
    }

    try {
      const payload = {
        amount: amountInCents,
        orderId: orderId,
        installments: installments,
        customer: {
          name: state.customer.fullName || 'Cliente Jota B',
          email: state.customer.email || 'contato@jotabsuplementos.com.br',
          phone: state.customer.phone || '11999998888',
          documentNumber: state.customer.cpf
        },
        card: {
          number: numInput ? numInput.value.replace(/\D/g, '') : '',
          holderName: holderInput ? holderInput.value.trim().toUpperCase() : '',
          expirationMonth: expMonth,
          expirationYear: expYear,
          cvv: cvvInput ? cvvInput.value.trim() : ''
        },
        items: [
          {
            title: state.kit.name,
            unitPrice: amountInCents,
            quantity: 1,
            tangible: true
          }
        ]
      };

      const response = await fetch('/api/create-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Transação não autorizada. Verifique os dados do cartão.');
      }

      // Se houver 3DS Redirect
      if (data.threeDSRedirectUrl) {
        window.location.href = data.threeDSRedirectUrl;
        return;
      }

      // Se foi recusado pela adquirente
      if (data.refused) {
        alert(`Pagamento não autorizado pela operadora do cartão: ${data.refusedReason || 'Transação recusada. Verifique os dados digitados, o limite disponível ou pague com PIX com aprovação instantânea.'}`);
        return;
      }

      // Sucesso / Aprovado
      const redirectUrl = `obrigado.html?orderId=${encodeURIComponent(data.orderId || orderId)}&method=card&name=${encodeURIComponent(state.customer.fullName)}&amount=${encodeURIComponent('R$ ' + fmt(totalAmount))}`;
      window.location.href = redirectUrl;

    } catch (err) {
      console.error('Erro ao processar cartão:', err);
      alert(`Atenção ao processar cartão: ${err.message}\n\nRecomendamos tentar via PIX Instantâneo caso o erro persista.`);
    } finally {
      if (btnSubmitCard) {
        btnSubmitCard.disabled = false;
        btnSubmitCard.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <span id="btnCardLabel">FINALIZAR PEDIDO</span>
        `;
      }
    }
  }

  function validateCardPayment() {
    let isValid = true;
    const number = document.getElementById('cardNumberInput');
    const holder = document.getElementById('cardHolderInput');
    const exp = document.getElementById('cardExpiryInput');
    const cvv = document.getElementById('cardCvvInput');

    const errNumber = document.getElementById('cardNumberError');
    const errHolder = document.getElementById('cardHolderError');
    const errExp = document.getElementById('cardExpiryError');
    const errCvv = document.getElementById('cardCvvError');

    const cleanNum = number ? number.value.replace(/\D/g, '') : '';
    if (cleanNum.length < 13) {
      showError(number, errNumber, 'Número de cartão inválido.');
      isValid = false;
    } else {
      clearError(number, errNumber);
    }

    if (!holder || holder.value.trim().length < 4) {
      showError(holder, errHolder, 'Informe o nome completo impresso no cartão.');
      isValid = false;
    } else {
      clearError(holder, errHolder);
    }

    if (!exp || exp.value.length !== 5) {
      showError(exp, errExp, 'Data de validade inválida (MM/AA).');
      isValid = false;
    } else {
      clearError(exp, errExp);
    }

    if (!cvv || cvv.value.length < 3) {
      showError(cvv, errCvv, 'CVV inválido (3 ou 4 dígitos).');
      isValid = false;
    } else {
      clearError(cvv, errCvv);
    }

    return isValid;

  }

  /* ==========================================================================
     G. GERADOR DE CPF VÁLIDO E ALEATÓRIO (EM SEGUNDO PLANO PARA O GATEWAY)
     ========================================================================== */
  function generateValidCPF() {
    const rnd = (n) => Math.round(Math.random() * n);
    const mod = (dividendo, divisor) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));

    const n1 = rnd(9);
    const n2 = rnd(9);
    const n3 = rnd(9);
    const n4 = rnd(9);
    const n5 = rnd(9);
    const n6 = rnd(9);
    const n7 = rnd(9);
    const n8 = rnd(9);
    const n9 = rnd(9);

    let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
    d1 = 11 - (mod(d1, 11));
    if (d1 >= 10) d1 = 0;

    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
    d2 = 11 - (mod(d2, 11));
    if (d2 >= 10) d2 = 0;

    return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
  }
}

/**
 * main.js - Script principal do site da ONG Anajo
 * Este arquivo contém todas as funcionalidades JavaScript comuns a todas as páginas do site
 */

// Registrar o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de componentes e funcionalidades
    initAccessibilityFeatures();
    initStickyHeader();
    initBackToTop();
    initCookieConsent();
    initAnimations();
    initLazyLoading();
    
    // Inicialização de componentes específicos de páginas
    if (document.querySelector('.project-filters')) {
        initProjectFilters();
    }
    
    if (document.querySelector('.donation-amount-options')) {
        initDonationOptions();
    }
    
    if (document.querySelector('.payment-method')) {
        initPaymentMethods();
    }
    
    if (document.querySelector('.copy-button')) {
        initCopyButtons();
    }
});

/**
 * Inicializa as funcionalidades de acessibilidade
 */
function initAccessibilityFeatures() {
    // Botão de aumento de fonte
    const increaseFont = document.getElementById('increase-font');
    if (increaseFont) {
        increaseFont.addEventListener('click', function() {
            changeFontSize(1);
        });
    }
    
    // Botão de diminuição de fonte
    const decreaseFont = document.getElementById('decrease-font');
    if (decreaseFont) {
        decreaseFont.addEventListener('click', function() {
            changeFontSize(-1);
        });
    }
    
    // Botão de alto contraste
    const contrastToggle = document.getElementById('contrast-toggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            
            // Salvar preferência no localStorage
            if (document.body.classList.contains('high-contrast')) {
                localStorage.setItem('high-contrast', 'true');
            } else {
                localStorage.setItem('high-contrast', 'false');
            }
        });
        
        // Verificar preferência salva
        if (localStorage.getItem('high-contrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }
    
    // Adicionar link de pular para o conteúdo principal
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Pular para o conteúdo principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Adicionar ID ao conteúdo principal se não existir
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main-content';
    }
}

/**
 * Altera o tamanho da fonte do site
 * @param {number} change - Valor de mudança (1 para aumentar, -1 para diminuir)
 */
function changeFontSize(change) {
    // Obter o tamanho atual da fonte ou definir o padrão
    let currentSize = parseFloat(localStorage.getItem('font-size')) || 100;
    
    // Alterar o tamanho (limitando entre 80% e 150%)
    currentSize += change * 10;
    currentSize = Math.max(80, Math.min(150, currentSize));
    
    // Aplicar o novo tamanho
    document.documentElement.style.fontSize = `${currentSize}%`;
    
    // Salvar no localStorage
    localStorage.setItem('font-size', currentSize.toString());
}

/**
 * Inicializa o cabeçalho fixo com efeito de scroll
 */
function initStickyHeader() {
    const header = document.querySelector('header');
    const navbar = document.querySelector('.navbar');
    
    if (header && navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
}

/**
 * Inicializa o botão de voltar ao topo
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Inicializa o banner de consentimento de cookies
 */
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieReject = document.getElementById('cookieReject');
    
    if (cookieConsent && cookieAccept && cookieReject) {
        // Verificar se o usuário já deu consentimento
        if (!localStorage.getItem('cookie-consent')) {
            // Mostrar o banner após 1 segundo
            setTimeout(function() {
                cookieConsent.style.display = 'block';
            }, 1000);
        }
        
        // Botão de aceitar
        cookieAccept.addEventListener('click', function() {
            localStorage.setItem('cookie-consent', 'accepted');
            cookieConsent.style.display = 'none';
        });
        
        // Botão de rejeitar
        cookieReject.addEventListener('click', function() {
            localStorage.setItem('cookie-consent', 'rejected');
            cookieConsent.style.display = 'none';
        });
    }
}

/**
 * Inicializa as animações de elementos ao scroll
 */
function initAnimations() {
    // Elementos que serão animados ao entrar na viewport
    const animatedElements = document.querySelectorAll('.card, .project-card, .team-member, .testimonial-card, .stat-item');
    
    if (animatedElements.length > 0) {
        // Função para verificar se um elemento está visível na viewport
        const isElementInViewport = function(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
        };
        
        // Função para animar elementos visíveis
        const animateElementsInViewport = function() {
            animatedElements.forEach(function(element, index) {
                if (isElementInViewport(element)) {
                    // Adicionar delay baseado no índice para efeito cascata
                    setTimeout(function() {
                        element.style.animationPlayState = 'running';
                    }, index * 100);
                }
            });
        };
        
        // Executar na carga inicial e no scroll
        animateElementsInViewport();
        window.addEventListener('scroll', animateElementsInViewport);
    }
}

/**
 * Inicializa o carregamento lazy de imagens
 */
function initLazyLoading() {
    // Selecionar todas as imagens com a classe lazy-load
    const lazyImages = document.querySelectorAll('img.lazy-load');
    
    if (lazyImages.length > 0) {
        // Verificar se o IntersectionObserver é suportado
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        
                        // Carregar a imagem
                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                        }
                        
                        // Adicionar classe para fade-in
                        image.classList.add('loaded');
                        
                        // Parar de observar após carregar
                        imageObserver.unobserve(image);
                    }
                });
            });
            
            // Observar cada imagem
            lazyImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback para navegadores que não suportam IntersectionObserver
            // Carregar todas as imagens imediatamente
            lazyImages.forEach(function(image) {
                if (image.dataset.src) {
                    image.src = image.dataset.src;
                }
                image.classList.add('loaded');
            });
        }
    }
}

/**
 * Inicializa os filtros da galeria de projetos
 */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filters .btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    if (filterButtons.length > 0 && projectItems.length > 0) {
        // Adicionar evento de clique a cada botão de filtro
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Remover classe active de todos os botões
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Adicionar classe active ao botão clicado
                this.classList.add('active');
                
                // Obter a categoria do filtro
                const filter = this.getAttribute('data-filter');
                
                // Filtrar os projetos
                projectItems.forEach(function(item) {
                    if (filter === 'todos' || item.classList.contains(filter)) {
                        // Mostrar com animação de fade
                        item.style.display = 'block';
                        setTimeout(function() {
                            item.style.opacity = '1';
                        }, 50);
                    } else {
                        // Esconder com animação de fade
                        item.style.opacity = '0';
                        setTimeout(function() {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
}

/**
 * Inicializa as opções de doação
 */
function initDonationOptions() {
    const donationOptions = document.querySelectorAll('.donation-amount-option');
    const customAmountInput = document.getElementById('custom-amount');
    
    if (donationOptions.length > 0) {
        // Adicionar evento de clique a cada opção de valor
        donationOptions.forEach(function(option) {
            option.addEventListener('click', function() {
                // Remover classe active de todas as opções
                donationOptions.forEach(function(opt) {
                    opt.classList.remove('active');
                });
                
                // Adicionar classe active à opção clicada
                this.classList.add('active');
                
                // Se for a opção personalizada, focar no input
                if (this.classList.contains('custom')) {
                    if (customAmountInput) {
                        customAmountInput.focus();
                    }
                } else {
                    // Atualizar o valor selecionado
                    const selectedAmount = this.getAttribute('data-amount');
                    if (document.getElementById('selected-amount')) {
                        document.getElementById('selected-amount').textContent = selectedAmount;
                    }
                }
            });
        });
        
        // Evento para o input de valor personalizado
        if (customAmountInput) {
            customAmountInput.addEventListener('focus', function() {
                // Ativar a opção personalizada
                donationOptions.forEach(function(opt) {
                    opt.classList.remove('active');
                });
                
                const customOption = document.querySelector('.donation-amount-option.custom');
                if (customOption) {
                    customOption.classList.add('active');
                }
            });
            
            customAmountInput.addEventListener('input', function() {
                // Atualizar o valor selecionado
                if (document.getElementById('selected-amount')) {
                    document.getElementById('selected-amount').textContent = this.value;
                }
            });
        }
    }
}

/**
 * Inicializa os métodos de pagamento
 */
function initPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDetails = document.querySelectorAll('.payment-details');
    
    if (paymentMethods.length > 0 && paymentDetails.length > 0) {
        // Esconder todos os detalhes de pagamento inicialmente
        paymentDetails.forEach(function(detail) {
            detail.style.display = 'none';
        });
        
        // Mostrar o primeiro método por padrão
        if (paymentMethods[0]) {
            paymentMethods[0].classList.add('active');
            const firstMethodId = paymentMethods[0].getAttribute('data-method');
            const firstMethodDetails = document.getElementById(`${firstMethodId}-details`);
            if (firstMethodDetails) {
                firstMethodDetails.style.display = 'block';
            }
        }
        
        // Adicionar evento de clique a cada método de pagamento
        paymentMethods.forEach(function(method) {
            method.addEventListener('click', function() {
                // Remover classe active de todos os métodos
                paymentMethods.forEach(function(m) {
                    m.classList.remove('active');
                });
                
                // Adicionar classe active ao método clicado
                this.classList.add('active');
                
                // Esconder todos os detalhes de pagamento
                paymentDetails.forEach(function(detail) {
                    detail.style.display = 'none';
                });
                
                // Mostrar os detalhes do método selecionado
                const methodId = this.getAttribute('data-method');
                const methodDetails = document.getElementById(`${methodId}-details`);
                if (methodDetails) {
                    methodDetails.style.display = 'block';
                }
            });
        });
    }
}

/**
 * Inicializa os botões de cópia
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    if (copyButtons.length > 0) {
        copyButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Obter o texto a ser copiado
                const textToCopy = this.getAttribute('data-copy');
                
                // Criar um elemento temporário para copiar o texto
                const tempInput = document.createElement('input');
                tempInput.value = textToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // Feedback visual
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                
                // Restaurar o texto original após 2 segundos
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    }
}

/**
 * Valida um formulário
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - Retorna true se o formulário for válido
 */
function validateForm(form) {
    let isValid = true;
    
    // Validar campos obrigatórios
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validar e-mail
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
            isValid = false;
            emailField.classList.add('is-invalid');
        } else {
            emailField.classList.remove('is-invalid');
        }
    }
    
    return isValid;
}

/**
 * Formata um número como moeda brasileira
 * @param {number} value - O valor a ser formatado
 * @returns {string} - O valor formatado como moeda
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param {Date|string} date - A data a ser formatada
 * @returns {string} - A data formatada
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Gera um ID único
 * @returns {string} - Um ID único
 */
function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Detecta o dispositivo do usuário
 * @returns {string} - O tipo de dispositivo (mobile, tablet ou desktop)
 */
function detectDevice() {
    const width = window.innerWidth;
    
    if (width < 768) {
        return 'mobile';
    } else if (width < 992) {
        return 'tablet';
    } else {
        return 'desktop';
    }
}

/**
 * Adiciona um evento de clique fora de um elemento
 * @param {HTMLElement} element - O elemento a ser monitorado
 * @param {Function} callback - A função a ser chamada quando ocorrer um clique fora do elemento
 */
function addClickOutsideEvent(element, callback) {
    document.addEventListener('click', function(event) {
        if (!element.contains(event.target)) {
            callback();
        }
    });
}

/**
 * Debounce para limitar a execução de funções
 * @param {Function} func - A função a ser executada
 * @param {number} wait - O tempo de espera em milissegundos
 * @returns {Function} - A função com debounce
 */
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
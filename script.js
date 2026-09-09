/* ================= RESPUESTAS DEL QUIZ + WHATSAPP ================= */

const respuestasQuiz = {};
const WHATSAPP_LINK = "https://wa.me/5511932383351";
const CHECKOUT_LINK = "https://pay.lowify.com.br/checkout.php?product_id=6Ccbaw";
const CHECKOUT_LINK_VSL = "https://pay.hotmart.com/Q107533357A?bid=1788917986574";

/* ================= CHECKOUT DINÂMICO ================= */
// Monta um link de checkout repassando os parâmetros de rastreamento (UTMs,
// fbclid, gclid etc.) que chegaram na URL da página, para não perder a
// atribuição da campanha até a hora do pagamento. Recebe o link base como
// parâmetro para poder ser reaproveitada por qualquer botão de checkout.
function montarLinkComUtms(linkBase) {
    try {
        const paramsAtuais = new URLSearchParams(window.location.search);

        const chavesParaRepassar = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
            'fbclid', 'gclid', 'ttclid',
            'sck', 'xcod',
            'src', 'sub1', 'sub2', 'sub3', 'sub4', 'sub5'
        ];

        const url = new URL(linkBase);

        chavesParaRepassar.forEach(function (chave) {
            const valor = paramsAtuais.get(chave);
            if (valor) {
                url.searchParams.set(chave, valor);
            }
        });

        return url.toString();

    } catch (e) {
        // Se algo der errado ao montar a URL, cai para o link padrão
        return linkBase;
    }
}

function montarLinkCheckout() {
    return montarLinkComUtms(CHECKOUT_LINK);
}

// Chamado pelos botões de compra da oferta
function irAlPago() {
    dispararEventoPixel('InitiateCheckout', 'InitiateCheckout');
    window.location.href = montarLinkCheckout();
}

// Chamado pelo botão CTA que aparece no minuto 7:20 da VSL
function irAlPagoVSL() {
    dispararEventoPixel('InitiateCheckout', 'InitiateCheckout');
    window.location.href = montarLinkComUtms(CHECKOUT_LINK_VSL);
}

// Chamado pelo botão de suporte via WhatsApp
function irAWhatsApp() {
    window.open(WHATSAPP_LINK, '_blank');
}

// Marca a conclusão do quiz (chamado ao final do processamento, antes de
// mostrar a oferta). Não depende de nenhum backend próprio: apenas avisa
// os pixels já carregados na página.
function enviarLeadAlServidor(completo) {
    if (!completo) return;
    dispararEventoPixel('Lead', 'SubmitForm');
}

// Dispara um evento de conversão nos pixels já carregados na página
// (Meta Pixel / TikTok Pixel, se estiverem presentes).
function dispararEventoPixel(eventoMeta, eventoTikTok) {
    try {
        if (typeof fbq === 'function') {
            fbq('track', eventoMeta);
        }
    } catch (e) {}

    try {
        if (typeof ttq !== 'undefined' && ttq && typeof ttq.track === 'function') {
            ttq.track(eventoTikTok);
        }
    } catch (e) {}
}


function setProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    document.getElementById('progressWrap').querySelector('.progress-bar').style.width = clamped + '%';
}

/* ================= CTA DA VSL (aparece no minuto 7:20 do vídeo) =================
   7 minutos e 20 segundos = 440 segundos. Ajuste esse número se o corte do
   vídeo mudar. O temporizador começa a contar quando a tela do vídeo
   (showQuestion(10)) é aberta — por isso é importante que o vídeo comece a
   tocar automaticamente assim que essa tela aparece. */
const SEGUNDOS_PARA_CTA_VSL = 7 * 60 + 20;
let ctaVslJaAgendado = false;

function agendarCtaVsl() {
    if (ctaVslJaAgendado) return; // não deixa agendar de novo se o usuário voltar/avançar
    ctaVslJaAgendado = true;

    setTimeout(function () {
        const botaoCta = document.getElementById('btnDepoisVideo');
        if (botaoCta) {
            botaoCta.classList.remove('cta-vsl-oculto');
            botaoCta.classList.add('cta-vsl-visivel');
        }
    }, SEGUNDOS_PARA_CTA_VSL * 1000);
}

function showQuestion(questionNumber) {
    setProgress(questionNumber * 8.3334);

    // Esconde todos os quizzes
    for (let i = 1; i <= 17; i++) {
        const el = document.querySelector('.on-off-' + i);
        if (el) el.style.display = 'none';
    }
    
    // Mostra o quiz atual
    const selector = questionNumber === 1 ? '.on-off-1' : '.on-off-' + questionNumber;
    const current = document.querySelector(selector);
    if (current) {
        // As telas de pergunta puras (.quiz-center) precisam de display:flex
        // para a centralização vertical funcionar; as demais continuam block.
        current.style.display = current.classList.contains('quiz-center') ? 'flex' : 'block';
    }

    // Ao entrar na tela da VSL, agenda o CTA para aparecer aos 7min20s
    if (questionNumber === 10) {
        agendarCtaVsl();
    }

    // Sempre que a pessoa avança/volta de pergunta, a página volta pro topo
    irParaOTopo();
}

// Leva a página de volta para o topo instantaneamente (sem esperar o
// scroll "chegar" suavemente, para não dar sensação de atraso ao clicar)
function irParaOTopo() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Fallback para navegadores que não aceitam behavior "instant"
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// Processamento simplificado e transparente
// ==========================================
// PROCESSAMENTO EM 3 ETAPAS
// ==========================================

function iniciarProcessamento() {

    irParaOTopo();

    const quizAnterior = document.querySelector('.on-off-9');
    const loadingScreen = document.querySelector('.loading-screen');

    const progressBar = document.getElementById(
        "progressBar-loadingScreen"
    );

    const loadingText = document.getElementById(
        "loadingText"
    );

    const loadingPercent = document.getElementById(
        "loadingPercent"
    );

    const loadingImage = document.getElementById(
        "loadingImage"
    );


    // ==========================================
    // ESCONDE O ÚLTIMO QUIZ
    // ==========================================

    if (quizAnterior) {
        quizAnterior.style.display = "none";
    }


    // ==========================================
    // MOSTRA O LOADING
    // ==========================================

    if (loadingScreen) {
        loadingScreen.style.display = "flex";
    }


    // ==========================================
    // ETAPAS DO PROCESSAMENTO
    // ==========================================

    const etapas = [

        {
            imagem: "imagens/processamento-1.webp",

            texto:
                "Analisando o tipo da sua pele com base nas suas respostas."
        },

        {
            imagem: "imagens/processamento-2.webp",

            texto:
                "Verificando o grau do envelhecimento da sua pele e fatores agravantes"
        },

        {
            imagem: "imagens/processamento-3.webp",

            texto:
                "Verificando se sua pele pode se reabastecer com colágeno, elastina e hidratação naturalmente"
        }

    ];


    // ==========================================
    // CONFIGURAÇÕES
    // ==========================================

    const DURACAO_ETAPA = 3000; // 3 segundos


    // ==========================================
    // EXECUTA UMA ETAPA
    // ==========================================

    function executarEtapa(numeroEtapa) {

        const etapa = etapas[numeroEtapa];


        // ==========================================
        // ATUALIZA IMAGEM
        // ==========================================

        if (loadingImage) {

            loadingImage.src = etapa.imagem;

            loadingImage.alt = etapa.texto;

        }


        // ==========================================
        // ATUALIZA TEXTO
        // ==========================================

        if (loadingText) {

            loadingText.innerText = etapa.texto;

        }


        // ==========================================
        // RESET DA PORCENTAGEM
        // ==========================================

        if (progressBar) {

            progressBar.style.width = "0%";

        }


        if (loadingPercent) {

            loadingPercent.innerText = "0%";

        }


        // ==========================================
        // COMEÇA A ANIMAÇÃO
        // ==========================================

        const inicio = performance.now();


        function animarProgresso(tempoAtual) {

            const tempoPassado = tempoAtual - inicio;

            let porcentagem =
                Math.min(
                    (tempoPassado / DURACAO_ETAPA) * 100,
                    100
                );


            porcentagem = Math.floor(porcentagem);


            // ==========================================
            // ATUALIZA BARRA
            // ==========================================

            if (progressBar) {

                progressBar.style.width =
                    porcentagem + "%";

            }


            // ==========================================
            // ATUALIZA NÚMERO
            // ==========================================

            if (loadingPercent) {

                loadingPercent.innerText =
                    porcentagem + "%";

            }


            // ==========================================
            // ETAPA TERMINOU
            // ==========================================

            if (porcentagem >= 100) {


                // Se ainda existem etapas
                if (numeroEtapa < etapas.length - 1) {

                    setTimeout(function () {

                        executarEtapa(numeroEtapa + 1);

                    }, 200);

                }


                // ==========================================
                // TODAS AS ETAPAS TERMINARAM
                // ==========================================

                else {

                    finalizarProcessamento();

                }

                return;
            }


            requestAnimationFrame(animarProgresso);

        }


        requestAnimationFrame(animarProgresso);

    }


    // ==========================================
    // FINALIZA PROCESSAMENTO
    // ==========================================

    function finalizarProcessamento() {

        if (loadingText) {

            loadingText.innerText =
                "Análise concluída!";

        }


        if (loadingPercent) {

            loadingPercent.innerText =
                "100%";

        }


        if (progressBar) {

            progressBar.style.width =
                "100%";

        }


        setTimeout(function () {

            // Esconde processamento
            if (loadingScreen) {

                loadingScreen.style.display =
                    "none";

            }


            // Vai para próxima tela
            showQuestion(17);


            // Marca lead como completo
            enviarLeadAlServidor(true);


        }, 700);

    }


    // ==========================================
    // COMEÇA NA ETAPA 1
    // ==========================================

    executarEtapa(0);

}


//Validar campo se nào treme
function validarCampo(idCampo, numeroAvanco) {
    const campo = document.getElementById(idCampo);

    if (!campo) return false;

    if (campo.value.trim() === '') {
        tremer(campo);
        campo.focus();
        return false;
    }

    showQuestion(numeroAvanco);

    return true;
}

// VALIDAR SE UMA OPÇÃO FOI SELECIONADA
function validarOpcaoQuiz(idQuiz, numeroAvanco) {

    const container = document.getElementById(idQuiz);

    if (!container) return false;

    const opcoes = container.querySelectorAll('.quiz-opcao');

    let selecionada = false;

    opcoes.forEach(opcao => {

        if (opcao.classList.contains('quiz-selecionada')) {
            selecionada = true;
        }

    });

    // Se nenhuma opção foi selecionada
    if (!selecionada) {

        tremer(container);

        return false;
    }

    // Se uma opção foi selecionada
    showQuestion(numeroAvanco);

    return true;
}

// SELECIONAR OPÇÃO DE QUIZ
function selecionarOpcaoQuiz(botao) {
    const indicador = botao.querySelector('.quiz-indicador');
    const jaSelecionado = botao.classList.toggle('quiz-selecionada');
    if (indicador) indicador.innerHTML = jaSelecionado ? '✓' : '';
}


// VALIDAR SE PELO MENOS UMA OPÇÃO FOI SELECIONADA
function validarOpcoesQuiz(idQuiz, numeroAvanco) {

    const quiz = document.getElementById(idQuiz);

    if (!quiz) return false;

    const selecionadas = quiz.querySelectorAll('.quiz-selecionada');

    // Nenhuma opção selecionada
    if (selecionadas.length === 0) {

        const opcoes = quiz.querySelector('.quiz-opcoes');

        if (opcoes) {
            tremer(opcoes);
        } else {
            tremer(quiz);
        }

        return false;
    }

    // Pelo menos uma opção selecionada
    showQuestion(numeroAvanco);

    return true;
}

//FUNÇÃO QUE VAI TREMER O ELEMENTO
function tremer(elemento) {
    elemento.classList.add("shake");

    setTimeout(() => {
        elemento.classList.remove("shake");
    }, 300);
}

/* ================= FAQ - ACORDEÓN ================= */
// Abre/fecha uma pergunta do FAQ (sem depender do Bootstrap JS, que está desativado no site)
function toggleFaq(botao) {
    const item = botao.closest('.faq-item');
    if (!item) return;
    item.classList.toggle('open');
}

/* ================= CONTADOR DE URGENCIA - OFERTAS (10 MIN) =================
   Um único prazo compartilhado por TODOS os relógios ".offer-timer-value"
   da página (funciona mesmo tendo vários, todos ficam sincronizados).
   Persiste em localStorage, igual ao contador da downsell.html, então se a
   persona recarregar a página o tempo continua de onde parou (não reinicia
   os 10 minutos a cada F5). */
(function () {
    const STORAGE_KEY = 'oferta_deadline_10min';
    const DURACAO_MS = 10 * 60 * 1000; // 10 minutos

    document.addEventListener('DOMContentLoaded', () => {
        const elementos = document.querySelectorAll('.offer-timer-value');
        if (!elementos.length) return;

        let deadline = parseInt(localStorage.getItem(STORAGE_KEY), 10);
        if (!deadline || isNaN(deadline)) {
            deadline = Date.now() + DURACAO_MS;
            try { localStorage.setItem(STORAGE_KEY, deadline); } catch (e) {}
        }

        function pad(n) {
            return String(n).padStart(2, '0');
        }

        function atualizar() {
            const restante = deadline - Date.now();
            let texto;

            if (restante <= 0) {
                texto = '00:00';
            } else {
                const minutos = Math.floor(restante / (1000 * 60));
                const segundos = Math.floor((restante % (1000 * 60)) / 1000);
                texto = pad(minutos) + ':' + pad(segundos);
            }

            elementos.forEach(el => { el.textContent = texto; });

            if (restante > 0) {
                setTimeout(atualizar, 1000);
            }
        }

        atualizar();
    });
})();

/* ================= BARRA FIXA DE CHECKOUT =================
   Aparece assim que o usuário rola para além do primeiro card de
   oferta (#pricingSection) e some se ele voltar para cima dele. */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const barra = document.getElementById('stickyCheckoutBar');
        const alvo = document.getElementById('pricingSection');
        if (!barra || !alvo || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Mostra a barra quando o card de preço sai da tela por cima
                // (ou seja, o usuário já passou da oferta e continua rolando).
                if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                    barra.classList.add('show');
                } else {
                    barra.classList.remove('show');
                }
            });
        }, { threshold: 0 });

        observer.observe(alvo);
    });
})();

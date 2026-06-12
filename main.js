// ========== AGROFUTURO 2026 - SCRIPT PRINCIPAL ==========
document.addEventListener('DOMContentLoaded', () => {
  // Elementos de acessibilidade
  const btnAumentar = document.getElementById('btn-aumentar-fonte');
  const btnDiminuir = document.getElementById('btn-diminuir-fonte');
  const btnModoEscuro = document.getElementById('btn-modo-escuro');
  const btnLerTexto = document.getElementById('btn-ler-texto');
  const btnPararLeitura = document.getElementById('btn-parar-leitura');
  const body = document.body;
  const conteudoPrincipal = document.getElementById('conteudo-principal');

  // Estado da fala
  let utteranceAtiva = null;

  // ---------- AUMENTAR / DIMINUIR FONTE ----------
  let fontSizeMultiplier = 1;

  btnAumentar.addEventListener('click', () => {
    fontSizeMultiplier = Math.min(fontSizeMultiplier + 0.1, 1.5);
    aplicarFonte();
  });

  btnDiminuir.addEventListener('click', () => {
    fontSizeMultiplier = Math.max(fontSizeMultiplier - 0.1, 0.7);
    aplicarFonte();
  });

  function aplicarFonte() {
    const baseSize = 16; // tamanho base em px
    body.style.fontSize = (baseSize * fontSizeMultiplier) + 'px';
  }

  // ---------- MODO ESCURO / CLARO ----------
  // Verifica preferência do sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  if (prefersDark.matches) {
    body.classList.add('modo-escuro');
    btnModoEscuro.textContent = '☀️';
  }

  btnModoEscuro.addEventListener('click', () => {
    body.classList.toggle('modo-escuro');
    const isDark = body.classList.contains('modo-escuro');
    btnModoEscuro.setAttribute('aria-label', isDark ? 'Modo claro' : 'Modo escuro');
    btnModoEscuro.textContent = isDark ? '☀️' : '🌓';
    
    // Salva preferência
    localStorage.setItem('modoEscuro', isDark);
  });

  // Carrega preferência salva
  if (localStorage.getItem('modoEscuro') === 'true') {
    body.classList.add('modo-escuro');
    btnModoEscuro.textContent = '☀️';
  }

  // ---------- LEITURA POR VOZ (SpeechSynthesis API) ----------
  btnLerTexto.addEventListener('click', () => {
    // Para qualquer leitura anterior
    window.speechSynthesis.cancel();
    
    // Extrai apenas texto do conteúdo principal, ignorando elementos ocultos
    const textoParaLer = conteudoPrincipal.innerText.trim();
    
    if (!textoSemImagens) return;
    
    utteranceAtiva = new SpeechSynthesisUtterance(textoParaLer);
    utteranceAtiva.lang = 'pt-BR';
    utteranceAtiva.rate = 1.0;
    utteranceAtiva.pitch = 1.0;
    utteranceAtiva.volume = 1.0;
    
    // Feedback visual
    btnLerTexto.style.background = 'var(--verde-agro)';
    btnLerTexto.style.color = 'white';
    
    utteranceAtiva.onend = () => {
      btnLerTexto.style.background = '';
      btnLerTexto.style.color = '';
    };
    
    utteranceAtiva.onerror = () => {
      btnLerTexto.style.background = '';
      btnLerTexto.style.color = '';
    };
    
    window.speechSynthesis.speak(utteranceAtiva);
  });

  btnPararLeitura.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    if (btnLerTexto) {
      btnLerTexto.style.background = '';
      btnLerTexto.style.color = '';
    }
  });

  // ---------- ACORDEÃO (Seções expansíveis) ----------
  const botoesExpandir = document.querySelectorAll('.btn-expandir');
  
  botoesExpandir.forEach(botao => {
    botao.addEventListener('click', (evento) => {
      const btn = evento.currentTarget;
      const conteudo = btn.nextElementSibling;
      const expandido = btn.getAttribute('aria-expanded') === 'true';
      
      // Animação suave
      if (expandido) {
        conteudo.style.maxHeight = '0';
        conteudo.style.opacity = '0';
        setTimeout(() => {
          conteudo.hidden = true;
        }, 300);
      } else {
        conteudo.hidden = false;
        conteudo.style.maxHeight = '0';
        conteudo.style.opacity = '0';
        requestAnimationFrame(() => {
          conteudo.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
          conteudo.style.maxHeight = conteudo.scrollHeight + 'px';
          conteudo.style.opacity = '1';
        });
      }
      
      btn.setAttribute('aria-expanded', !expandido);
      btn.textContent = expandido ? 'Detalhes da notícia' : 'Fechar detalhes';
    });
  });

  // ---------- COMENTÁRIOS ----------
  const formComentario = document.getElementById('form-comentario');
  const listaComentarios = document.getElementById('lista-comentarios');
  const textareaComentario = document.getElementById('comentario-texto');

  // Carrega comentários salvos
  const comentariosSalvos = JSON.parse(localStorage.getItem('comentariosAgroFuturo') || '[]');
  comentariosSalvos.forEach(comentario => adicionarComentarioDOM(comentario.texto, comentario.data));

  formComentario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = textareaComentario.value.trim();
    if (texto === '') {
      alert('Por favor, escreva um comentário.');
      return;
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Salva no localStorage
    const novoComentario = { texto, data: dataHora };
    comentariosSalvos.unshift(novoComentario);
    localStorage.setItem('comentariosAgroFuturo', JSON.stringify(comentariosSalvos.slice(0, 10))); // Mantém últimos 10
    
    adicionarComentarioDOM(texto, dataHora);
    textareaComentario.value = '';
    
    // Feedback visual
    const feedback = document.createElement('div');
    feedback.textContent = '✓ Comentário adicionado!';
    feedback.style.cssText = 'color: var(--verde-agro); margin-top: 0.5rem; font-weight: 600;';
    formComentario.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  });

  function adicionarComentarioDOM(texto, dataHora) {
    const novoComentario = document.createElement('div');
    novoComentario.className = 'comentario-item';
    novoComentario.innerHTML = `
      <p><strong>🌱 Produtor(a):</strong> ${texto}</p>
      <small style="color: var(--texto-claro);">${dataHora}</small>
    `;
    listaComentarios.prepend(novoComentario);
  }

  // ---------- FORMULÁRIO DE INSCRIÇÃO ----------
  const formInscricao = document.getElementById('form-inscricao');
  
  formInscricao.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simula envio
    const btnSubmit = formInscricao.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = '✓ Inscrito com sucesso!';
    btnSubmit.style.background = 'linear-gradient(135deg, var(--verde-agro), var(--verde-claro))';
    
    setTimeout(() => {
      alert('🎉 Inscrição realizada com sucesso!\n\nEm breve você receberá o link do seminário por e-mail.');
      btnSubmit.textContent = textoOriginal;
      btnSubmit.style.background = '';
      formInscricao.reset();
    }, 1500);
  });

  // ---------- BOTÕES COMPRAR ----------
  const botoesComprar = document.querySelectorAll('.btn-comprar');
  botoesComprar.forEach(botao => {
    botao.addEventListener('click', (e) => {
      e.preventDefault();
      const produto = botao.closest('.produto-card').querySelector('h3').textContent;
      alert(`🛒 Produto "${produto}" adicionado ao carrinho!\n\n(Simulação - Em breve: integração com e-commerce)`);
    });
  });

  // ---------- ANIMAÇÃO SCROLL SUAVE PARA LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  console.log('🌾 AgroFuturo 2026 - Página carregada com sucesso!');
});
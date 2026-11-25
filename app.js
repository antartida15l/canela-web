(() => {
  'use strict';
  const c = window.CANELA_CONFIG;
  if (!c) return;
  const $ = id => document.getElementById(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone = String(c.whatsapp).replace(/\D/g, '');
  const wa = text => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  const reservation = wa(c.mensajeReserva);
  const notice = $('notice');
  let noticeReturn = null;
  let toastTimeout;
  const notify = message => {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => $('toast').classList.remove('visible'), 4000);
  };
  // Permite enlaces HTTPS y archivos del propio proyecto; bloquea esquemas ejecutables.
  function safeLink(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, location.href);
      if (['https:', 'http:'].includes(url.protocol)) return url.href;
      if (location.protocol === 'file:' && url.protocol === 'file:') return url.href;
    } catch (_) {}
    return '';
  }
  function menuLink(id, url, label, message) {
    const link = $(id);
    const target = safeLink(url);
    if (target) { link.href = target; return; }
    link.href = wa(message);
    link.addEventListener('click', event => {
      event.preventDefault();
      noticeReturn = link;
      $('notice-title').textContent = label;
      $('notice-text').textContent = 'La carta en línea estará disponible pronto. Por ahora, consúltala por WhatsApp.';
      $('notice-whatsapp').href = wa(message);
      notice.showModal();
    });
  }
  $('tagline').textContent = c.frase;
  $('hours').textContent = c.horario;
  $('address').textContent = c.direccion;
  $('phone').textContent = phone.length === 11 && phone.startsWith('51')
    ? `+51 ${phone.slice(2,5)} ${phone.slice(5,8)} ${phone.slice(8)}` : `+${phone}`;
  $('reserve').href = reservation;
  $('whatsapp').href = reservation;
  $('community').href = safeLink(c.enlaces.comunidadWhatsApp) || '#';
  if (!safeLink(c.enlaces.comunidadWhatsApp)) $('community').hidden = true;
  $('location').href = safeLink(c.enlaces.ubicacion) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion)}`;
  for (const id of ['instagram', 'tiktok']) {
    const url = safeLink(c.enlaces[id]);
    if (url) $(id).href = url; else $(id).hidden = true;
  }
  // Libro de carta: giro de página con curvatura real (StPageFlip) + sonido de papel siempre activo.
  const flipbook = $('flipbook');
  const bookArea = $('book-area');
  const flipDownload = $('flip-download');
  const menuBooks = {
    cocktails: { pdf: './cartas/cocktails.pdf', total: 7, folder: './cartas/cocktails/', file: 'Canela-Carta-Cocktails.pdf' },
    comida: { pdf: './cartas/comida.pdf', total: 3, folder: './cartas/comida/', file: 'Canela-Carta-Comida.pdf' }
  };
  const pageSrc = (b, i) => `${b.folder}page-${String(i + 1).padStart(2, '0')}.webp`;
  let pageFlip = null, audioCtx = null, flipBuffers = [], resizeBook = null;

  // ---- Sonido: hoja de papel sintetizada (sin archivos externos) ----
  function buildFlipSound(ctx, seed) {
    const rate = ctx.sampleRate, len = Math.floor(rate * 0.62);
    const buf = ctx.createBuffer(1, len, rate), d = buf.getChannelData(0);
    let lp1 = 0, lp2 = 0, s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 * 2 - 1; };
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // Barrido de frescura: el papel sube de tono mientras cruza el aire.
      const cut = 0.05 + 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.25)) ** 1.4;
      const n = rnd();
      lp1 += cut * (n - lp1); lp2 += cut * (lp1 - lp2);
      const hp = lp1 - lp2 * 0.9;
      const env = Math.min(1, t / 0.07) * Math.pow(1 - t, 1.7) * (0.55 + 0.45 * Math.sin(Math.PI * t));
      let v = hp * env * 3.4;
      // Pequeños crujidos de fibra.
      if (Math.abs(rnd()) > 0.9975) v += rnd() * 0.5 * (1 - t);
      d[i] = v;
    }
    // Normaliza.
    let max = 0; for (let i = 0; i < len; i++) max = Math.max(max, Math.abs(d[i]));
    for (let i = 0; i < len; i++) d[i] = d[i] / max * 0.9;
    return buf;
  }
  function unlockAudio() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback'; // iOS: suena aunque esté en silencio
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) {
        audioCtx = new AC();
        flipBuffers = [11, 977, 4231].map(seed => buildFlipSound(audioCtx, seed));
      }
      if (audioCtx.state !== 'running') audioCtx.resume();
    } catch (_) {}
  }
  function playPageSound() {
    if (!audioCtx || !flipBuffers.length) return;
    try {
      if (audioCtx.state !== 'running') audioCtx.resume();
      const src = audioCtx.createBufferSource();
      src.buffer = flipBuffers[Math.floor(Math.random() * flipBuffers.length)];
      src.playbackRate.value = 0.94 + Math.random() * 0.12;
      const gain = audioCtx.createGain(); gain.gain.value = 0.85;
      src.connect(gain); gain.connect(audioCtx.destination); src.start();
    } catch (_) {}
  }

  // ---- Libro ----
  function buildBook(b) {
    bookArea.textContent = '';
    const host = document.createElement('div'); host.className = 'book-host';
    bookArea.appendChild(host);
    const pages = [];
    for (let i = 0; i < b.total; i++) {
      const leaf = document.createElement('div');
      leaf.className = `leaf ${i % 2 ? 'odd' : 'even'}`;
      const img = new Image(); img.src = pageSrc(b, i); img.alt = `Página ${i + 1} de la carta Canela`; img.draggable = false;
      img.decoding = 'sync';
      leaf.appendChild(img); host.appendChild(leaf); pages.push(leaf);
    }
    pageFlip = new St.PageFlip(host, {
      width: 720, height: 1008,
      size: 'stretch', minWidth: 240, maxWidth: 1500, minHeight: 336, maxHeight: 2100,
      showCover: true, usePortrait: true,
      flippingTime: reduced.matches ? 1 : 1050,
      maxShadowOpacity: 0.62, drawShadow: true, showPageCorners: true,
      mobileScrollSupport: false, swipeDistance: 18, clickEventForward: false,
      useMouseEvents: true, startPage: 0, autoSize: true
    });
    pageFlip.loadFromHTML(pages);
    const setOrientation = o => { flipbook.classList.toggle('is-portrait', o === 'portrait'); flipbook.classList.toggle('is-landscape', o !== 'portrait'); };
    setOrientation(pageFlip.getOrientation());
    pageFlip.on('changeOrientation', e => setOrientation(e.data));
    const bookHost = bookArea.firstChild;
    const isLandscape = () => pageFlip.getOrientation() !== 'portrait';
    // Portada cerrada: se centra en pantalla (la librería la deja en la mitad derecha).
    const shiftTo = closed => {
      const pw = pageFlip.getBoundsRect().pageWidth || 0;
      bookHost.style.transform = closed && isLandscape() ? `translateX(${-pw / 2}px)` : 'translateX(0)';
    };
    const atEnd = idx => isLandscape() ? idx >= b.total - 2 : idx >= b.total - 1;
    const sync = () => {
      const idx = pageFlip.getCurrentPageIndex();
      $('flip-prev').hidden = idx === 0;
      $('flip-next').hidden = atEnd(idx);
      $('flip-next').classList.toggle('nudge', idx === 0);
      shiftTo(idx === 0);
    };
    bookHost.classList.add('no-anim');
    pageFlip.on('init', () => { sync(); requestAnimationFrame(() => requestAnimationFrame(() => bookHost.classList.remove('no-anim'))); });
    pageFlip.on('changeOrientation', () => { bookHost.classList.add('no-anim'); sync(); requestAnimationFrame(() => requestAnimationFrame(() => bookHost.classList.remove('no-anim'))); });
    pageFlip.on('flip', sync);
    resizeBook = () => { if (!pageFlip) return; bookHost.classList.add('no-anim'); setTimeout(() => { if (pageFlip) { sync(); requestAnimationFrame(() => bookHost.classList.remove('no-anim')); } }, 60); };
    let lastState = 'read';
    pageFlip.on('changeState', e => {
      if (e.data === 'flipping' && lastState !== 'flipping') {
        playPageSound();
        // Mueve el libro a la vez que gira la hoja de la portada.
        try {
          const dir = pageFlip.getFlipController().getCalculation().getDirection(); // 0 adelante, 1 atrás
          const idx = pageFlip.getCurrentPageIndex();
          if (dir === 0 && idx === 0) shiftTo(false);
          if (dir === 1 && idx <= 2) shiftTo(true);
        } catch (_) {}
      }
      if (e.data === 'read') sync();
      lastState = e.data;
    });
  }
  async function openBook(key, returnEl) {
    const b = menuBooks[key]; if (!b) return;
    noticeReturn = returnEl;
    unlockAudio(); // el clic del usuario habilita el sonido
    flipDownload.href = b.pdf; flipDownload.download = b.file;
    document.body.style.overflow = 'hidden';
    flipbook.showModal();
    // Precarga y decodifica todas las páginas: así ninguna aparece en blanco al girar la primera hoja.
    const preload = Promise.all(Array.from({ length: b.total }, (_, i) => { const im = new Image(); im.src = pageSrc(b, i); return im.decode ? im.decode().catch(() => {}) : Promise.resolve(); }));
    await Promise.race([preload, new Promise(r => setTimeout(r, 3000))]);
    if (!flipbook.open) return;
    buildBook(b);
    // Siempre a pantalla completa cuando el navegador lo permite.
    try { const r = flipbook.requestFullscreen?.({ navigationUI: 'hide' }); r?.catch?.(() => {}); } catch (_) {}
  }
  function closeBook() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    if (flipbook.open) flipbook.close();
  }
  $('drinks').addEventListener('click', e => { e.preventDefault(); openBook('cocktails', $('drinks')); });
  $('food').addEventListener('click', e => { e.preventDefault(); openBook('comida', $('food')); });
  $('flip-close').addEventListener('click', closeBook);
  $('flip-prev').addEventListener('click', () => pageFlip?.flipPrev('bottom'));
  $('flip-next').addEventListener('click', () => pageFlip?.flipNext('bottom'));
  window.addEventListener('resize', () => resizeBook?.());
  flipbook.addEventListener('close', () => {
    document.body.style.overflow = '';
    try { pageFlip?.destroy(); } catch (_) {}
    pageFlip = null; bookArea.textContent = '';
    noticeReturn?.focus?.();
  });
  flipbook.addEventListener('touchstart', unlockAudio, { passive: true });
  flipbook.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('keydown', e => {
    if (!flipbook.open || !pageFlip) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') pageFlip.flipNext();
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') pageFlip.flipPrev();
  });
  // Animaciones de entrada por scroll para la página principal.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), {threshold:.12}); revealItems.forEach(el => observer.observe(el)); } else revealItems.forEach(el => el.classList.add('in-view'));
  $('close-notice').addEventListener('click', () => notice.close());
  notice.addEventListener('click', e => {if(e.target === notice) {const r=notice.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)notice.close();}});
  notice.addEventListener('close', () => noticeReturn?.focus());

  $('share').addEventListener('click', async () => {
    if (!['https:', 'http:'].includes(location.protocol)) {
      notify('Publica la web para compartir su enlace.');
      return;
    }
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({title: c.nombre, text: c.frase, url});
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        notify('Enlace copiado.');
      } else {
        window.prompt('Copia el enlace de Canela:', url);
      }
    } catch (error) {
      if (error.name !== 'AbortError') window.prompt('Copia el enlace de Canela:', url);
    }
  });

  const intro = $('intro');
  const video = $('intro-video');
  let autoClose;
  let leaveTimeout;
  let returnFocus = null;
  const duration = Math.max(1500, Number(c.introduccion.duracionMs) || 4600);
  function exitIntro() {
    if (!intro.open || intro.classList.contains('leaving')) return;
    clearTimeout(autoClose);
    intro.classList.add('leaving');
    leaveTimeout = setTimeout(() => intro.close(), reduced.matches ? 0 : 600);
  }
  function openIntro(fromButton = false) {
    clearTimeout(autoClose);
    clearTimeout(leaveTimeout);
    returnFocus = fromButton ? $('replay') : null;
    intro.classList.remove('leaving');
    intro.style.setProperty('--intro-duration', `${duration}ms`);
    intro.showModal();
    document.body.style.overflow = 'hidden';
    $('enter').focus({preventScroll:true});
    const videoSource = safeLink(c.introduccion.video);
    if (videoSource) {
      video.src = videoSource;
      video.hidden = false;
      video.currentTime = 0;
      video.play().catch(() => {video.hidden = true;});
    }
    // Con movimiento reducido, el usuario decide cuándo continuar.
    if (!reduced.matches) autoClose = setTimeout(exitIntro, duration);
  }
  video.addEventListener('error', () => {video.hidden = true;});
  video.addEventListener('ended', exitIntro);
  $('enter').addEventListener('click', exitIntro);
  intro.addEventListener('cancel', event => {event.preventDefault();exitIntro();});
  intro.addEventListener('close', () => {
    clearTimeout(autoClose);
    clearTimeout(leaveTimeout);
    document.body.style.overflow = '';
    video.pause();
    intro.classList.remove('leaving');
    returnFocus?.focus({preventScroll:true});
  });
  $('replay').addEventListener('click', () => openIntro(true));
  if (c.introduccion.activa && !reduced.matches) openIntro();
})();

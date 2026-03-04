const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => scope.querySelectorAll(sel);

function initSmoothScroll() {
  const anchorLinks = $$('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
        10
      ) || 64;

      const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      history.pushState(null, '', targetId);

      closeNavMenu();
    });
  });
}

function initNavbar() {
  const navbar = $('#navbar');
  const navLinks = $$('.nav-link');

  const sectionIds = ['introduccion', 'definicion', 'elementos', 'ejemplo', 'recursos'];

  function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const navbarHeight = navbar.offsetHeight;
    let currentSection = '';

    sectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.top - navbarHeight <= window.innerHeight / 3 && rect.bottom > navbarHeight) {
        currentSection = id;
      }
    });

    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      link.classList.toggle('active', linkSection === currentSection);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  handleScroll();
}

function initNavToggle() {
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      closeNavMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNavMenu();
  });
}

function closeNavMenu() {
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  if (!menu || !toggle) return;
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

function initScrollToTopButton() {
  const btnTop = $('#btn-top');
  if (!btnTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btnTop.classList.add('visible');
    } else {
      btnTop.classList.remove('visible');
    }
  }, { passive: true });

  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '#inicio');
  });
}

function initAccordion() {
  const accordionButtons = $$('.accordion__header');

  accordionButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const panelId = this.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      accordionButtons.forEach(otherBtn => {
        const otherPanelId = otherBtn.getAttribute('aria-controls');
        const otherPanel = document.getElementById(otherPanelId);
        otherBtn.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.classList.remove('open');
      });

      if (!isExpanded) {
        this.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });
}

function initFadeIn() {
  if (!('IntersectionObserver' in window)) {
    $$('.fade-in').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  $$('.fade-in').forEach(el => observer.observe(el));
}

function initVideoCheck() {
  const iframes = $$('iframe');

  iframes.forEach(iframe => {
    const timeoutId = setTimeout(() => {
      showVideoFallback(iframe);
    }, 10000);

    iframe.addEventListener('load', () => {
      clearTimeout(timeoutId);
    });

    iframe.addEventListener('error', () => {
      clearTimeout(timeoutId);
      showVideoFallback(iframe);
    });
  });
}

function showVideoFallback(iframe) {
  const wrapper = iframe.closest('.video-wrapper');
  const fallback = wrapper ? wrapper.nextElementSibling : null;

  if (fallback && fallback.classList.contains('media-block__fallback')) {
    fallback.style.color = '#e17055';
    fallback.style.fontWeight = '600';
  }
}

function initReadingProgress() {
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Progreso de lectura');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');

  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0%',
    height: '3px',
    background: 'linear-gradient(90deg, #6c63ff, #fd79a8)',
    zIndex: '9999',
    transition: 'width 0.1s linear',
    borderRadius: '0 2px 2px 0'
  });

  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const rounded = Math.min(100, Math.round(scrollPercent));

    bar.style.width = rounded + '%';
    bar.setAttribute('aria-valuenow', rounded);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavbar();
  initNavToggle();
  initScrollToTopButton();
  initAccordion();
  initFadeIn();
  initVideoCheck();
  initReadingProgress();
});

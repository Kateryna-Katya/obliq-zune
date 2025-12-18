/**
 * ПОЛНЫЙ СКРИПТ САЙТА (Версия с исправленным телефоном)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. РЕГИСТРАЦИЯ ПЛАГИНОВ ---
  gsap.registerPlugin(ScrollTrigger);

  // --- 2. ИНИЦИАЛИЗАЦИЯ LENIS (ПЛАВНЫЙ СКРОЛЛ) ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  if (window.lucide) lucide.createIcons();

  // --- 3. МОБИЛЬНОЕ МЕНЮ ---
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link');

  if (burger && nav) {
    const toggleMenu = () => {
      const isOpen = nav.classList.toggle('open');
      burger.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', () => {
      if (nav.classList.contains('open')) toggleMenu();
    }));
  }

  const header = document.querySelector('.header');
  if (header) {
    ScrollTrigger.create({
      start: "top -50",
      onUpdate: (self) => {
        header.classList.toggle('scrolled', self.scroll() > 50);
      }
    });
  }

  // --- 4. АНИМАЦИИ GSAP ---
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const splitHero = new SplitType(heroTitle, { types: 'chars' });
    gsap.from(splitHero.chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.03,
      duration: 1.2,
      ease: "power4.out"
    });
    gsap.from('.fade-in', {
      opacity: 0, y: 30, stagger: 0.2, duration: 1, delay: 0.5, ease: "power3.out"
    });
  }

  gsap.utils.toArray('.fade-up').forEach(elem => {
    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      opacity: 0, y: 40, duration: 0.8, ease: "power2.out"
    });
  });

  // --- 5. ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ (МЕНТОРСТВО) ---
  const initHorizontal = () => {
    const toolsSection = document.querySelector('.tools-horizontal-container');
    const toolsTrack = document.querySelector('.tools-track');

    if (toolsSection && toolsTrack) {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        const getScrollAmount = () => toolsTrack.scrollWidth - window.innerWidth;
        const tween = gsap.to(toolsTrack, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: toolsSection,
            start: "top top",
            end: () => `+=${toolsTrack.scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
        return () => {
          if (tween.scrollTrigger) tween.scrollTrigger.kill();
          gsap.set(toolsTrack, { clearProps: "all" });
        };
      });
    }
  };

  // --- 6. SWIPER (БЛОГ) ---
  if (document.querySelector('.blog-slider')) {
    new Swiper('.blog-slider', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 30 }
      }
    });
  }

  // --- 7. ВАЛИДАЦИЯ ФОРМЫ (ИСПРАВЛЕНО) ---
  const form = document.getElementById('contact-form');
  if (form) {
    const captchaLabel = document.getElementById('captcha-label');
    const successPopup = document.getElementById('success-popup');
    const phoneInput = form.querySelector('input[type="tel"]');

    let n1 = Math.floor(Math.random() * 10), n2 = Math.floor(Math.random() * 10);
    let captchaResult = n1 + n2;
    if (captchaLabel) captchaLabel.textContent = `Сколько будет ${n1} + ${n2}? *`;

    // ЗАПРЕТ ВВОДА БУКВ В ТЕЛЕФОН (в реальном времени)
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        // Удаляем всё, кроме цифр, плюса, скобок и дефиса
        e.target.value = e.target.value.replace(/[^\d+()\- ]/g, '');
      });
    }

    const validate = (input) => {
      const group = input.closest('.form__group');
      const error = group.querySelector('.form__error');
      let isValid = true;
      let msg = "";

      const val = input.value.trim();

      if (input.hasAttribute('required') && !val && input.type !== 'checkbox') {
        isValid = false;
        msg = "Это поле обязательно";
      }
      else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        isValid = false;
        msg = "Неверный формат email";
      }
      else if (input.type === 'tel' && val && !/^[0-9+\s()\-]{7,20}$/.test(val)) {
        isValid = false;
        msg = "Введите корректный номер";
      }
      else if (input.id === 'captcha' && parseInt(val) !== captchaResult) {
        isValid = false;
        msg = "Неверный ответ";
      }
      else if (input.type === 'checkbox' && !input.checked) {
        isValid = false;
        msg = "Нужно ваше согласие";
      }

      input.classList.toggle('error', !isValid);
      if (error) {
        error.innerText = msg;
        error.style.display = isValid ? 'none' : 'block';
      }
      return isValid;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = Array.from(form.querySelectorAll('input, textarea'));
      const formValid = inputs.every(validate);

      if (formValid) {
        const btn = form.querySelector('.btn--submit');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Отправка...";

        setTimeout(() => {
          form.reset();
          btn.disabled = false;
          btn.innerText = originalText;
          successPopup?.classList.add('show');
          // Обновляем капчу для следующего раза
          n1 = Math.floor(Math.random() * 10); n2 = Math.floor(Math.random() * 10);
          captchaResult = n1 + n2;
          if (captchaLabel) captchaLabel.textContent = `Сколько будет ${n1} + ${n2}? *`;
        }, 2000);
      }
    });

    document.getElementById('close-popup')?.addEventListener('click', () => {
      successPopup?.classList.remove('show');
    });
  }

  // --- 8. КУКИ ---
  const cookiePopup = document.getElementById('cookie-popup');
  if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
    setTimeout(() => cookiePopup.classList.add('show'), 2000);
    document.getElementById('accept-cookies')?.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookiePopup.classList.remove('show');
    });
  }

  // --- 9. ЗАПУСК ---
  window.addEventListener("load", () => {
    initHorizontal();
    ScrollTrigger.refresh();
  });
});
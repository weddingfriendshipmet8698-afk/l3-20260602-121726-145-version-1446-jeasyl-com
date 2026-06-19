(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    var hero = qs('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-movie-grid]');
    if (!panel || !grid) {
      return;
    }

    var keywordInput = qs('[data-filter-keyword]', panel);
    var categorySelect = qs('[data-filter-category]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var empty = qs('[data-empty-state]');
    var cards = qsa('[data-movie-card]', grid);

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' '));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [keywordInput, categorySelect, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
  });
})();

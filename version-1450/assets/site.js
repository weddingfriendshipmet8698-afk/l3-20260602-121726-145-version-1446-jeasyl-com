(function () {
  var body = document.body;
  var mobileToggle = document.querySelector('[data-mobile-toggle]');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('img[data-fallback-image]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('src');
    });
  });

  var backTop = document.querySelector('[data-backtop]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    showSlide(0);
    startAutoPlay();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterPanel && filterGrid) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var countOutput = filterPanel.querySelector('[data-filter-count]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get('search') || '';

    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        var haystack = normalize(card.getAttribute('data-search'));

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }

        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

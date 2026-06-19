(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initLocalFilters() {
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-region-filter]');
    var year = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-message]');
    if (!cards.length || (!input && !region && !year)) {
      return;
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var regionValue = normalize(region ? region.value : '');
      var yearValue = normalize(year ? year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var show = matchKeyword && matchRegion && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var field = form.querySelector('input[name="q"]');
        var value = field ? field.value.trim() : '';
        if (!value) {
          return;
        }
        var target = form.getAttribute('data-search-target') || 'search.html';
        window.location.href = target + '?q=' + encodeURIComponent(value);
      });
    });
  }

  function buildSearchCard(movie) {
    var title = escapeHtml(movie.title);
    var cover = escapeHtml(movie.cover);
    var url = escapeHtml(movie.url);
    var year = escapeHtml(movie.year);
    var region = escapeHtml(movie.region);
    var type = escapeHtml(movie.type);
    var category = escapeHtml(movie.category);
    var oneLine = escapeHtml(movie.oneLine);

    return [
      '<a class="movie-card" href="' + url + '" data-movie-card>',
      '  <div class="poster-wrap">',
      '    <img src="' + cover + '" alt="' + title + '" loading="lazy">',
      '    <span class="poster-year">' + year + '</span>',
      '  </div>',
      '  <div class="card-content">',
      '    <h3>' + title + '</h3>',
      '    <p>' + oneLine + '</p>',
      '    <div class="card-meta">' + year + ' · ' + region + ' · ' + type + '</div>',
      '    <div class="tag-row"><span>' + category + '</span></div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    var resultBox = document.querySelector('[data-search-results]');
    var field = document.querySelector('[data-search-page-input]');
    var empty = document.querySelector('[data-empty-message]');
    if (!resultBox || typeof SEARCH_DATA === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (field) {
      field.value = initial;
    }

    function render() {
      var keyword = normalize(field ? field.value : initial);
      var results = SEARCH_DATA.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 120);

      resultBox.innerHTML = results.map(buildSearchCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    if (field) {
      field.addEventListener('input', render);
    }
    render();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-play-cover]');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var attached = false;

      function attachStream() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function beginPlay() {
        attachStream();
        box.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', beginPlay);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlay();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initLocalFilters();
    initSearchForms();
    initSearchPage();
    initPlayers();
  });
})();

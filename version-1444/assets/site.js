(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-card-filter]');
        var year = scope.querySelector('[data-year-filter]');
        var count = scope.querySelector('[data-visible-count]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            var q = normalize(input && input.value);
            var selectedYear = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var matchesQuery = !q || haystack.indexOf(q) !== -1;
                var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var show = matchesQuery && matchesYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }
        if (year) {
            year.addEventListener('change', filterCards);
        }
        filterCards();
    });

    document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
        var video = shell.querySelector('[data-video-player]');
        var button = shell.querySelector('[data-video-play]');
        var source = video ? video.getAttribute('data-video-src') : '';
        var hlsInstance = null;

        function attachSource() {
            if (!video || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        if (button && video) {
            button.addEventListener('click', function () {
                if (!video.src && !hlsInstance) {
                    attachSource();
                }
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            });
        }
    });

    if (window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var form = document.querySelector('[data-search-page-form]');
        var results = document.querySelector('[data-search-results]');
        var defaultBlock = document.querySelector('[data-search-default]');
        var grid = document.querySelector('[data-search-grid]');
        var count = document.querySelector('[data-search-count]');

        if (form && form.q) {
            form.q.value = query;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>'"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[char];
            });
        }

        function renderCard(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-mask">立即播放</span>',
                '</a>',
                '<div class="movie-info">',
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p class="meta-line">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</p>',
                '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
                '</div>',
                '</article>'
            ].join('');
        }

        if (query && results && grid) {
            var q = query.toLowerCase();
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.category, movie.genre, movie.tags, movie.desc]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(q) !== -1;
            }).slice(0, 120);

            grid.innerHTML = matched.map(renderCard).join('');
            results.hidden = false;
            if (defaultBlock) {
                defaultBlock.hidden = true;
            }
            if (count) {
                count.textContent = String(matched.length);
            }
        }
    }
}());

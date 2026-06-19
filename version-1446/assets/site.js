import { H as Hls } from './video-vendor.js';

const mobileToggle = document.querySelector('[data-mobile-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', () => {
        mobilePanel.classList.toggle('open');
    });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
let activeSlide = 0;
let heroTimer = null;

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === activeSlide);
    });
}

function startHeroTimer() {
    if (!slides.length) {
        return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => {
        showSlide(activeSlide + 1);
    }, 5200);
}

document.querySelectorAll('[data-hero-next]').forEach((button) => {
    button.addEventListener('click', () => {
        showSlide(activeSlide + 1);
        startHeroTimer();
    });
});

document.querySelectorAll('[data-hero-prev]').forEach((button) => {
    button.addEventListener('click', () => {
        showSlide(activeSlide - 1);
        startHeroTimer();
    });
});

showSlide(0);
startHeroTimer();

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

const filterInput = document.querySelector('[data-page-filter]');
const yearSelect = document.querySelector('[data-year-filter]');
const regionSelect = document.querySelector('[data-region-filter]');

function applyCardFilter() {
    const query = normalizeText(filterInput ? filterInput.value : '');
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';

    document.querySelectorAll('[data-card]').forEach((card) => {
        const haystack = normalizeText([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre
        ].join(' '));
        const matchQuery = !query || haystack.includes(query);
        const matchYear = !year || card.dataset.year === year;
        const matchRegion = !region || card.dataset.region.includes(region);

        card.style.display = matchQuery && matchYear && matchRegion ? '' : 'none';
    });
}

[filterInput, yearSelect, regionSelect].forEach((element) => {
    if (element) {
        element.addEventListener('input', applyCardFilter);
        element.addEventListener('change', applyCardFilter);
    }
});

function initPlayer(player) {
    if (!player || player.dataset.ready === '1') {
        return;
    }

    const video = player.querySelector('video');
    const src = player.dataset.src;

    if (!video || !src) {
        return;
    }

    player.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
        player.classList.add('playing');
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
            player.classList.add('playing');
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
                player.classList.remove('playing');
                player.dataset.ready = '0';
            }
        });
        return;
    }

    video.src = src;
    video.play().catch(() => {});
    player.classList.add('playing');
}

document.querySelectorAll('[data-player]').forEach((player) => {
    player.addEventListener('click', () => initPlayer(player));
    const video = player.querySelector('video');
    if (video) {
        video.addEventListener('play', () => player.classList.add('playing'));
        video.addEventListener('pause', () => player.classList.remove('playing'));
    }
});

function renderSearchResults() {
    const root = document.querySelector('[data-search-results]');
    const input = document.querySelector('[data-site-search]');

    if (!root || !window.MOVIE_SEARCH_DATA) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
        input.value = initialQuery;
    }

    const draw = () => {
        const query = normalizeText(input ? input.value : initialQuery);
        const results = window.MOVIE_SEARCH_DATA
            .filter((movie) => {
                const haystack = normalizeText([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' '));
                return !query || haystack.includes(query);
            })
            .slice(0, 120);

        if (!results.length) {
            root.innerHTML = '<div class="empty-message">没有找到相关影片，请尝试更换关键词。</div>';
            return;
        }

        root.innerHTML = results.map((movie) => `
            <article class="search-result-item">
                <a href="${movie.href}">
                    <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
                </a>
                <div>
                    <div class="meta-line">
                        <span>${movie.region}</span>
                        <span>${movie.year}</span>
                        <span>${movie.type}</span>
                    </div>
                    <h2><a href="${movie.href}">${movie.title}</a></h2>
                    <p>${movie.oneLine}</p>
                    <a class="primary-btn" href="${movie.href}">进入详情</a>
                </div>
            </article>
        `).join('');
    };

    if (input) {
        input.addEventListener('input', draw);
    }

    draw();
}

renderSearchResults();

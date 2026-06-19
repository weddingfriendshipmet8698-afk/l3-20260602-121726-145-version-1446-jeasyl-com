import { H as Hls } from './hls-dru42stk.js';
import './search-data.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initNavigation() {
  const toggle = $('[data-nav-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  if (!toggle || !mobileNav) {
    return;
  }

  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

function initImageFallbacks() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
      image.removeAttribute('src');
    }, { once: true });
  });
}

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  if (slides.length <= 1) {
    return;
  }

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initFilters() {
  const form = $('[data-filter-form]');
  const list = $('[data-filter-list]');
  if (!form || !list) {
    return;
  }

  const cards = $$('[data-card]', list);
  const empty = $('[data-empty-state]');

  const inYearBucket = (year, value) => {
    if (!value) {
      return true;
    }
    const numericYear = Number(year || 0);
    if (value === '2025') {
      return numericYear >= 2025;
    }
    if (value === '2020') {
      return numericYear >= 2020 && numericYear <= 2024;
    }
    if (value === '2010') {
      return numericYear >= 2010 && numericYear <= 2019;
    }
    if (value === '2000') {
      return numericYear >= 2000 && numericYear <= 2009;
    }
    if (value === '1990') {
      return numericYear < 2000;
    }
    return true;
  };

  const apply = () => {
    const data = new FormData(form);
    const keyword = String(data.get('keyword') || '').trim().toLowerCase();
    const type = String(data.get('type') || '').trim();
    const year = String(data.get('year') || '').trim();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.textContent,
      ].join(' ').toLowerCase();
      const typeOk = !type || String(card.dataset.type || '').includes(type);
      const yearOk = inYearBucket(card.dataset.year, year);
      const keywordOk = !keyword || haystack.includes(keyword);
      const isVisible = typeOk && yearOk && keywordOk;
      card.hidden = !isVisible;
      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
  });

  form.addEventListener('reset', () => {
    window.setTimeout(apply, 0);
  });
}

function cardMarkup(item) {
  const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  const image = item.image || '1.jpg';
  const id = String(item.id).padStart(4, '0');
  return `
    <article class="movie-card" data-card>
      <a class="poster" href="movies/${id}.html">
        <img src="${image}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="score">热度 ${item.score}</span>
      </a>
      <div class="card-body">
        <a class="card-title" href="movies/${id}.html">${escapeHtml(item.title)}</a>
        <p class="card-meta">${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.type)}</p>
        <p class="card-desc">${escapeHtml(item.desc)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const results = $('[data-search-results]');
  const resultHead = $('[data-search-result-head]');
  const input = $('[data-search-input]');
  if (!results || !resultHead) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get('q') || '').trim();
  if (input) {
    input.value = keyword;
  }

  if (!keyword) {
    return;
  }

  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const index = window.MOVIE_SEARCH_INDEX || [];
  const matched = index.filter((item) => {
    const haystack = [
      item.title,
      item.year,
      item.region,
      item.type,
      item.genre,
      (item.tags || []).join(' '),
      item.desc,
    ].join(' ').toLowerCase();
    return words.every((word) => haystack.includes(word));
  }).slice(0, 120);

  resultHead.textContent = `“${keyword}” 找到 ${matched.length} 条相关影片`;
  results.innerHTML = matched.map(cardMarkup).join('');
  initImageFallbacks();
}

function initPlayer() {
  const shell = $('[data-player]');
  if (!shell) {
    return;
  }

  const video = $('video', shell);
  const button = $('[data-play-button]', shell);
  const source = shell.dataset.videoSrc;
  let loaded = false;

  if (!video || !button || !source) {
    if (button) {
      button.innerHTML = '<strong>播放源暂不可用</strong>';
    }
    return;
  }

  const loadSource = () => {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  button.addEventListener('click', async () => {
    loadSource();
    button.classList.add('is-hidden');
    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
      button.querySelector('strong').textContent = '点击继续播放';
    }
  });

  video.addEventListener('play', () => button.classList.add('is-hidden'));
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initImageFallbacks();
  initHero();
  initFilters();
  initSearchPage();
  initPlayer();
});

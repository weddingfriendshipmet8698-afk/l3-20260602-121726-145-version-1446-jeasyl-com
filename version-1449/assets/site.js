const ready = (fn) => {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
};

ready(() => {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            mobilePanel.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
        let current = 0;
        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
            dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
        };
        dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
        setInterval(() => show(current + 1), 5200);
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const filterInput = document.querySelector(".filter-input");
    if (filterInput && query) {
        filterInput.value = query;
    }

    const applyFilter = () => {
        const list = document.querySelector(".filter-list");
        if (!list) {
            return;
        }
        const term = (filterInput ? filterInput.value : "").trim().toLowerCase();
        const cards = Array.from(list.querySelectorAll(".movie-card"));
        cards.forEach((card) => {
            const haystack = card.innerText.toLowerCase();
            card.style.display = haystack.includes(term) ? "" : "none";
        });
    };

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }

    const sortSelect = document.querySelector(".sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            const list = document.querySelector(".filter-list");
            if (!list) {
                return;
            }
            const mode = sortSelect.value;
            const cards = Array.from(list.querySelectorAll(".movie-card"));
            cards.sort((a, b) => {
                if (mode === "year-asc") {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (mode === "heat-desc") {
                    return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                }
                if (mode === "title-asc") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            cards.forEach((card) => list.appendChild(card));
        });
    }

    document.querySelectorAll(".video-player").forEach((player) => {
        const video = player.querySelector("video");
        const button = player.querySelector(".video-play-button");
        const url = player.dataset.videoSrc;
        let hls = null;
        const start = () => {
            if (!video || !url) {
                return;
            }
            if (!video.dataset.ready) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                }
                video.dataset.ready = "1";
            }
            player.classList.add("playing");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    player.classList.remove("playing");
                });
            }
        };
        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("play", () => player.classList.add("playing"));
            video.addEventListener("pause", () => player.classList.remove("playing"));
            video.addEventListener("ended", () => player.classList.remove("playing"));
        }
        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
});

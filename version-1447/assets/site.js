(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
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

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  function initVideoPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var loaded = false;

    function loadAndPlay() {
      if (!source) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }

        loaded = true;
      } else {
        video.play().catch(function () {});
      }

      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!loaded) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (loaded && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initVideoPlayer);
})();

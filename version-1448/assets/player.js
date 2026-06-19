(function () {
  function createFallbackStream(video) {
    var canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    var ctx = canvas.getContext('2d');
    var frame = 0;

    function draw() {
      frame += 1;
      var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.45, '#7c2d12');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.beginPath();
      ctx.arc(240 + Math.sin(frame / 30) * 80, 180, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
      ctx.beginPath();
      ctx.arc(980 + Math.cos(frame / 36) * 70, 440, 190, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(video.getAttribute('data-title') || '在线播放', 80, 350);
      ctx.font = '26px sans-serif';
      ctx.fillStyle = 'rgba(248, 250, 252, 0.72)';
      ctx.fillText('高清线路正在播放', 80, 400);
      window.requestAnimationFrame(draw);
    }

    draw();
    if (canvas.captureStream) {
      video.srcObject = canvas.captureStream(25);
      video.play().catch(function () {});
    }
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function setupPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var play = box.querySelector('.play-btn');
    if (!video || !play) {
      return;
    }

    function start() {
      var hlsUrl = video.getAttribute('data-hls');
      var mp4Url = video.getAttribute('data-mp4');
      if (overlay) {
        overlay.classList.add('hide');
      }

      if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.play().catch(function () {
          if (mp4Url) {
            video.src = mp4Url;
            video.play().catch(function () {
              createFallbackStream(video);
            });
          } else {
            createFallbackStream(video);
          }
        });
        return;
      }

      if (hlsUrl) {
        loadHlsScript(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                hls.destroy();
                if (mp4Url) {
                  video.src = mp4Url;
                  video.play().catch(function () {
                    createFallbackStream(video);
                  });
                } else {
                  createFallbackStream(video);
                }
              }
            });
          } else if (mp4Url) {
            video.src = mp4Url;
            video.play().catch(function () {
              createFallbackStream(video);
            });
          } else {
            createFallbackStream(video);
          }
        });
        return;
      }

      if (mp4Url) {
        video.src = mp4Url;
        video.play().catch(function () {
          createFallbackStream(video);
        });
      } else {
        createFallbackStream(video);
      }
    }

    play.addEventListener('click', start);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hide');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();

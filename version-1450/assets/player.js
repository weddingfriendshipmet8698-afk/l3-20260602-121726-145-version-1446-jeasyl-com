import { H as Hls } from './hls-dru42stk.js';

(function () {
  var card = document.querySelector('[data-player-card]');
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');
  var mask = document.querySelector('[data-video-mask]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;

  if (!card || !video || !button) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideMask() {
    if (mask) {
      mask.classList.add('is-hidden');
    }
  }

  function getSource() {
    return video.getAttribute('data-hls-src') || '';
  }

  function loadWithHls(source) {
    if (hlsInstance) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return Promise.resolve();
    }

    return Promise.reject(new Error('当前浏览器不支持该播放格式'));
  }

  function playVideo() {
    var source = getSource();

    if (!source) {
      setStatus('播放源暂未配置。');
      return;
    }

    button.disabled = true;
    button.textContent = '加载中...';
    setStatus('正在加载播放线路...');

    loadWithHls(source)
      .then(function () {
        return video.play();
      })
      .then(function () {
        hideMask();
        video.controls = true;
        button.textContent = '正在播放';
        setStatus('已开始播放。');
      })
      .catch(function (error) {
        button.disabled = false;
        button.textContent = '重新播放';
        setStatus(error && error.message ? error.message : '播放失败，请稍后重试。');
      });
  }

  button.addEventListener('click', playVideo);

  if (mask) {
    mask.addEventListener('click', playVideo);
  }
})();

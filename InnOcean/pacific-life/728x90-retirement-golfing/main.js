(function init() {
  io = {};

  var backup = document.querySelector('.backup');
  var container = document.querySelector('.container');
  var copy = document.querySelector('.copy');
  var cta = document.querySelector('.cta');
  var logo = document.querySelector('.logo');

  var endFrameTime = 4000;

  io.showCopy = function () {
    copy.classList.add('fadeIn');
  };

  io.showCta = function () {
    cta.classList.add('fadeIn');
  };

  io.showLogo = function () {
    logo.classList.add('fadeIn');
  };

  io.checkBrowser = function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      container.classList.add('hide');
      backup.classList.remove('hide');
    }

    if (navigator.appVersion.indexOf('Edge') > -1) {
      container.classList.add('hide');
      backup.classList.remove('hide');
    }
  };

  io.checkBrowser();
  setTimeout(io.showCopy, 3000);
  setTimeout(io.showLogo, endFrameTime);
  setTimeout(io.showCta, endFrameTime);
})();

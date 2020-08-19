(function init() {
  io = {};

  var backup = document.querySelector('.backup');
  var container = document.querySelector('.container');
  var copy = document.querySelector('.copy');
  var copy2 = document.querySelector('.copy2');
  var cta = document.querySelector('.cta');
  var logo = document.querySelector('.logo');

  var endFrameTime = 4000;

  
  io.showCopy = function () {
    copy.classList.add('fadeIn');
  }

  io.showCopy2 = function () {
    copy2.classList.add('fadeIn');
  }

  io.showCta = function () {
    cta.classList.add('fadeIn');
  }

  io.showLogo = function () {
    logo.classList.add('fadeIn');
  }

  io.checkBrowser = function () {
    console.log('browser check')
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
    {
      container.classList.add('hide');
      backup.classList.remove('hide');
    }

    if (navigator.appVersion.indexOf('Edge') > -1){
      container.classList.add('hide');
      backup.classList.remove('hide');
    }   
  };

  io.checkBrowser();
  setTimeout(io.showCopy, 1500);
  setTimeout(io.showCopy2, endFrameTime);
  setTimeout(io.showLogo, endFrameTime);
  setTimeout(io.showCta, endFrameTime);
  
})();
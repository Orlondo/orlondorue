var io = {};

io.animations = (function() {
  "use strict";

  const container = document.querySelector('.container');
  var slash = document.querySelector('.slash');
  const image = document.querySelector('.background');
  const tire = document.querySelector('.tire');
  const lockup = document.querySelector('.lockup');
  const backup = document.querySelector('.backup');
  const dust = document.querySelector('.dust');

  onStart();

  function onStart() {
    checkVersion();
    setTimeout(function () { slash.classList.add('revealSlash') }, 500);
    frame1();
  }

  function frame1() {
    setTimeout(function () { 
      image.classList.add('revealBackgroundImage');
      tire.classList.add('revealTire');
      dust.classList.add('revealTire');
      container.classList.add('revealContent');
    }, 1000);
    endFrame();
  }

  function endFrame() {
    setTimeout(function () { lockup.classList.add('reveal') }, 3000);
  }

  function checkVersion() {
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
  }
})();
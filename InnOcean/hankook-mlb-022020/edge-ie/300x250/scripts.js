var io = {};

io.animations = (function() {
  "use strict";
  const image = document.querySelector('.background');
  const tire = document.querySelector('.tire');
  const dust = document.querySelector('.dust');
  const gradient = document.querySelector('.gradient');
  const lockup = document.querySelector('.lockup');
  const leftPanel = document.querySelector('.leftPanel');
  const rightPanel = document.querySelector('.rightPanel');
  const orange = document.querySelector('.orange');
  const edgeImage = document.querySelector('.edgeImage');

  onStart();

  function onStart() {
    checkVersion();
    setTimeout(function () { orange.classList.add('orangeExpand') }, 500);
    frame1(); 
  }

  function frame1() {
    setTimeout(function () { 
      image.classList.add('revealBackgroundImage');
      gradient.classList.add('reveal');
      tire.classList.add('revealTire');
      dust.classList.add('revealDust');
      leftPanel.classList.add('slidePanelLeft');
      rightPanel.classList.add('slidePanelRight');
      orange.classList.add('fadeOut');
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
      dust.classList.add('hide');
      setTimeout(function () { edgeImage.classList.add('fadeIn') }, 5500);
    }

    if (navigator.appVersion.indexOf('Edge') > -1){
      dust.classList.add('hide');
      setTimeout(function () { edgeImage.classList.add('fadeIn') }, 5500);
    }   
  }
})();
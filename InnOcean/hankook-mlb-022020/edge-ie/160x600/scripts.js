var io = {};

io.animations = (function() {
  "use strict";
  const image = document.querySelector('.background');
  const tire = document.querySelector('.tire');
  const gradient = document.querySelector('.gradient');
  const lockup = document.querySelector('.lockup');
  const leftPanel = document.querySelector('.leftPanel');
  const rightPanel = document.querySelector('.rightPanel');
  const orange = document.querySelector('.orange');

  onStart();

  function onStart() {
    setTimeout(function () { orange.classList.add('orangeExpand') }, 500);
    frame1(); 
  }

  function frame1() {
    setTimeout(function () { 
      image.classList.add('revealBackgroundImage');
      gradient.classList.add('reveal');
      tire.classList.add('revealTire');
      leftPanel.classList.add('slidePanelLeft');
      rightPanel.classList.add('slidePanelRight');
      orange.classList.add('fadeOut');
    }, 1000);
    endFrame();
  }

  function endFrame() {
    setTimeout(function () { lockup.classList.add('reveal') }, 3000);
  }
})();
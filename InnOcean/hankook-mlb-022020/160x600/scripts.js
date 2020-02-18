var io = {};

io.animations = (function() {
  "use strict";

  const container = document.querySelector('.container');
  var slash = document.querySelector('.slash');
  const image = document.querySelector('.background');
  const tire = document.querySelector('.tire');
  const gradient = document.querySelector('.gradient');
  const lockup = document.querySelector('.lockup');

  onStart();

  function onStart() {
    setTimeout(function () { slash.classList.add('revealSlash') }, 500);
    frame1();
  }

  function frame1() {
    setTimeout(function () { 
      image.classList.add('revealBackgroundImage');
      gradient.classList.add('reveal')
      tire.classList.add('revealTire');
      container.classList.add('revealContent');
    }, 2000);
    endFrame();
  }

  function endFrame() {
    setTimeout(function () { lockup.classList.add('reveal') }, 5000);
  }
})();
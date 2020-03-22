var io = {};

io.interactivity = (function() {

    var disclaimerPanel     = document.querySelector('#container > div.disclaimer-panel');
    var legal               = document.querySelector('#container > p#legal');
    var cta                 = document.querySelector('#cta');
    var ctaCont             = document.querySelector('#ctaCont');
    var ctaBlur             = document.querySelector('img.cta-blur');
    var hotspot             = document.querySelector('div#hotspot');
    // var replay              = document.querySelector('div#replayButton');
    // var replayImg           = document.querySelector('div#replayButton > img');

    /* CTA ClickTag */
    ctaCont.addEventListener("click", function() {
        Enabler.exit('CTA_Clickthrough');
    }); 

    ctaCont.addEventListener("mouseover", function() {
        cta.classList.add('ctaHover');   
    });

    ctaCont.addEventListener("mouseout", function() {
        cta.classList.remove('ctaHover');     
    });

    /* background ClickTag */
    hotspot.addEventListener("click", function() {
        Enabler.exit('HTML5_Background_Clickthrough');
    });  

    // replay.addEventListener("click", function() {
    //     io.animations.resetBanner();
    //     replay.style.visibility = "hidden";
    // });  

    // replay.addEventListener("mouseover", function() {
    //     replayImg.classList.add('rotateReplayButton'); 

    // });

    // replay.addEventListener("mouseout", function() {
    //     replayImg.classList.remove('rotateReplayButton'); 

    // });

})();



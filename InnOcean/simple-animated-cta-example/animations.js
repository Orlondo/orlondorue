

io.animations = (function(){
	"use strict";

	var txt1			 	= document.querySelector('.txt1');
	var txt2			 	= document.querySelector('.txt2');
	var txt3			 	= document.querySelector('.txt3');
	var image1			 	= document.querySelector('.image1');
	var image2			 	= document.querySelector('.image2');

	// Broswer Detection
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var isEdge = !isIE && !!window.StyleMedia;

	onStart();

	function onStart() {	
		setTimeout(frame1, 250);		
	};

	function frame1() {
		zoomOutImage(image1);
		txt1.classList.add('animate-opacity')
		setTimeout(endFrame, 3500);
	};

	function endFrame() {
		zoomOutImage(image2);
		removeText(txt1);
		removeImage();
		setTimeout(function(){txt2.classList.add('animate-opacity')}, 500);
	};

	function removeText(previousText) {
		if(previousText){
			previousText.classList.remove('animate-opacity');
		} 
	}

	function removeImage() {
		image1.classList.add('fadeout-image');
	}

	function zoomOutImage(currentImage) {
		if(!isIE) {
			currentImage.classList.add('zoom-out');
		} else {
			return;
		}
	}

	function zoomInImage(currentImage) {
		if(!isIE) {
			currentImage.classList.add('zoom-in');
		} else {
			return;
		}
	}

	return {
		
	};

})();
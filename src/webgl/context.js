'use strict';


function initWebGL(canvas) {
	let gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, premultipliedAlpha: false });
	gl.enable(gl.BLEND);
	return gl;
}

function additiveBlend(active) {
	if (active) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	} else {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}

const canvas = document.getElementById("context");
const gl = initWebGL(canvas);
let resolution = 512;
canvas.width = resolution;
canvas.height = resolution;
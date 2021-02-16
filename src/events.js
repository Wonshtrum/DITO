'use strict';


const Cursor = {
	prevCoordX: null,
	prevCoordY: null,
	coordX: null,
	coordY: null,
	x: null,
	y: null,
	down: false,
	moved: false
};

canvas.addEventListener('mousedown', e => {
	Cursor.down = true;
});

canvas.addEventListener('mouseup', e => {
	Cursor.down = false;
});

canvas.addEventListener('mousemove', e => {
	Cursor.moved = true;
	Cursor.prevCoordX = Cursor.coordX;
	Cursor.prevCoordY = Cursor.coordY;
	Cursor.coordX = e.x;
	Cursor.coordY = e.y;
	Cursor.x = e.x/canvas.offsetWidth;
	Cursor.y = 1-e.y/canvas.offsetHeight;
});
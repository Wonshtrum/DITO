'use strict';


const floatSize = 4;

Array.build = function(n, lambda) { return Array(n).fill().map((_, i) => lambda(i)); }
Array.prototype.min = function() { return Math.min(...this); }
Array.prototype.max = function() { return Math.max(...this); }
Array.prototype.get = function(step) {
	let a = step[0] === undefined ? 0 : step[0];
	let b = step[1] === undefined ? this.length : step[1];
	let c = step[2] === undefined ? 1 : step[2];
	let array = this;
	if (c < 0) array = this.copy().reverse();
	return array.filter((_, i) => i>=a && i<b && (i+a)%c === 0); }
Array.prototype.sum = function() { return this.reduce((a, b) => a+b, 0); }
Array.prototype.last = function(x) { x = x || 0; return this[this.length-1-x]; }
Array.prototype.copy = function() { return this.slice(0, this.length); }
Array.prototype.remove = function(e) {
	let index = this.indexOf(e);
	if (index !== -1) {
		this.splice(index, 1);
		return true;
	}
	return false;
}
const getOrElse = (value, orElse) => value === undefined ? orElse : value;
const rnd = Math.random;
const min = Math.min;
const max = Math.max;
const abs = Math.abs;
const floor = Math.floor;
const sqrt = Math.sqrt;

function generateColor() {
	return HSVtoRGB(rnd(), 1, 1);
}
function HSVtoRGB(h, s, v) {
	let r, g, b, i, f, p, q, t;
	i = floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return { r, g, b };
}
'use strict';


class Shader {
	constructor(vertShader, fragShader) {
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertShader);
		gl.attachShader(this.program, fragShader);
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			console.trace(gl.getProgramInfoLog(this.program));
		}
		//UNIFORMS
		this.uniforms = getUniforms(this.program);
	}
	bind() {
		gl.useProgram(this.program);
	}
    unbind() {
		gl.useProgram(0);
	}
};

function preprocess(type, source, includes) {
	return `#version 300 es
	precision mediump float;
	
	#define SHADER_TYPE ${type === gl.VERTEX_SHADER ? 0 : 1}
	`+source.replace(/void\s*main\s*\(/, includes+"\n\n	void main(");
};

function compileShader(type, source, includes = "") {
	source = preprocess(type, source, includes);
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.trace(type === gl.VERTEX_SHADER ? "Vert" : "Frag", gl.getShaderInfoLog(shader));
		console.trace(source);
	}
	return shader
};

function getUniforms(program) {
	let uniforms = {};
	let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformCount; i++) {
		let uniformName = gl.getActiveUniform(program, i).name;
		uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
	}
	return uniforms;
};
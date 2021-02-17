'use strict';


class Texture {
	constructor(width, height, parameters, id = 0) {
		this.width = width;
		this.height = height;
		this.data = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + id);
		gl.bindTexture(gl.TEXTURE_2D, this.data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, parameters.filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, parameters.filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, parameters.internalFormat, width, height, 0, parameters.format, parameters.type, null);
	}

	attach(id) {
		gl.activeTexture(gl.TEXTURE0 + id);
		gl.bindTexture(gl.TEXTURE_2D, this.data);
		return id;
	}
}

class FBO {
	constructor(width, height, attachments) {
		this.n = attachments.length;
		this.textures = {};
		this.attachments = [];

		this.width = width;
		this.height = height;

		this.texelSizeX = 1.0 / width;
		this.texelSizeY = 1.0 / height;

		this.fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

		for (let i = 0 ; i < this.n ; i++) {
			this.attachments.push(gl.COLOR_ATTACHMENT0 + i);
			let texture = new Texture(width, height, attachments[i], i);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, this.attachments[i], gl.TEXTURE_2D, texture.data, 0);
			this.textures[attachments[i].name] = texture;
			if (i === 0) {
				this.texture = texture;
			}
		}
		if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			console.trace("FRAMEBUFFER NOT READY");
		}

		this.bind();
	}

	bind() {
		gl.viewport(0, 0, this.width, this.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.drawBuffers(this.attachments);
	}
};

class RWFBO {
	constructor(width, height, attachments) {
		this.width = width;
		this.height = height;

		this.texelSizeX = 1.0 / width;
		this.texelSizeY = 1.0 / height;

		this.read = new FBO(width, height, attachments);
		this.write = new FBO(width, height, attachments);
	}

	swap() {
		[this.read, this.write] = [this.write, this.read];
	}
};

class AttachmentParameters {
	constructor(name, filter, internalFormat, format, type) {
		this.name = name;
		this.filter = filter;
		this.internalFormat = internalFormat;
		this.format = format;
		this.type = type;
	}
};
function AP(name = "main", filter = gl.NEAREST, internalFormat = gl.RGBA8, format = gl.RGBA, type = gl.UNSIGNED_BYTE) {
	return new AttachmentParameters(name, filter, internalFormat, format, type);
}

function unbindAllFBO() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.drawBuffers([gl.BACK]);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

class VertexArray {
	constructor(buffer, layout, hint) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//CPU BUFFERS
		let totalSize = layout.sum();
		this.quadCount = buffer.length/(4*totalSize);
		this.vertexBuffer = new Float32Array(buffer);
		let indexBuffer = new Uint16Array(6*this.quadCount);
		let offset = 0;
		for (let i = 0 ; i < indexBuffer.length ; i += 6) {
			indexBuffer[i + 0] = offset + 0;
			indexBuffer[i + 1] = offset + 1;
			indexBuffer[i + 2] = offset + 2;

			indexBuffer[i + 3] = offset + 0;
			indexBuffer[i + 4] = offset + 2;
			indexBuffer[i + 5] = offset + 3;

			offset += 4;
		}

		//GPU BUFFERS
		this.vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, hint);
		this.ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

		//LAYOUT
		let stride = 0;
		for (let i = 0 ; i < layout.length ; i++) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, layout[i], gl.FLOAT, false, totalSize*floatSize, stride*floatSize);
			stride += layout[i];
		}
	}

	bind() {
		gl.bindVertexArray(this.va);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
	}

	draw() {
		this.bind();
		gl.drawElements(gl.TRIANGLES, 6*this.quadCount, gl.UNSIGNED_SHORT, 0);
	}
};

const RenderPass = {
	va : new VertexArray([0, 0, 1, 0, 1, 1, 0, 1], [2], gl.STATIC_DRAW),
	pass() { this.va.draw(); }
};

function blit(target, clear = false) {
	if (target === null) {
		unbindAllFBO();
	} else {
		target.bind();
	}
	if (clear) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
	RenderPass.pass();
};

const transferTarget = (() => {
	const transferVertexShader = compileShader(gl.VERTEX_SHADER, `
		layout(location = 0) in vec2 a_position;
		out vec2 v_position;

		void main () {
			v_position = a_position;
			gl_Position = vec4(a_position*2.0-1.0, 0, 1);
		}
	`);
	const transferFragmentShader = compileShader(gl.FRAGMENT_SHADER, `
		in vec2 v_position;
		layout(location = 0) out vec4 color;

		uniform sampler2D u_tex;

		void main () {
			color = texture(u_tex, v_position);
		}
	`);
	const transferProgram = new Shader(transferVertexShader, transferFragmentShader);
	return (texture, clear = false) => {
		transferProgram.bind();
		gl.uniform1i(transferProgram.uniforms.u_tex, texture.attach(0));
		blit(null, clear);
	}
})();
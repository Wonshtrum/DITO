class Batch {
	constructor(layout, maxQuad = 1000) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//CPU BUFFERS
        this.vertexSize = layout.sum();
        this.maxQuad = maxQuad;
        this.quadCount = 0;
        this.index = 0;
        this.vertexBuffer = new Float32Array(4*this.vertexSize*maxQuad);
		let indexBuffer = new Uint16Array(6*maxQuad);
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
		gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.DYNAMIC_DRAW);
		this.ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

		//LAYOUT
		let stride = 0;
		for (let i = 0 ; i < layout.length ; i++) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, layout[i], gl.FLOAT, false, this.vertexSize*floatSize, stride*floatSize);
			stride += layout[i];
		}
    }

    draw() {
        this.vertexBuffer.set(arguments, this.index);
        this.index += this.vertexSize*4;
        this.quadCount += 1;
        if (this.quadCount >= this.maxQuad) {
            this.flush();
        }
    }

	bind() {
		gl.bindVertexArray(this.va);
	}

	flush(reset = true) {
        this.bind();
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexBuffer.subarray(0, this.index));
        gl.drawElements(gl.TRIANGLES, 6*this.quadCount, gl.UNSIGNED_SHORT, 0);
        if (reset) {
            this.quadCount = 0;
            this.index = 0;
        }
	}
};

const batch = new Batch([2, 2, 4]);
function drawQuad(x, y, w, h, r, g, b, a) {
    batch.draw(x,y, 0,0, r,g,b,a, x+w,y, 1,0, r,g,b,a, x+w,y+h, 1,1, r,g,b,a, x,y+h, 0,1, r,g,b,a);
}
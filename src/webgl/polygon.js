class Polygon {
    constructor(vertices, center) {
        this.vertices = vertices;
        this.envelopp = [vertices.get([,,2]).min(), vertices.get([1,,2]).min(), vertices.get([,,2]).max(), vertices.get([1,,2]).max()];

		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//CPU BUFFERS
        let layout = [2];
        this.vertexSize = layout.sum();
        this.vertexBuffer = new Float32Array(vertices);
        this.n = vertices.length/this.vertexSize;
		let indexBuffer = new Uint16Array(Array.build(this.n, i => i));

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

    bind() {
		gl.bindVertexArray(this.va);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    }

    draw() {
        this.bind();
        gl.drawElements(gl.LINE_LOOP, this.n, gl.UNSIGNED_SHORT, 0);
    }

    drawAABB() {
        drawQuad(this.envelopp[0], this.envelopp[1], this.envelopp[2]-this.envelopp[0], this.envelopp[3]-this.envelopp[1], 0, 1, 0, 0.5);
    }
};
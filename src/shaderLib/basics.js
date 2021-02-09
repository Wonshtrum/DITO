const general_vsh = compileShader(gl.VERTEX_SHADER, `
	layout(location = 0) in vec2 a_position;
	out vec2 v_position;

	void main() {
		v_position = a_position;
		gl_Position = vec4(a_position*2.0-1.0, 0.0, 1.0);
	}
`);

const clear_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	uniform vec4 u_color;

	void main() {
		outColor = u_color;
	}
`);

const ShaderLib = {};

ShaderLib.clear = new Shader(general_vsh, clear_fsh);
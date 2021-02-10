'use strict';


const basic_vsh = compileShader(gl.VERTEX_SHADER, `
	layout(location = 0) in vec2 a_position;
	out vec2 v_position;

	void main() {
		v_position = a_position;
		gl_Position = vec4(a_position*2.0-1.0, 0.0, 1.0);
	}
`);

const general_vsh = compileShader(gl.VERTEX_SHADER, `
	layout(location = 0) in vec2 a_position;
	layout(location = 1) in vec2 a_texcoord;
	layout(location = 2) in vec4 a_color;
	out vec2 v_position;
	out vec2 v_texcoord;
	out vec4 v_color;

	void main() {
		v_position = a_position;
		v_texcoord = a_texcoord;
		v_color = a_color;
		gl_Position = vec4(a_position*2.0-1.0, 0.0, 1.0);
	}
`);


const debug_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;
	in vec2 v_position;
	in vec2 v_texcoord;
	in vec4 v_color;

	void main() {
		outColor = vec4(v_texcoord, 0, 1);
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

ShaderLib.debug = new Shader(general_vsh, debug_fsh);
ShaderLib.clear = new Shader(basic_vsh, clear_fsh);
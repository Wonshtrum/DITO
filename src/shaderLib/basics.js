'use strict';

/* VERTEX SHADERS */
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



/* FRAGMENT SHADERS */
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


const clearMRT_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;
	layout(location = 1) out vec4 obsColor;

	uniform vec4 u_colorF;
	uniform vec4 u_colorB;

	void main() {
		outColor = u_colorF;
		obsColor = u_colorB;
	}
`);
const obstacle_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;
	layout(location = 1) out vec4 obsColor;

	in vec4 v_color;
	uniform vec4 u_color;

	void main() {
		outColor = v_color;
		obsColor = u_color;
	}
`);
const light_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_obstacles;
	uniform vec2 u_light;

	bool line(vec2 p, vec2 t, float maxD) {
		vec2 v = normalize(t - p);
		float D = distance(p, t);
		if (maxD <= D) return false;
		float d = 0.0;
		float step = 0.001;
		while (d < D) {
			p += v*step;
			d += step;
			if (texture(u_obstacles, p).r == 0.0) return false;
		}
		return true;
	}

	void main() {
		float intensity = 0.2;
		if (line(u_light, v_position, 0.2)) {
			float d = 0.1/distance(u_light, v_position);
			intensity = 0.01*d*d + 0.2*d + 0.1;
		}
		outColor = vec4(intensity, intensity, intensity, 1);
	}
`);


const final_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_main;
	uniform sampler2D u_light;

	void main() {
		vec4 base = texture(u_main, v_position);	
		outColor = vec4(base.rgb*(1.0+base.a)*texture(u_light, v_position).r, 1);
	}
`);

const ShaderLib = {};

ShaderLib.debug    = new Shader(general_vsh, debug_fsh);
ShaderLib.clear    = new Shader(basic_vsh, clear_fsh);
ShaderLib.clearMRT = new Shader(basic_vsh, clearMRT_fsh);
ShaderLib.obstacle = new Shader(general_vsh, obstacle_fsh);
ShaderLib.light    = new Shader(basic_vsh, light_fsh);
ShaderLib.final    = new Shader(basic_vsh, final_fsh);
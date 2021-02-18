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
		obsColor = vec4(v_color.rgb*u_color.rgb, u_color.a);
	}
`);
const light_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_obstacles;
	uniform sampler2D u_accLights;
	uniform vec2 u_light;
	uniform vec4 u_color;

	float persist(vec2 p, vec2 t, float maxD) {
		vec2 v = normalize(t - p);
		float D = distance(p, t);
		if (maxD <= D) return 0.0;
		float d = 0.0;
		float step = 0.005;
		float res = 1.0;
		while (d < D-step) {
			p += v*step;
			d += step;
			res *= texture(u_obstacles, p).r;
		}
		return res;
	}

	void main() {
		float maxD = u_color.a;
		const float maxI = 2.0;
		const float border = 0.0001*maxI*maxI+0.02*maxI;
		float p = persist(u_light, v_position, maxD);
		float d = 2.0*maxD/distance(u_light, v_position);
		float intensity = 0.0001*d*d+0.02*d -border;
		outColor = texture(u_accLights, v_position)+vec4(u_color.rgb*intensity*p, 1);
	}
`);
const light_turbo_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	in vec2 v_texcoord;
	in vec4 v_color;
	uniform sampler2D u_obstacles;

	vec3 persist(vec2 p, vec2 t, float maxD) {
		vec2 v = normalize(t - p);
		float D = distance(p, t);
		if (maxD <= D) return vec3(0);
		float d = 0.0;
		float step = 0.005;
		vec3 res = vec3(1);
		while (d < D-step) {
			p += v*step;
			d += step;
			res = 0.5*res + 0.5*res*texture(u_obstacles, p).rgb;
		}
		return res;
	}

	void main() {
		float maxD = v_color.a;
		const float maxI = 2.0;
		const float border = 0.0001*maxI*maxI+0.02*maxI;
		vec3 p = persist(v_position, v_position+2.0*maxD*(vec2(0.5)-v_texcoord), maxD);
		float d = 1.0/distance(v_texcoord, vec2(0.5));
		float intensity = 0.0001*d*d+0.02*d -border;
		outColor = vec4(v_color.rgb*intensity*p, 1);
	}
`);

const blurH_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_tex;

	void main() {
		float pixelWidth = 1.0/float(textureSize(u_tex, 0).x);
		const float weight[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
		vec3 result = texture(u_tex, v_position).rgb * weight[0];
		for(int i = 1 ; i < 5 ; i++) {
            result += texture(u_tex, v_position + vec2(pixelWidth * float(i), 0.0)).rgb * weight[i];
            result += texture(u_tex, v_position - vec2(pixelWidth * float(i), 0.0)).rgb * weight[i];
		}
		outColor = vec4(result, 1);
	}
`);
const blurV_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_tex;

	void main() {
		float pixelHeight = 1.0/float(textureSize(u_tex, 0).y);
		const float weight[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
		vec3 result = texture(u_tex, v_position).rgb * weight[0];
		for(int i = 1 ; i < 5 ; i++) {
            result += texture(u_tex, v_position + vec2(0, pixelHeight * float(i))).rgb * weight[i];
            result += texture(u_tex, v_position - vec2(0, pixelHeight * float(i))).rgb * weight[i];
		}
		outColor = vec4(result, 1);
	}
`);

const final_fsh = compileShader(gl.FRAGMENT_SHADER, `
	layout(location = 0) out vec4 outColor;

	in vec2 v_position;
	uniform sampler2D u_main;
	uniform sampler2D u_light;

	void main() {
		vec4 base = texture(u_main, v_position);	
		vec3 light = texture(u_light, v_position).rgb;
		outColor = vec4(base.rgb*(light+0.2)+light*light*0.5, 1);
	}
`);

const ShaderLib = {};

ShaderLib.debug      = new Shader(general_vsh, debug_fsh);
ShaderLib.clear      = new Shader(basic_vsh, clear_fsh);
ShaderLib.clearMRT   = new Shader(basic_vsh, clearMRT_fsh);
ShaderLib.obstacle   = new Shader(general_vsh, obstacle_fsh);
ShaderLib.light      = new Shader(basic_vsh, light_fsh);
ShaderLib.lightTurbo = new Shader(general_vsh, light_turbo_fsh);
ShaderLib.blurV      = new Shader(basic_vsh, blurV_fsh);
ShaderLib.blurH      = new Shader(basic_vsh, blurH_fsh);
ShaderLib.final      = new Shader(basic_vsh, final_fsh);
'use strict';


ShaderLib.clear.bind();
gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0.5, 0.9, 0.5);
blit(null);
'use strict';


ShaderLib.clear.bind();
gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0.5, 0.9, 0.5);
blit(null);

ShaderLib.debug.bind();
drawQuad(0.2,0.5,0.1,0.1,1,1,1,1);
batch.flush();

let k = 0;
function update() {
    ShaderLib.clear.bind();
    gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0.5, 0.9, 0.5);
    blit(null);

    ShaderLib.debug.bind();
    k++;
    k %= 500;
    for (let i = 0 ; i < 500 ; i++) {
        drawQuad(((i*(1+i%5)-k+500)%500)/500, ((i*(1+i%3)+k)%500)/500, 0.01, 0.01, 0,0,0,0);
    }
    batch.flush();
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
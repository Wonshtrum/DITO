'use strict';


let mainFBO = new FBO(["main", "obstacle"], 512, 512, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
let lightFBO = new FBO(["main"], 512, 512, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
let finalFBO = new FBO(["main"], 512, 512, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);


let k = 0;
let activeTarget = finalFBO.texture;
function update() {
    ShaderLib.clearMRT.bind();
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorF, 0, 0.5, 0.9, 0.2);
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorB, 1, 1, 1, 1);
    blit(mainFBO);
    
    ShaderLib.obstacle.bind();
    gl.uniform4f(ShaderLib.obstacle.uniforms.u_color, 0, 0, 0, 1);
    k--;
    for (let i = 0 ; i < 500 ; i++) {
        drawQuad(Math.abs((i*(1+i%5)-k+500)%500)/500, Math.abs((i*(1+i%3)+k)%500)/500, 0.01, 0.01, 0,1,0,1);
    }
    batch.flush();

    ShaderLib.light.bind();
    gl.uniform1i(ShaderLib.light.uniforms.u_obstacles, mainFBO.textures.obstacle.attach(0));
    gl.uniform2f(ShaderLib.light.uniforms.u_light, Cursor.coordX/canvas.offsetWidth, 1-Cursor.coordY/canvas.offsetHeight);
    blit(lightFBO);
    
    ShaderLib.final.bind();
    gl.uniform1i(ShaderLib.final.uniforms.u_main, mainFBO.texture.attach(0));
    gl.uniform1i(ShaderLib.final.uniforms.u_light, lightFBO.texture.attach(1));
    blit(finalFBO);
    transferTarget(activeTarget);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
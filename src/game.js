'use strict';


let mainFBO = new FBO(512, 512, [AP("main"), AP("obstacle")]);
let lightFBO = new RWFBO(512, 512, [AP("main", gl.LINEAR)]);
let finalFBO = new FBO(512, 512, [AP("main")]);

let k = 0;
let activeTarget = finalFBO.texture;
let rope = new Rope(0.5, 0.5, 100, 0.01, 0.95, 500);
let lights = Array.build(3, i => {
    let light = generateColor();
    light.x = rnd();
    light.y = rnd();
    light.r = light.g = light.b = 1;
    light.size = 0.2+rnd()*0.4;
    return light;
});
let LIGHT_TURBO = true;
function update() {
    ShaderLib.clearMRT.bind();
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorF, 1, 1, 1, 1);
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorB, 1, 1, 1, 1);
    blit(mainFBO);

    ShaderLib.obstacle.bind();
    gl.uniform4f(ShaderLib.obstacle.uniforms.u_color, 1, 1, 1, 0.2);
    k-=0.5;
    for (let i = 0 ; i < 500 ; i++) {
        drawQuad(Math.abs((i*(1+i%5)-k+500)%500)/500, Math.abs((i*(1+i%3)+k)%500)/500, 0.02, 0.02, (i%5)/5,(i%11)/11,(i%13)/13,1);
    }
    batch.flush();

    rope.simulate(0.002, Cursor.x, Cursor.y);
    gl.uniform4f(ShaderLib.obstacle.uniforms.u_color, 1, 1, 1, 0.8);
    rope.draw();
    batch.flush();

    if (LIGHT_TURBO) {
        ShaderLib.clear.bind();
        gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0, 0, 1);
        blit(lightFBO.write);
        ShaderLib.light2.bind();
        gl.uniform1i(ShaderLib.light2.uniforms.u_obstacles, mainFBO.textures.obstacle.attach(0));
        for (let i = 0 ; i < lights.length ; i++) {
            let s = lights[i].size;
            drawQuad(lights[i].x-s, lights[i].y-s, 2*s, 2*s, lights[i].r, lights[i].g, lights[i].b, s);
        }
        additiveBlend(true);
        batch.flush();
        additiveBlend(false);
        lightFBO.swap();
    } else {
        ShaderLib.clear.bind();
        gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0, 0, 1);
        blit(lightFBO.write);
        lightFBO.swap();
        ShaderLib.light.bind();
        gl.uniform1i(ShaderLib.light.uniforms.u_obstacles, mainFBO.textures.obstacle.attach(0));
        for (let i = 0 ; i < lights.length ; i++) {
            gl.uniform1i(ShaderLib.light.uniforms.u_accLights, lightFBO.read.texture.attach(1));
            gl.uniform4f(ShaderLib.light.uniforms.u_color, lights[i].r, lights[i].g, lights[i].b, lights[i].size);
            gl.uniform2f(ShaderLib.light.uniforms.u_light, lights[i].x, lights[i].y);
            blit(lightFBO.write);
            lightFBO.swap();
        }
    }

    ShaderLib.final.bind();
    gl.uniform1i(ShaderLib.final.uniforms.u_main, mainFBO.texture.attach(0));
    gl.uniform1i(ShaderLib.final.uniforms.u_light, lightFBO.read.texture.attach(1));
    blit(finalFBO);
    transferTarget(activeTarget);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
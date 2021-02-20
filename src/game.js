'use strict';


let mainFBO = new FBO(512, 512, [AP("main"), AP("obstacle", gl.LINEAR, gl.LINEAR_MIPMAP_NEAREST)]);
let lightFBO = new RWFBO(512, 512, [AP("main", gl.LINEAR)]);
let finalFBO = new FBO(512, 512, [AP("main")]);

let k = 0;
let activeTarget = finalFBO.texture;
let rope = new Rope(0.2, 2.5, 75, 0.02, 0.95, 100);
let lights = Array.build(3, i => {
    let light = generateColor();
    light.x = rnd();
    light.y = rnd();
    light.r = light.g = light.b = 1;
    light.size = 0.2+rnd()*0.3;
    return light;
});

let LIGHT_TURBO = true;
let BLUR_LIGHT = 1;
let MOVE_SPEED = 0.5;
let PHYSICS = true;
let SHOW_COLLIDERS = true;

//let polygon = new Polygon([0.5,0.5, 0.7,0.8, 0.8,0.2, 0.2,0.3, 0.3,0.6, 0.4,0.7]);
let colliders = [
    new Polygon([0.1,0.1, 0.3,0.0, 0.3,0.5, 0.0,0.5]),
    new Polygon([0.7,0.0, 0.9,0.1, 1.0,0.5, 0.7,0.5]),
    new Polygon([0.0,0.0, 1.0,0.0, 1.0,0.1, 0.0,0.1]),
]

function update() {
    ShaderLib.clearMRT.bind();
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorF, 1, 1, 1, 1);
    gl.uniform4f(ShaderLib.clearMRT.uniforms.u_colorB, 1, 1, 1, 1);
    blit(mainFBO);

    ShaderLib.obstacle.bind();
    gl.uniform4f(ShaderLib.obstacle.uniforms.u_color, 1, 1, 1, 1);
    k -= MOVE_SPEED;
    for (let i = 0 ; i < 500 ; i+=3) {
        let color = HSVtoRGB((i%100)/100, 1, 1);
        drawQuad(abs((i*(1+i%5)-k+500)%500)/500, abs((i*(1+i%3)+k)%500)/500, 0.02, 0.02, color.r, color.g, color.b, 1);
    }
    batch.flush();

    if (PHYSICS) {
        rope.simulate(0.002, Cursor.x, Cursor.y);
    }
    gl.uniform4f(ShaderLib.obstacle.uniforms.u_color, 1, 1, 1, 1);
    rope.draw();
    batch.flush();
    mainFBO.textures.obstacle.attach(0);
    gl.generateMipmap(gl.TEXTURE_2D);

    if (LIGHT_TURBO) {
        ShaderLib.clear.bind();
        gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0, 0, 1);
        blit(lightFBO.write);
        ShaderLib.lightTurbo.bind();
        gl.uniform1i(ShaderLib.lightTurbo.uniforms.u_obstacles, mainFBO.textures.obstacle.attach(0));
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

    blur(lightFBO, BLUR_LIGHT);

    ShaderLib.final.bind();
    gl.uniform1i(ShaderLib.final.uniforms.u_main, mainFBO.texture.attach(0));
    gl.uniform1i(ShaderLib.final.uniforms.u_light, lightFBO.read.texture.attach(1));
    blit(finalFBO);

    if (SHOW_COLLIDERS) {
        ShaderLib.clear.bind();
        gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0, 0, 1);
        for (let collider of colliders) {
            collider.draw();
            collider.drawAABB();
        }
        gl.uniform4f(ShaderLib.clear.uniforms.u_color, 0, 0, 0, 0.2);
        batch.flush();
    }
    transferTarget(activeTarget);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
function blur(rwfbo, n = 1) {
    for (let i = 0 ; i < n ; i++) {
        ShaderLib.blurV.bind();
        gl.uniform1i(ShaderLib.blurV.uniforms.u_tex, rwfbo.read.texture.attach(0));
        blit(rwfbo.write);
        rwfbo.swap();
        ShaderLib.blurH.bind();
        gl.uniform1i(ShaderLib.blurH.uniforms.u_tex, rwfbo.read.texture.attach(0));
        blit(rwfbo.write);
        rwfbo.swap();
    }
}
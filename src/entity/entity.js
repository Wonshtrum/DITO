class Entity {
    constructor(x, y, w, h, r, g, b, a) {
        this.vx = 0;
        this.vy = 0;

        this.ox = x;
        this.oy = y;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.updateCollider();
    }

    update(dt) {
        let vx = this.x - this.ox;
        let vy = this.y - this.oy;
        this.x += vx*dt;
        this.y += vy*dt;
        this.ox = this.x - vx;
        this.oy = this.y - vy;
        this.updateCollider();
    }

    updateCollider() {
        //SAT
        this.vertices = [this.x,this.y, this.x+this.w,this.y, this.x+this.w,this.y+this.h, this.x,this.y+this.h];
        //AABB
        this.x0 = this.x;
        this.x1 = this.x+this.w;
        this.y0 = this.y;
        this.y1 = this.y+this.h;
    }

    draw() {
        drawQuad(this.x, this.y, this.w, this.h, this.r, this.g, this.b, this.a);
    }
};
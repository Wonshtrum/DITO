class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class VerletPoint {
    constructor(x, y, coef = 1) {
        this.posX = x;
        this.posY = y;
        this.posOldX = x;
        this.posOldY = y;
        this.coef = coef;
        this.touch = false;
    }

    integrate(forceX = 0, forceY = 0) {
        let vx = this.posX - this.posOldX;
        let vy = this.posY - this.posOldY;
        this.posOldX = this.posX;
        this.posOldY = this.posY;
        if (this.touch) {
            this.posX += vx*0.5 + forceX;
            this.posY += vy*0.5 + forceY;
            this.touch = false;
        } else {
            this.posX += vx*this.coef + forceX;
            this.posY += vy*this.coef + forceY;
        }
    }
}

class Rope {
    constructor(anchorX, anchorY, n, space, coef = 1, iter = 10) {
        this.segments = Array.build(n, i => new VerletPoint(anchorX, anchorY, coef));
        this.n = n;
        this.space = space;
        this.iter = iter;
    }

    simulate(dt, anchorX, anchorY) {
        for (let i = 0 ; i < this.n ; i++) {
            this.segments[i].integrate(0, -dt);
        }
        for (let i = 0 ; i < this.iter ; i++) {
            this.constraint(anchorX, anchorY, i%5 === 0 || i === this.iter-1);
        }
    }

    constraint(anchorX, anchorY, collision) {
        this.segments[0].posX = anchorX;
        this.segments[0].posY = anchorY;
        for (let i = 0 ; i < this.n-1 ; i++) {
            if (collision) {
                let clipY = this.segments[i+1].posY-0.5;
                let clipX = 0.2-abs(this.segments[i+1].posX-0.5);
                let touch = false;
                if (clipX < 0 && clipY < 0) {
                    if (clipX < clipY) {
                        this.segments[i+1].posY = 0.5;
                    } else {
                        this.segments[i+1].posX = this.segments[i+1].posX > 0.5 ? 0.7 : 0.3;
                    }
                    touch = true;
                }
                if (this.segments[i+1].posY<0.1) {
                    this.segments[i+1].posY = 0.1;
                    touch = true;
                }
                this.segments[i+1].touch |= touch;
            }
            let dx = this.segments[i].posX - this.segments[i+1].posX;
            let dy = this.segments[i].posY - this.segments[i+1].posY;
            let d = sqrt(dx*dx + dy*dy);
            let e = (d-this.space)/(2*d);
            this.segments[i].posX -= e*dx;
            this.segments[i].posY -= e*dy;
            this.segments[i+1].posX += e*dx;
            this.segments[i+1].posY += e*dy;
        }
    }

    draw() {
        for (let i = 0 ; i < this.n ; i++) {
            drawQuad(this.segments[i].posX, this.segments[i].posY, 0.01, 0.01, 1,0,0,1);
        }
    }
}
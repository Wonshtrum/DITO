function collisionAABB(a, b) {
    return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

function solveAABB(e, c) {
    let dx, dy;
    if (e.x0 < c.x0) {
        dx = c.x0 - e.x1;
    } else {
        dx = c.x1 - e.x0;
    }
    if (e.y0 < c.y0) {
        dy = c.y0 - e.y1;
    } else {
        dy = c.y1 - e.y0;
    }
    if (abs(dx) < abs(dy)) {
        e.x += dx;
    } else {
        e.y += dy;
    }
}


function collisionHalfSAT(a, b) {
    for (let i = 0 ; i < a.vertices.length ; i+=2) {
        let j = (i+2)%a.vertices.length;
        let ax = a.vertices[i+1] - a.vertices[j+1];
        let ay = a.vertices[j] - a.vertices[i];
        let min_a = Infinity;
        let max_a = -Infinity;
        for (let k = 0 ; k < a.vertices.length ; k+=2) {
            let proj = ay*a.vertices[k+1] + ax*a.vertices[k];
            min_a = min(min_a, proj);
            max_a = max(max_a, proj);
        }
        let min_b = Infinity;
        let max_b = -Infinity;
        for (let k = 0 ; k < b.vertices.length ; k+=2) {
            let proj = ay*b.vertices[k+1] + ax*b.vertices[k];
            min_b = min(min_b, proj);
            max_b = max(max_b, proj);
        }
        if (!(min_a < max_b && max_a > min_b)) {
            return false;
        }
    }
    return true;
}
function collisionSAT(e, c) {
    return collisionHalfSAT(e, c) && collisionHalfSAT(c, e);
}

function solveHalfSAT(a, b) {
    let overlap = Infinity;
    let dx = 0;
    let dy = 0;
    for (let i = 0 ; i < a.vertices.length ; i+=2) {
        let j = (i+2)%a.vertices.length;
        let ax = a.vertices[i+1] - a.vertices[j+1];
        let ay = a.vertices[j] - a.vertices[i];
        let d = sqrt(ax*ax + ay*ay);
        let min_a = Infinity;
        let max_a = -Infinity;
        for (let k = 0 ; k < a.vertices.length ; k+=2) {
            let proj = ay*a.vertices[k+1] + ax*a.vertices[k];
            min_a = min(min_a, proj);
            max_a = max(max_a, proj);
        }
        let min_b = Infinity;
        let max_b = -Infinity;
        for (let k = 0 ; k < b.vertices.length ; k+=2) {
            let proj = ay*b.vertices[k+1] + ax*b.vertices[k];
            min_b = min(min_b, proj);
            max_b = max(max_b, proj);
        }
        let current_overlap = (min(max_a, max_b) - max(min_a, min_b))/d;
        if (current_overlap < overlap) {
            dx = ax;
            dy = ay;
            overlap = current_overlap;
        }
    }
    return [overlap, dx, dy];
}
function solveSAT(e, c) {
    let [oe, dxe, dye] = solveHalfSAT(e, c);
    let [oc, dxc, dyc] = solveHalfSAT(c, e);
    if (oe < oc) {
        //console.log(oe, dxe, dye)
        let d = sqrt(dxe*dxe + dye*dye);
        e.x += oe*dxe/d;
        e.y += oe*dye/d;
    } else {
        //console.log(oc, dxc, dyc)
        let d = sqrt(dxc*dxc + dyc*dyc);
        e.x -= oc*dxc/d;
        e.y -= oc*dyc/d;
    }
}
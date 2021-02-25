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
    let current_overlap;
    let direction;
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

        if (max_b-min_a < max_a-min_b) {
            current_overlap = (max_b-min_a)/d;
            direction = 1;
        } else {
            current_overlap = (max_a-min_b)/d;
            direction = -1;
        }
        if (current_overlap < overlap) {
            dx = direction*ax/d;
            dy = direction*ay/d;
            overlap = current_overlap;
        }
    }
    return [overlap, dx, dy];
}
function solveSAT(e, c) {
    let [oe, dxe, dye] = solveHalfSAT(e, c);
    let [oc, dxc, dyc] = solveHalfSAT(c, e);
    if (oe < oc) {
        e.x += oe*dxe;
        e.y += oe*dye;
    } else {
        e.x -= oc*dxc;
        e.y -= oc*dyc;
    }
}


function solvePointSAT(collider, point) {
    if (collider.x0 >= point.posX || collider.x1 <= point.posX || collider.y0 >= point.posY || collider.y1 <= point.posY) {
        return false;
    }
    let overlap = Infinity;
    let dx = 0;
    let dy = 0;
    let current_overlap;
    let direction;
    for (let i = 0 ; i < collider.vertices.length ; i+=2) {
        let j = (i+2)%collider.vertices.length;
        let ax = collider.vertices[i+1] - collider.vertices[j+1];
        let ay = collider.vertices[j] - collider.vertices[i];
        let d = sqrt(ax*ax + ay*ay);
        let projPoint = ay*point.posY + ax*point.posX;
        let min_c = Infinity;
        let max_c = -Infinity;
        for (let k = 0 ; k < collider.vertices.length ; k+=2) {
            let proj = ay*collider.vertices[k+1] + ax*collider.vertices[k];
            min_c = min(min_c, proj);
            max_c = max(max_c, proj);
        }
        if (max_c <= projPoint || min_c >= projPoint) {
            return false;
        } else if (max_c-projPoint < projPoint-min_c) {
            current_overlap = (max_c-projPoint)/d;
            direction = 1;
        } else {
            current_overlap = (projPoint-min_c)/d;
            direction = -1;
        }
        if (current_overlap < overlap) {
            dx = direction*ax/d;
            dy = direction*ay/d;
            overlap = current_overlap;
        }
    }
    point.posX += overlap*dx;
    point.posY += overlap*dy;
    return true;
}


function solveSegmentSAT(collider, pointA, pointB) {
    let dx = 0;
    let dy = 0;
    let current_overlap;
    let direction;
    let overlap = Infinity;
    // SEGMENT
    {
        let ax = pointA.posY - pointB.posY;
        let ay = pointB.posX - pointA.posX;
        let d = sqrt(ax*ax + ay*ay);
        let min_c = Infinity;
        let max_c = -Infinity;
        for (let k = 0 ; k < collider.vertices.length ; k+=2) {
            let proj = ay*collider.vertices[k+1] + ax*collider.vertices[k];
            min_c = min(min_c, proj);
            max_c = max(max_c, proj);
        }
        let projA = ay*pointA.posY + ax*pointA.posX;
        let projB = ay*pointB.posY + ax*pointB.posX;
        let min_s = min(projA, projB);
        let max_s = max(projA, projB);

        if (max_c <= min_s || min_c >= max_s) {
            return false;
        } else if (max_s-min_c < max_c-min_s) {
            current_overlap = (max_s-min_c)/d;
            direction = -1;
        } else {
            current_overlap = (max_c-min_s)/d;
            direction = 1;
        }
        dx = direction*ax/d;
        dy = direction*ay/d;
    }
    // COLLIDER
    for (let i = 0 ; i < collider.vertices.length ; i+=2) {
        let j = (i+2)%collider.vertices.length;
        let ax = collider.vertices[i+1] - collider.vertices[j+1];
        let ay = collider.vertices[j] - collider.vertices[i];
        let d = sqrt(ax*ax + ay*ay);
        let min_c = Infinity;
        let max_c = -Infinity;
        for (let k = 0 ; k < collider.vertices.length ; k+=2) {
            let proj = ay*collider.vertices[k+1] + ax*collider.vertices[k];
            min_c = min(min_c, proj);
            max_c = max(max_c, proj);
        }
        let projA = ay*pointA.posY + ax*pointA.posX;
        let projB = ay*pointB.posY + ax*pointB.posX;
        let min_s = min(projA, projB);
        let max_s = max(projA, projB);

        if (max_c <= min_s || min_c >= max_s) {
            return false;
        } else if (max_s-min_c < max_c-min_s) {
            current_overlap = (max_s-min_c)/d;
            direction = 1;
        } else {
            current_overlap = (max_c-min_s)/d;
            direction = -1;
        }
        if (current_overlap < overlap) {
            dx = direction*ax/d;
            dy = direction*ay/d;
            overlap = current_overlap;
        }
    }
    pointA.posX -= overlap*dx;
    pointA.posY -= overlap*dy;
    pointB.posX -= overlap*dx;
    pointB.posY -= overlap*dy;
    return true;
}
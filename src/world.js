class World {
    constructor(entities, colliders, gravity = 0.01) {
        this.entities = entities;
        this.colliders = colliders;
        this.gravity = gravity;
    }

    tick(dt) {
        for (let entity of this.entities) {
            entity.y -= 0.005;
            //entity.x += 0.005;
            entity.update(dt);
            for (let collider of this.colliders) {
                if (collisionAABB(entity, collider) && collisionSAT(entity, collider)) {
                    solveSAT(entity, collider);
                    entity.updateCollider();
                }
            }
        }
    }
}

let colliders = [
    new Polygon([0.1,0.1, 0.3,0.0, 0.3,0.5, 0.0,0.5]),
    new Polygon([0.7,0.0, 0.9,0.1, 1.0,0.5]),
    new Polygon([0.0,0.0, 1.0,0.0, 1.0,0.1, 0.0,0.1]),
];
let entities = [
    new Player(0.5, 0.5, 0.03, 0.05, 0, 0, 0, 1),
];

let world = new World(entities, colliders, 0.002);

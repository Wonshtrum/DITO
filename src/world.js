class World {
    constructor(entities, colliders, ropes, gravity = 0.01) {
        this.entities = entities;
        this.colliders = colliders;
        this.ropes = ropes;
        this.gravity = gravity;
    }

    tick(dt) {
        for (let entity of this.entities) {
            entity.x += 0.003;
            entity.y -= 0.005;
            entity.update(0.01);
            for (let collider of this.colliders) {
                if (collisionAABB(entity, collider) && collisionSAT(entity, collider)) {
                    solveSAT(entity, collider);
                    entity.updateCollider();
                }
            }
        }
        for (let rope of this.ropes) {
            rope.simulate(dt, Cursor.x, Cursor.y, colliders, SOLVE_ROPE_COLLISION);
        }
    }
}

let colliders = [
    new Polygon([0.1,0.1, 0.3,0.0, 0.3,0.5, 0.0,0.5]),
    new Polygon([0.7,0.2, 0.9,0.1, 1.0,0.5]),
    new Polygon([0.0,0.0, 1.0,0.0, 1.0,0.1, 0.0,0.1]),
];
let entities = [
    new Entity(0.5, 0.9, 0.03, 0.05, 0, 0, 0, 1),
];
let ropes = [
    new Rope(0.2, 2.5, 50, 0.02, 0.95, 100),
];

let world = new World(entities, colliders, ropes, 0.002);

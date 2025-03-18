import Vector from "./vector.js";
class Physic {
    constructor(g = 0,drag = 1){
        this.g = g //g like gravity acceleration
        this.drag = drag
        this.objlist = [] //list of ph objects index of obj is its id
    }

    makeHitbox(x1,y1,x2,y2){
        return new Hitbox(new Vector(x1,y1),new Vector(x2,y2));
    }

    update() {
        for (let i = 0; i < this.objlist.length; i++) {
            this.objlist[i].update();
            for (let j = i + 1; j < this.objlist.length; j++) {
                if (this.objlist[i].checkCollision(this.objlist[j])) {
                    this.objlist[i].resolveCollision(this.objlist[j]);
                }
            }
        }
    }

    addObj(x,y,hitbox,mass = 1,g = this.g,drag = this.drag,restitution = 1) {
        this.objlist.push(new PhObj(x,y,hitbox,mass,g,drag,restitution))
        return this.objlist.length - 1 // object id
    }
}

class PhObj {
    constructor(x, y, hitbox, mass = 1, g=0, drag=1, restitution = 1) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error("x and y must be numbers");
        }
        if (!(hitbox instanceof Hitbox)) {
            throw new Error("hitbox must be an instance of Hitbox");
        }
        // if (typeof mass !== 'number' || mass <= 0) {
        //     throw new Error("mass must be a positive number");
        // }
        if (typeof g !== 'number') {
            throw new Error("g must be a number");
        }
        if (typeof drag !== 'number') {
            throw new Error("drag must be a number");
        }
        // if (typeof restitution !== 'number' || restitution < 0 || restitution > 1) {
        //     throw new Error("restitution must be a number between 0 and 1");
        // }

        this.restitution = restitution;
        this.mass = mass;
        this.drag = drag;
        this.g = new Vector(0, g); // g like gravity acceleration
        this.hitbox = hitbox;
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
        this.force = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
    }
    
    applyForce(force) {
        if (!(force instanceof Vector)) {
            throw new Error("force must be an instance of Vector");
        }
        this.force.add(force);
    }

    accelerate(a) { // a like acceleration 
        if (!(a instanceof Vector)) {
            throw new Error("acceleration must be an instance of Vector");
        }
        this.acceleration.add(a);
    }

    // applyDrag(drag) {
    //     if (typeof drag !== 'number') {
    //         throw new Error("drag must be a number");
    //     }
    //     this.velocity.mult(drag);
    // }

    update() {
        this.acceleration.add(this.force.div(this.mass));
        this.velocity.add(this.acceleration).add(this.g).mult(this.drag);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.force.mult(0);
    }

    checkCollision(other) {
        if (!(other instanceof PhObj)) {
            throw new Error("Argument must be an instance of PhObj");
        }
        this.hitbox.update(this.position);
        other.hitbox.update(other.position);
        return this.hitbox.isColliding(other.hitbox);
    }

    resolveCollision(other) {
        if (!(other instanceof PhObj)) {
            throw new Error("Argument must be an instance of PhObj");
        }
        
        if (this.checkCollision(other)) {
            // Najdeme normálový vektor kolize
            let collisionNormal = Vector.sub(this.position, other.position).normalize();
            
            // Relativní rychlost mezi objekty
            let relativeVelocity = Vector.sub(this.velocity, other.velocity);
            
            // Projekce rychlosti na normálový vektor
            let velocityAlongNormal = Vector.dot(relativeVelocity,collisionNormal);
            
            // Pokud se objekty vzdalují, kolizi neřešíme
            if (velocityAlongNormal > 0) return;
            
            // Koeficient restitutce (elasticity nárazu) -> 1 = plně elastický náraz
            let restitution = (this.restitution + other.restitution)/2;
            
            // Výpočet impulzu
            let impulseMagnitude = -(1 + restitution) * velocityAlongNormal;
            impulseMagnitude /= (1 / this.mass) + (1 / other.mass);
            
            // Výpočet vektorového impulzu
            let impulse = collisionNormal.mult(impulseMagnitude);
            
            // Aplikujeme impuls na objekty podle jejich hmotnosti
            this.velocity.add(impulse.div(this.mass)).sub(this.g);
            other.velocity.sub(impulse.div(other.mass)).sub(other.g);
        }
    }
}

class Hitbox {
    constructor(corner1, corner2) {
        if (!(corner1 instanceof Vector) || !(corner2 instanceof Vector)) {
            throw new Error("corner1 and corner2 must be instances of Vector");
        }
        if (!(corner1.x <= corner2.x && corner1.y <= corner2.y)) {
            throw new Error("Hitbox start is after end");
        }
        this.offset1 = corner1;
        this.offset2 = corner2;
        this.position = new Vector(0, 0);
    }

    update(position) {
        if (!(position instanceof Vector)) {
            throw new Error("Argument must be an instance of Vector");
        }
        this.position = position;
    }

    isColliding(hitbox) {
        if (!(hitbox instanceof Hitbox)) {
            throw new Error("Argument must be an instance of Hitbox");
        }
        return !((this.position.x + this.offset2.x < hitbox.position.x + hitbox.offset1.x) ||
                 (hitbox.position.x + hitbox.offset2.x < this.position.x + this.offset1.x)) &&
               !((this.position.y + this.offset2.y < hitbox.position.y + hitbox.offset1.y) ||
                 (hitbox.position.y + hitbox.offset2.y < this.position.y + this.offset1.y));
    }
}
export default Physic


// // Tests
// import { deepStrictEqual, strictEqual, notStrictEqual } from 'assert';
// import Vector from "./vector.js";
// // Test Vector class
// const v1 = new Vector(1, 2);
// const v2 = new Vector(3, 4);
// deepStrictEqual(v1.add(v2), new Vector(4, 6));
// deepStrictEqual(v1.sub(v2), new Vector(1, 2));
// deepStrictEqual(v1.mult(2), new Vector(2, 4));
// deepStrictEqual(v1.div(2), new Vector(1, 2));

// // Test Hitbox class
// const h1 = new Hitbox(new Vector(0, 0), new Vector(1, 1));
// const h2 = new Hitbox(new Vector(0.5, 0.5), new Vector(1.5, 1.5));
// strictEqual(h1.isColliding(h2), true);
// const h3 = new Hitbox(new Vector(2, 2), new Vector(3, 3));
// strictEqual(h1.isColliding(h3), false);

// // Test PhObj class
// const hitbox = new Hitbox(new Vector(0, 0), new Vector(1, 1));
// const phObj = new PhObj(0, 0, hitbox);
// phObj.applyForce(new Vector(1, 0));
// phObj.update();
// notStrictEqual(phObj.position.x, 0);
// strictEqual(phObj.position.y, 0);

// // Test Physic class
// const physic = new Physic();
// const objHitbox = physic.makeHitbox(new Vector(0, 0),new Vector( 1, 1));
// const id1 = physic.addObj(0, 0, objHitbox, 1);
// strictEqual(physic.objlist.length, 1);
// strictEqual(id1, 0);
// const id2 = physic.addObj(10, 0, objHitbox, 1); 
// strictEqual(physic.objlist.length, 2);
// strictEqual(id2, 1);
// physic.update();
// strictEqual(physic.objlist[0].position.x, 0);
// strictEqual(physic.objlist[0].position.y, 0);
// //colision test
// // Collision test
// const objHitbox2 = physic.makeHitbox(new Vector(0, 0), new Vector(1, 1));
// const id3 = physic.addObj(0.5, 0.5, objHitbox2, 1);
// physic.update();
// strictEqual(physic.objlist[0].checkCollision(physic.objlist[2]), true);
// strictEqual(physic.objlist[1].checkCollision(physic.objlist[2]), false);

// console.log("All tests passed!");
import Render from "./render.js";
import Physic from "./physic.js";
class Game {
    constructor(width, height, gravity = 0, drag = 1, background = [250, 250, 250]) {
        this.physic = new Physic(gravity, drag); // Physics engine
        this.render = new Render(width, height, background); // Renderer
        this.spriteToPhysics = []; // Map to link sprites to physics objects
    }

    // Method to add a new physics object and a linked sprite
    addPhysicsObjectWithSprite(x, y, spriteSrc, spriteWidth, spriteHeight,  scale = 1,mass = 1, g = this.g,restitution = 1,drag = this.drag,hitbox = true,) {
        
        if (hitbox === true) {
            hitbox = this.physic.makeHitbox(0, 0, spriteWidth*scale, spriteHeight*scale); // Create a hitbox if not provided
        }

        // Create physics object
        let objectId = this.physic.addObj(x, y, hitbox, mass, g, drag,restitution);
        
        // Create sprite linked to the physics object
        let sprite = this.render.makeSprite(x, y, spriteSrc, spriteWidth, spriteHeight, scale, () => {
            this.render.render(); // Render when the image is loaded
        });
        
        // Link the sprite to the physics object using spriteToPhysics map
       this.spriteToPhysics[objectId] = sprite;

        // Add the sprite to the renderer
        this.render.addSprite(sprite);

        return { sprite, objectId };
    }

    // Method to add a free-floating sprite (not linked to any PhObj)
    addFreeSprite(x, y, spriteSrc, spriteWidth, spriteHeight, scale = 1) {
        let sprite = this.render.makeSprite(x, y, spriteSrc, spriteWidth, spriteHeight, scale, () => {
            this.render.render(); // Render when the image is loaded
        });

        // Add the sprite to the renderer
        this.render.addSprite(sprite);

        return sprite;
    }

    // Game loop to update and render everything
    gameLoop() {
        // Update the physics engine
        this.physic.update();

        // Update sprite positions based on their linked PhObj

        for (let sprite of this.spriteToPhysics) {
            
                // Update sprite position to match the corresponding physics object
                let phObj = this.physic.objlist[this.spriteToPhysics.indexOf(sprite)];
                sprite.x = phObj.position.x;
                sprite.y = phObj.position.y;
          
            
        }

        // Render the updated scene
        this.render.render();

        // Request the next frame
        requestAnimationFrame(() => this.gameLoop());
    }

    // Start the game
    start() {
        this.gameLoop();
    }
}

// Usage Example:

// Create game instance
let game = new Game(800, 600, 0.1, 1, [0, 0, 0]);

// Create a hitbox for physics objects
//let hitbox = game.physic.makeHitbox(0, 0, 20, 20); // 20x20 square hitbox

// Create physics object with linked sprite
let { sprite: sprite1, objectId: objectId1 } = game.addPhysicsObjectWithSprite(100, 400, "./Slimer.png", 20, 20, 4,100,-0.1,0,0.9);
let { sprite: sprite2, objectId: objectId2 } = game.addPhysicsObjectWithSprite(100, 200, "./Slimer.png", 20, 20, 4,100,-0.1,0,0.9);
let { sprite: sprite3, objectId: objectId3 } = game.addPhysicsObjectWithSprite(100, 300, "./Slimer.png", 20, 20, 4,100,-0.1,0,0.9);
let { sprite: sprite4, objectId: objectId4 } = game.addPhysicsObjectWithSprite(100, 100, "./Slimer.png", 20, 20, 4,100,0.1,0,0.9);
// Create a free-floating sprite (not linked to any physics object)
let freeSprite = game.addFreeSprite(400, 200, "./Slimer.png", 20, 20, 4);

// Start the game loop
game.start();

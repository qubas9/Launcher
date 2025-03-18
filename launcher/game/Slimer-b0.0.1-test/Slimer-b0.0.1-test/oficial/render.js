class Render {
    constructor(width, height, background = [250, 250, 250]) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d");
      this.sprites = [];
      this.background = background;
      document.body.appendChild(this.canvas);
    }
  
    addSprite(sprite) {
      if (!(sprite instanceof Sprite)) {
        throw new Error("sprite must be an instance of Sprite");
      }
      this.sprites.push(sprite);
    }
    
    makeSprite(x, y, imageSrc, width, height, scale = 1) {
        return new Sprite(x, y, imageSrc, width, height, scale);
        }

    render() {
      // Fill background
      this.ctx.fillStyle = `rgb(${this.background[0]},${this.background[1]},${this.background[2]})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw all sprites (only if image is loaded)
      for (let sprite of this.sprites) {
        if (sprite.loaded) {
          this.ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.width, sprite.height);
        }
      }
    }
  }
  
  class Sprite {
    constructor(x, y, imageSrc, width, height,scale = 1, onLoadCallback) {
      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("x and y must be numbers");
      }
      if (typeof width !== "number" || typeof height !== "number") {
        throw new Error("width and height must be numbers");
      }
      if (typeof imageSrc !== "string") {
        throw new Error("imageSrc must be a valid URL string");
      }
  
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.width = width*this.scale;
      this.height = height*this.scale;
      this.image = new Image();
      this.loaded = false;
  
      this.image.onload = () => {
        this.loaded = true;
        if (typeof onLoadCallback === "function") {
          onLoadCallback(); // Call render when image is ready
        }
      };
  
      this.image.onerror = () => console.error(`Error loading image: ${imageSrc}`);
      this.image.src = imageSrc;
    }
  }
  

export default Render;
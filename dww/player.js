// Based on the Player class from Thomas's "runner" demo game
// (itself based on the p5 example: https://p5js.org/examples/Math-And-Physics-Forces/)

class Player{
  constructor(m, x, y, img){
    this.mass = m;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.img = img;       // the skin picture (Finn, Jake, Cowboy Frog, etc.)
    this.size = 35;       // size of the player on screen, in pixels. I determined the perfect size through trial and error.
    this.onGround = false;
  }

  // Apply a force: A = F / M (Newton's 2nd law)
  applyForce(force){
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update(){
    this.velocity.add(this.acceleration);  // speed changes with acceleration
    this.position.add(this.velocity);      // position changes with speed
    this.acceleration.mult(0);             // reset acceleration each frame
  }

  display(){
    image(this.img, this.position.x, this.position.y, this.size, this.size);
  }

  // Keep the player between the ground and the top of the screen
  checkEdges(groundPosition){
    // bottom: the player stands on the ground
    if(this.position.y >= groundPosition - this.size / 2){
      this.position.y = groundPosition - this.size / 2;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // top: the player can't fly out of the screen
    if(this.position.y <= this.size / 2){
      this.position.y = this.size / 2;
      this.velocity.y = 0;
    }
  }
}
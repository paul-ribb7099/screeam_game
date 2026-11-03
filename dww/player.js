/*
  PLAYER
  ------
  This file creates the player: the character you control by screaming.
  It handles how the player moves (gravity and the push from the mic),
  how it's drawn, and how it stays between the ground and the top of the screen.

  Based on the Player class from Thomas's "runner" demo game:
  https://github.com/methio/MITID-p5-template/tree/main/demo-games/runner
  (itself based on the p5 example: https://p5js.org/examples/Math-And-Physics-Forces/)
  - From Thomas: the forces system (mass, position, velocity, acceleration,
    applyForce, update) and the ground check
  - Added for this game (with the help of Claude, an AI assistant):
    the skin picture, the fixed size, and the ceiling at the top of the screen
*/

class Player{

  /*
    CONSTRUCTOR
    Runs once when the player is created with "new Player(...)" in script.js,
    at the start of each game.

    The player's movement uses vectors. A vector holds two numbers at once:
    x (sideways) and y (up/down). Here, only y really changes, since the
    player stays in the same spot horizontally and only goes up and down.
  */
  constructor(m, x, y, img){
    this.mass = m;                             // how heavy the player is: a heavier player
                                               // is harder to push up
    this.position = createVector(x, y);        // where the player is on screen (its center)
    this.velocity = createVector(0, 0);        // its speed: how far it moves each frame
    this.acceleration = createVector(0, 0);    // how much its speed changes this frame
    this.img = img;       // the skin picture (Finn, Jake, Cowboy Frog, etc.)
    this.size = 35;       // size of the player on screen, in pixels. I determined the perfect size through trial and error.
    this.onGround = false;                     // true when the player is standing on the ground
  }

  /*
    APPLY FORCE (from Thomas's code)
    Pushes the player in a direction. It's used for gravity (pushing down)
    and for the scream (pushing up), from script.js.

    It follows Newton's 2nd law: acceleration = force / mass.
    So the same push moves a light player more than a heavy one.
    Several forces can be added in the same frame: they add up.
  */
  applyForce(force){
    let f = p5.Vector.div(force, this.mass);   // divide the force by the mass
    this.acceleration.add(f);                  // add it to this frame's acceleration
  }

  /*
    UPDATE (from Thomas's code)
    Called every frame, after the forces are applied. It moves the player.

    It works in a chain: the acceleration changes the speed,
    then the speed changes the position. That's what makes the movement
    smooth: the player speeds up and slows down gradually, instead of
    jumping instantly from one place to another.
  */
  update(){
    this.velocity.add(this.acceleration);  // speed changes with acceleration
    this.position.add(this.velocity);      // position changes with speed
    this.acceleration.mult(0);             // reset acceleration each frame, so forces
                                           // don't keep piling up from frame to frame
  }

  /*
    DISPLAY
    Called every frame. Draws the player's skin at its position.
    Since imageMode(CENTER) is used in script.js, the position is the
    center of the picture, not its top-left corner.
  */
  display(){
    image(this.img, this.position.x, this.position.y, this.size, this.size);
  }

  /*
    CHECK EDGES
    Called every frame, after update(). Keeps the player between the ground
    and the top of the screen.

    The position is the center of the player, so we use size / 2 (half the
    player) to know where its feet and its head are.
    In p5, y goes DOWN: y = 0 is the top of the screen, bigger y is lower.
  */
  checkEdges(groundPosition){
    // Bottom (from Thomas's code): if the player's feet go below the ground,
    // put it back on the ground and stop it from falling further
    if(this.position.y >= groundPosition - this.size / 2){
      this.position.y = groundPosition - this.size / 2;   // feet exactly on the ground
      this.velocity.y = 0;                                // stop falling
      this.onGround = true;
    } else {
      this.onGround = false;                              // the player is in the air
    }

    // Top: if the player's head reaches the top of the screen,
    // keep it there so it can't fly out of the game
    if(this.position.y <= this.size / 2){
      this.position.y = this.size / 2;    // head exactly at the top edge
      this.velocity.y = 0;                // stop going up
    }
  }
}
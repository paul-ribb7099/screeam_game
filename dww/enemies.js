/*
  ENEMIES
  -------
  This file creates every enemy in the game: the cactus, the spinning shrimp,
  the shooting shrimp, and the bubbles the shooting shrimp spits.

  One single class is used for all of them. Each enemy gets a "type",
  and the class behaves differently depending on that type.

  Based on the Enemy class from Thomas's "runner" demo:
  https://github.com/methio/MITID-p5-template/tree/main/demo-games/runner
  - From Thomas: checkCollision() and isOutOfMap()
  - Added for this game (with the help of Claude, an AI assistant):
    enemy types, pictures, spinning and shooting
*/

class Enemy{

    /*
      CONSTRUCTOR
      Runs once each time a new enemy is created with "new Enemy(...)" in script.js.
      It receives the enemy's information (type, picture, size, height, speed)
      and stores it inside the enemy, so the other functions can use it later.
      "this" means "the enemy being created".
    */
    constructor(type, img, w, h, y, extraSpeed){
        this.type = type;             // kind of enemy: "cactus", "spinning", "shooting" or "bubble"
        this.img = img;               // its picture
        this.w = w;                   // its width on screen (also used for collisions)
        this.h = h;                   // its height on screen (also used for collisions)
        this.x = width + w;           // starts just off the right side of the screen,
                                      // so it slides in instead of suddenly appearing
        this.y = y;                   // its height on screen: on the ground or in the air
        this.extraSpeed = extraSpeed; // how much faster than the ground it moves
                                      // (0 = same speed as the ground, like the cactus)

        // Only used by the spinning shrimp
        this.angle = 0;               // how much it has turned so far
        this.spinSpeed = 0.08;        // how much it turns each frame
                                      // (about one full turn every 1.3 seconds)

        // Only used by the shooting shrimp
        this.shootTimer = 0;          // counts the frames since the last bubble
        this.shootInterval = 45;      // one bubble every 45 frames
                                      // (the game runs at 60 frames per second, so 45 = 0.75 seconds)
    }

    /*
      UPDATE
      Called every frame by script.js. It moves the enemy to the left.

      Every enemy moves at least at the speed of the ground (gameSpeed).
      That way, the cactus and the shooting shrimp look like they're standing
      on the floor while the floor moves. Enemies with an extra speed,
      like the spinning shrimp and the bubbles, move faster, as if they
      were charging at the player.
    */
    update(){
        this.x = this.x - (gameSpeed + this.extraSpeed);

        // The spinning shrimp also turns a little more each frame.
        // The minus makes it turn to the left, as if it were rolling toward the player.
        if(this.type === "spinning"){
            this.angle = this.angle - this.spinSpeed;
        }
    }

    /*
      DISPLAY
      Called every frame by script.js. It draws the enemy at its current position.

      To make the spinning shrimp turn, p5 can't rotate just one picture:
      it rotates the whole drawing area. So we save the settings (push),
      move to the shrimp, rotate, draw it, then put everything back (pop).
      Without push and pop, the whole game would start spinning too.
    */
    display(){
        if(this.type === "spinning"){
            push();                          // save the drawing settings
            translate(this.x, this.y);       // move to the shrimp's position, so it turns
                                             // around its own center
            rotate(this.angle);              // turn the drawing area
            image(this.img, 0, 0, this.w, this.h);   // draw the shrimp (0, 0 is now its position)
            pop();                           // put the settings back to normal
        } else {
            // the other enemies don't turn, so they're drawn normally
            image(this.img, this.x, this.y, this.w, this.h);
        }
    }

    /*
      WANTS TO SHOOT
      Asked every frame by script.js: "should this enemy spit a bubble now?"

      It works like a kitchen timer. Each frame, the shooting shrimp adds 1
      to its timer. When the timer reaches shootInterval (45), it answers "true",
      script.js creates a bubble, and the timer starts again from 0.
      All the other enemies always answer "false".
    */
    wantsToShoot(){
        // only the shooting shrimp can shoot
        if(this.type != "shooting"){
            return false;
        }

        this.shootTimer = this.shootTimer + 1;       // one more frame has passed
        if(this.shootTimer >= this.shootInterval){   // enough time has passed since the last bubble
            this.shootTimer = 0;                     // start counting again
            return true;                             // yes, shoot now
        }
        return false;                                // not yet
    }

    /*
      CHECK COLLISION (from Thomas's code)
      Checks if this enemy is touching the player. Returns true if yes, false if no.

      The player and the enemy are both treated as invisible rectangles (hitboxes).
      They touch if their centers are close enough, both sideways AND up/down.
      "Close enough" means: closer than half of the two sizes added together.

      With debug set to true, the hitboxes are drawn on screen
      (green = not touching, red = touching), to check they match the pictures.
    */
    checkCollision(p, debug = false){
        const of = 5;                    // makes the player's hitbox 5 pixels smaller on each side,
                                         // so you don't die when an enemy only just brushes past
        const pHalf = p.size / 2 - of;   // half the size of the player's hitbox

        // abs() gives the distance without a minus sign,
        // whether the enemy is on the left or the right of the player
        const hit =
            abs(p.position.x - this.x) < pHalf + this.w / 2 &&   // close enough sideways
            abs(p.position.y - this.y) < pHalf + this.h / 2;     // close enough up/down

        // debug mode: draw the hitboxes
        if(debug == true){
            rectMode(CENTER);                  // rectangles placed by their center
            noFill();                          // only the outline
            stroke(hit ? "#F00" : "#0F0");     // red if touching, green if not
            rect(p.position.x, p.position.y, pHalf * 2);   // player's hitbox
            rect(this.x, this.y, this.w, this.h);         // enemy's hitbox
            noStroke();                        // turn the outline off again
        }

        return hit;
    }

    /*
      IS OUT OF MAP (from Thomas's code)
      Checks if the enemy has completely left the screen on the left side.

      When it has, script.js removes it from the list of enemies.
      Otherwise, the game would keep moving and drawing enemies
      that nobody can see anymore, which would slow it down over time.
    */
    isOutOfMap(){
        // "condition ? true : false" is a short way of writing an if/else on one line
        return this.x < 0 - this.w ? true : false;
    }
}
// Based on the Enemy class from Thomas's "runner" demo

class Enemy{
    constructor(type, img, w, h, y, extraSpeed){
        this.type = type;             // "cactus", "spinning", "shooting" or "bubble"
        this.img = img;               // the enemy picture
        this.w = w;                   // width on screen
        this.h = h;                   // height on screen
        this.x = width + w;           // starts just outside the right edge
        this.y = y;                   // height on screen (ground or air)
        this.extraSpeed = extraSpeed; // extra speed on top of the ground speed

        // spinning shrimp
        this.angle = 0;               // current rotation
        this.spinSpeed = 0.08;        // how much it turns each frame

        // shooting shrimp
        this.shootTimer = 0;          // frames since the last bubble
        this.shootInterval = 45;      // frames between two bubbles (30 = half a second)
    }

    // move to the left, with the ground + any extra speed
    update(){
        this.x = this.x - (gameSpeed + this.extraSpeed);

        // the spinning shrimp also turns a little each frame
        if(this.type === "spinning"){
            this.angle = this.angle - this.spinSpeed;
        }
    }

    display(){
        if(this.type === "spinning"){
            push();                          // save the current drawing settings
            translate(this.x, this.y);       // move the drawing origin to the shrimp
            rotate(this.angle);              // turn the drawing
            image(this.img, 0, 0, this.w, this.h);
            pop();                           // put the drawing settings back
        } else {
            image(this.img, this.x, this.y, this.w, this.h);
        }
    }

    // the shooting shrimp says "true" when it's time to spit a bubble
    wantsToShoot(){
        if(this.type != "shooting"){
            return false;
        }

        this.shootTimer = this.shootTimer + 1;
        if(this.shootTimer >= this.shootInterval){
            this.shootTimer = 0;   // start counting again
            return true;
        }
        return false;
    }

    checkCollision(p, debug = false){
        const of = 5; // offset to reduce player hitbox
        const pHalf = p.size / 2 - of; // half player width (utility)

        // we check overlap
        const hit =
            abs(p.position.x - this.x) < pHalf + this.w / 2 &&
            abs(p.position.y - this.y) < pHalf + this.h / 2;

        // a way to display the hitboxes
        if(debug == true){
            rectMode(CENTER);
            noFill();
            stroke(hit ? "#F00" : "#0F0");
            rect(p.position.x, p.position.y, pHalf * 2);
            rect(this.x, this.y, this.w, this.h);
            noStroke();
        }

        return hit;
    }

    // if enemy leaves the screen on the left
    isOutOfMap(){
        return this.x < 0 - this.w ? true : false;
    }
}
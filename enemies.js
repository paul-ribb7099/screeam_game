// Based on the Enemy class from Thomas's "runner" demo

class Enemy{
    constructor(img, w, h, y, speed){
        this.img = img;        // the enemy picture (cactus, shrimp...)
        this.w = w;            // width on screen
        this.h = h;            // height on screen
        this.x = width + w;    // starts just outside the right edge
        this.y = y;            // height on screen (ground or air)
        this.speed = speed;    // how many pixels it moves left each frame
    }

    // move to the left
    update(){
        this.x = this.x - this.speed;
    }

    display(){
        image(this.img, this.x, this.y, this.w, this.h);
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
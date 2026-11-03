// ---------- FLOOR ----------
// A rectangle the same color as the ground band of the background,
// with small marks on it that slide to the left so the floor looks like it's moving.

let floorOffset = 0;    // how far the floor pattern has slid to the left
let tileSpacing = 40;   // distance between two marks on the floor

function drawFloor(){
    rectMode(CORNER);   // x, y = top-left corner of the rectangle
    noStroke();

    // the floor: same color as the ground band of the background
    fill("#487989");
    rect(0, groundY, width, height - groundY);

    // marks on the floor, so we can see it move
    fill("#518791");
    let x = floorOffset;
    while(x < width){
        rect(x, groundY + 6, 16, 4);
        x = x + tileSpacing;
    }

    // slide the pattern to the left
    floorOffset = floorOffset - gameSpeed;

    // when it has slid one full space, jump back (invisible loop)
    if(floorOffset <= -tileSpacing){
        floorOffset = floorOffset + tileSpacing;
    }
}
// ---------- HOME SCREEN ----------

function drawHomeScreen(){
    // background, darkened with a see-through black rectangle (like in Figma)
    image(backgroundImg, width / 2, height / 2, width, height);
    rectMode(CORNER);
    noStroke();
    fill(0, 0, 0, 128);   // black, 128 out of 255 = about 50% see-through
    rect(0, 0, width, height);

    // title
    image(titleImg, 360, 105, 600, 216);

    // tagline, in Press Start 2P
    textFont(pixelFont);
    textSize(8);
    textAlign(CENTER, CENTER);
    fill(255);   // white
    text("THE LOUDER YOU SCREAM, THE HIGHER YOU GO!", 360, 210);

    // the selected skin, big, in the middle
    image(skins[skinIndex], 360, 290, 110, 110);

    // arrows on each side of the skin
    image(arrowLeftImg, 250, 290, 50, 50);
    image(arrowRightImg, 470, 290, 50, 50);

    // play button
    image(playImg, 360, 410, 110, 49);
}

// ---------- DEATH SCREEN ----------

function drawDeathScreen(){
    // black background
    background(0);

    textFont(pixelFont);
    textAlign(CENTER, CENTER);

    // score box at the top: black rectangle with a white border
    rectMode(CENTER);
    stroke(255);          // white border
    strokeWeight(2);      // border thickness
    fill(0);              // black inside
    rect(365, 41, 320, 40);
    noStroke();

    // score text inside the box, padded with zeros: 1 -> 000001
    fill(255);
    textSize(16);
    text("YOUR SCORE: " + nf(score, 6), 365, 42);

    // the sign in the middle (bigger, to make up for the empty space in the PNG)
    image(deathSignImg, 379, 271, 343, 351);

    // "YOU'RE" on the left of the post, "DEAD" on the right
    fill(255);
    textSize(32);
    text("YOU'RE", 217, 134);
    text("DEAD", 483, 134);

    // if it's a new high score: tilted trophy on the sign, tilted text underneath
    if(isNewHighscore){

        // trophy, tilted to the left, a bit wider
        push();
        translate(343, 229);       // where the trophy goes
        rotate(-0.4);              // tilt it (negative = to the left)
        image(trophyImg, 0, 0, 210, 181);
        pop();

        // text, tilted slightly upward
        push();
        translate(395, 342);
        rotate(-0.08);             // negative = counter-clockwise
        fill("#f5c343");           // yellow
        textSize(26);
        text("NEW HIGHSCORE !!", 0, 0);
        pop();
    }

    // instructions at the bottom (bigger, like in Figma)
    fill(255);
    textSize(32);
    text("Press A to go home", 360, 459);
}

// ---------- IN-GAME SCORE (HUD) ----------
// Shows the score at the top, with the high score (or "New Highscore") underneath.

function drawHUD(){
    textFont(pixelFont);
    textAlign(CENTER, CENTER);
    noStroke();

    // current score, padded with zeros: 42 -> 000042
    fill(0);   // black
    textSize(12);
    text("Score: " + nf(score, 6), 360, 20);

    if(highscore > 0 && score > highscore){
        // the player is beating the previous high score: yellow banner
        rectMode(CENTER);
        noStroke();
        fill("#f5c343");               // yellow, like in Figma
        rect(360, 40, 116, 14);

        // little rays on each side of the banner
        stroke("#f5c343");
        strokeWeight(2);
        // left side
        line(296, 35, 288, 31);
        line(296, 40, 287, 40);
        line(296, 45, 288, 49);
        // right side
        line(424, 35, 432, 31);
        line(424, 40, 433, 40);
        line(424, 45, 432, 49);
        noStroke();

        // black text on the banner
        fill(0);
        textSize(8);
        text("New Highscore", 360, 41);
    } else {
        // otherwise: show the high score to beat
        fill(0);
        textSize(8);
        text("Highscore: " + nf(highscore, 6), 360, 40);
    }
}
/*
  SCREENS
  -------
  This file draws everything the player sees that isn't the player or an enemy:
  - the moving floor
  - the home screen (title, skin choice, play button)
  - the death screen (score, sign, new high score)
  - the score at the top of the screen during the game (HUD)

  Each screen is its own function. script.js decides which one to call,
  depending on where we are in the game (home, playing or dead).

  Written for this game with the help of Claude (an AI assistant),
  based on my own designs in Figma.
*/


/* ================================================================
   FLOOR
   ================================================================
   The background image already has a flat ground band at the bottom.
   On top of it, we draw a rectangle of the exact same color, so you
   can't tell them apart. Then we draw small marks on that rectangle and
   slide them to the left every frame: that's what makes the floor
   look like it's moving.

   The trick is that the marks repeat every 40 pixels. Once they have
   slid 40 pixels, the floor looks exactly like at the start, so we
   jump back by 40 without anyone noticing. Like a treadmill, it looks
   endless but it's always the same small piece going round.
*/

let floorOffset = 0;    // how far the marks have slid to the left
let tileSpacing = 40;   // distance between two marks on the floor

function drawFloor(){
    rectMode(CORNER);   // for the rectangles below, x and y = their top-left corner
    noStroke();         // no outline around the rectangles

    // The floor: one big rectangle from the ground line to the bottom of the screen,
    // in the same color as the ground band of the background
    fill("#487989");
    rect(0, groundY, width, height - groundY);

    // The marks on the floor: small rectangles in a slightly lighter color.
    // The "while" loop draws one, moves 40 pixels to the right, draws another,
    // and keeps going until it reaches the right edge of the screen.
    fill("#518791");
    let x = floorOffset;
    while(x < width){
        rect(x, groundY + 6, 16, 4);
        x = x + tileSpacing;
    }

    // Slide the marks to the left, at the same speed as the enemies on the ground
    floorOffset = floorOffset - gameSpeed;

    // When they have slid one full space (40 pixels), jump back.
    // Since the pattern repeats, the jump is invisible.
    if(floorOffset <= -tileSpacing){
        floorOffset = floorOffset + tileSpacing;
    }
}


/* ================================================================
   HOME SCREEN
   ================================================================
   The first screen of the game. It shows the title, a short sentence
   explaining how to play, the selected skin with an arrow on each side
   to change it, and the PLAY button.

   This function only DRAWS the screen. The clicks on the arrows and
   on the PLAY button are handled in mousePressed(), in script.js.
   If a button is moved here, its position must also be changed there.
*/

function drawHomeScreen(){
    // The game background, darkened with a see-through black rectangle on top
    // (same trick as in my Figma design)
    image(backgroundImg, width / 2, height / 2, width, height);
    rectMode(CORNER);
    noStroke();
    fill(0, 0, 0, 128);   // black, with transparency: 0 = invisible, 255 = solid,
                          // so 128 = about 50% see-through
    rect(0, 0, width, height);

    // Title "SCREEAM!" at the top
    image(titleImg, 360, 105, 600, 216);

    // Sentence explaining the game, in the Press Start 2P pixel font
    textFont(pixelFont);
    textSize(8);                    // pixel fonts look sharpest at multiples of 8
    textAlign(CENTER, CENTER);      // the text is centered on the x, y point
    fill(255);   // white
    text("THE LOUDER YOU SCREAM, THE HIGHER YOU GO!", 360, 210);

    // The selected skin, big, in the middle.
    // "skins" is the list of the 4 skin pictures, and "skinIndex" is the
    // position of the selected one in that list (0 = the first one).
    image(skins[skinIndex], 360, 290, 110, 110);

    // Arrows on each side of the skin, to switch to the previous or next one
    image(arrowLeftImg, 250, 290, 50, 50);
    image(arrowRightImg, 470, 290, 50, 50);

    // PLAY button, to start the game
    image(playImg, 360, 410, 110, 49);
}


/* ================================================================
   DEATH SCREEN
   ================================================================
   Shown when the player gets hit by an enemy. It shows the score of
   the game that just ended, the "YOU'RE DEAD" sign, and how to go back
   to the home screen.

   If the player beat the high score, a tilted trophy and a yellow
   "NEW HIGHSCORE !!" text are added on the sign, like in my Figma design.
   The tilt uses the same trick as the spinning shrimp: push, translate,
   rotate, draw, pop.
*/

function drawDeathScreen(){
    // Black background over the whole screen
    background(0);

    textFont(pixelFont);
    textAlign(CENTER, CENTER);

    // Score box at the top: a black rectangle with a white border
    rectMode(CENTER);     // the rectangle is placed by its center
    stroke(255);          // white border
    strokeWeight(2);      // border thickness
    fill(0);              // black inside
    rect(365, 41, 320, 40);
    noStroke();           // turn the border off again, so the text doesn't get one

    // Score inside the box. nf(score, 6) writes the number with 6 digits,
    // adding zeros in front: 1 becomes 000001 (arcade style)
    fill(255);
    textSize(16);
    text("YOUR SCORE: " + nf(score, 6), 365, 42);

    // The sign in the middle. It's drawn bigger than in Figma,
    // to make up for the empty space around the drawing in the PNG file.
    image(deathSignImg, 379, 271, 343, 351);

    // "YOU'RE" on the left of the sign's post, "DEAD" on the right
    fill(255);
    textSize(32);
    text("YOU'RE", 217, 134);
    text("DEAD", 483, 134);

    // Only if this game beat the high score
    // (isNewHighscore is decided in endGame(), in script.js)
    if(isNewHighscore){

        // Trophy on the sign, tilted to the left
        push();                    // save the drawing settings
        translate(343, 229);       // move to where the trophy goes
        rotate(-0.4);              // tilt it (negative = to the left)
        image(trophyImg, 0, 0, 210, 181);
        pop();                     // put the settings back, so nothing else is tilted

        // "NEW HIGHSCORE !!" under the trophy, tilted slightly upward
        push();
        translate(395, 342);
        rotate(-0.08);             // a small tilt (negative = counter-clockwise)
        fill("#f5c343");           // yellow
        textSize(26);
        text("NEW HIGHSCORE !!", 0, 0);
        pop();
    }

    // Instructions at the bottom (the A key is handled in keyPressed(), in script.js)
    fill(255);
    textSize(32);
    text("Press A to go home", 360, 459);
}


/* ================================================================
   IN-GAME SCORE (HUD)
   ================================================================
   Drawn at the top of the screen while playing, on top of everything else.
   It shows the current score, and underneath, the high score to beat.

   As soon as the current score goes above the high score, the high score
   line is replaced by a yellow "New Highscore" banner with little rays
   on each side, like in my Figma design.
*/

function drawHUD(){
    textFont(pixelFont);
    textAlign(CENTER, CENTER);
    noStroke();

    // Current score, written with 6 digits: 42 becomes 000042
    fill(0);   // black
    textSize(12);
    text("Score: " + nf(score, 6), 360, 20);

    // "highscore > 0" avoids showing the banner in the very first game,
    // when there's no high score to beat yet
    if(highscore > 0 && score > highscore){
        // The player is beating the high score: yellow banner
        rectMode(CENTER);
        noStroke();
        fill("#f5c343");               // yellow, like in Figma
        rect(360, 40, 116, 14);

        // Little rays on each side of the banner.
        // line(x1, y1, x2, y2) draws a line between two points.
        // Lines use the stroke color, not the fill color.
        stroke("#f5c343");
        strokeWeight(2);
        // left side: one ray going up, one straight, one going down
        line(296, 35, 288, 31);
        line(296, 40, 287, 40);
        line(296, 45, 288, 49);
        // right side: same, mirrored
        line(424, 35, 432, 31);
        line(424, 40, 433, 40);
        line(424, 45, 432, 49);
        noStroke();

        // Black text on the banner
        fill(0);
        textSize(8);
        text("New Highscore", 360, 41);
    } else {
        // Otherwise: show the high score to beat, with 6 digits
        fill(0);
        textSize(8);
        text("Highscore: " + nf(highscore, 6), 360, 40);
    }
}
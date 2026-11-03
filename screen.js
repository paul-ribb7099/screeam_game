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
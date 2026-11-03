// Based on the "runner" demo by Thomas (my copy of his MITID-p5-template):
// https://github.com/paul-ribb7099/MITID-p5-template/tree/main/demo-games/runner


// Here, I just created a box called "backgroundImg", and it will be used to store the background image of the game.

let backgroundImg;


// This function allows for the game to load the background image, before anything else if loaded (this is why it's called preload).
// If this function didn't exist, the game would load the background image after everything else, which would make no sense.

function preload(){
    backgroundImg = loadImage("assets/background-game.png");
}

// This function creates the area in which the game will be played (aka the canvas). In this case, the canvas is 720 pixels wide and 512 pixels high.

function setup(){
    createCanvas(720, 512);
}

function draw(){
    image(backgroundImg, 0, 0, width, height);
}
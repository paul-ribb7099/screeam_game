// Based on the "runner" demo by Thomas (my copy of his MITID-p5-template):
// https://github.com/paul-ribb7099/MITID-p5-template/tree/main/demo-games/runner

// ----- pictures and font -----
let backgroundImg;
let titleImg;
let arrowLeftImg;
let arrowRightImg;
let playImg;
let cactusImg;
let pixelFont;

// ----- skins -----
let skins = [];       // list of the 4 skin pictures
let skinIndex = 0;    // which skin is selected (0 = first in the list)

// ----- game -----
let gameState = "home";   // which screen we're on: "home" or "playing"

let player;
let gravity;

let groundY = 490;    // height of the ground on the background
let gameSpeed = 5;    // speed of the ground, in pixels per frame

let enemies = [];     // list of all enemies currently on screen
let nextSpawn = 0;    // frame number when the next enemy will appear

// ----- Arduino (serial code added by Thomas in class) -----
let port;             // serial port object
let connectBtn;
let microValue = 0;

// p5 version 2: files are loaded in setup with async/await (no more preload)
async function setup(){
    createCanvas(720, 512);

    // port setup (serial code added by Thomas in class)
    port = createSerial();
    connectBtn = createButton("Connect to Arduino");
    connectBtn.mousePressed(connectBtnClick);

    // if port previously used, open it.
    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
        port.open(usedPorts[0], 9600);
    }

    imageMode(CENTER);

    // load the pictures and the font, and wait until each one is ready
    backgroundImg = await loadImage("assets/background-game.png");
    titleImg = await loadImage("assets/title-game.png");
    arrowLeftImg = await loadImage("assets/arrow-left.png");
    arrowRightImg = await loadImage("assets/arrow-right.png");
    playImg = await loadImage("assets/play-button.png");
    cactusImg = await loadImage("assets/cactus.png");
    pixelFont = await loadFont("assets/PressStart2P-Regular.ttf");

    // skins, in the order the arrows go through them
    skins.push(await loadImage("assets/finn.png"));
    skins.push(await loadImage("assets/jake.png"));
    skins.push(await loadImage("assets/cowboy-frog.png"));
    skins.push(await loadImage("assets/capybara.png"));
}

// draw() now only decides which screen to show
function draw(){
        // keep the button text in sync with the real connection
    if (!port.opened()) {
        connectBtn.html("Connect to Arduino");
    } else {
        connectBtn.html("Disconnect");
    }
    if(gameState === "home"){
        drawHomeScreen();
    } else if(gameState === "playing"){
        playGame();
    }
}

// start (or restart) a game with the selected skin
function startGame(){
    player = new Player(0.8, 150, 440, skins[skinIndex]);
    gravity = createVector(0, 0.3 * player.mass);   // pulls down
    enemies = [];                    // no enemies left from the last game
    nextSpawn = frameCount + 90;     // first cactus 1.5 seconds after start
    gameState = "playing";
}

// everything that used to be in draw(): one frame of the game
function playGame(){
    // background (centered, because of imageMode(CENTER))
    image(backgroundImg, width / 2, height / 2, width, height);

    // moving floor, drawn on top of the background's ground band
    drawFloor();

    // gravity always pulls the player down
    player.applyForce(gravity);

    // ----- microphone (serial code added by Thomas in class) -----

    // read every message that arrived since the last frame, keep only the newest
    let str = port.readUntil("\n");
    while(str != null && str != ""){
        // remove extra characters: "12   " -> "12"
        str = str.trim();
        if(str != ""){
            // text -> whole number
            microValue = parseInt(str, 10);
        }
        str = port.readUntil("\n");
    }

    // turn the mic value into an upward force: 0-30 -> 0 to -3 (negative = up)
    let normalizedMic = map(microValue, 0, 30, 0, -3, true);
    player.applyForce(createVector(0, normalizedMic));

    // ---------------------------------------------------------------

    player.update();
    player.checkEdges(groundY);
    player.display();

    // spawn a new cactus when it's time
    if(frameCount >= nextSpawn){
        // picture, width, height, y (center sits half a cactus above the ground), extra speed
        enemies.push(new Enemy(cactusImg, 40, 48, groundY - 48 / 2, 0));
        scheduleSpawn();
    }

    // move, draw and check each enemy
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.display();

        if(enemy.checkCollision(player, true)){
            gameState = "home";   // for now: back to the home screen (death screen comes next)
        }

        if(enemy.isOutOfMap() === true){
            enemies.splice(index, 1);
        }
    });
}

// choose when the next enemy appears, between 1 and 3 seconds from now
function scheduleSpawn(){
    nextSpawn = frameCount + floor(random(60, 180));
}

// clicks on the home screen
function mousePressed(){
    if(gameState === "home"){
        // left arrow: previous skin
        if(isMouseOver(250, 290, 50, 50)){
            skinIndex = skinIndex - 1;
            if(skinIndex < 0){
                skinIndex = skins.length - 1;   // before the first → go to the last
            }
        }

        // right arrow: next skin
        if(isMouseOver(470, 290, 50, 50)){
            skinIndex = skinIndex + 1;
            if(skinIndex >= skins.length){
                skinIndex = 0;                  // after the last → go back to the first
            }
        }

        // play button
        if(isMouseOver(360, 410, 110, 49)){
            startGame();
        }
    }
}

// is the mouse inside a rectangle centered on x, y, of size w × h?
function isMouseOver(x, y, w, h){
    return abs(mouseX - x) < w / 2 && abs(mouseY - y) < h / 2;
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open(9600);
  } else {
    port.close();
  }
}
/*
  MAIN FILE (script.js)
  ---------------------
  This is the "boss" file of the game. It:
  - loads all the pictures and the font
  - connects to the Arduino and reads the microphone
  - decides which screen to show (home, playing or dead)
  - runs the game: moves the player, creates the enemies, checks collisions,
    counts the score and the high score
  - handles the mouse clicks and the keyboard

  The other files contain the pieces it uses:
  player.js (the player), enemies.js (the enemies) and screen.js (the screens).

  Based on the "runner" demo by Thomas:
  https://github.com/methio/MITID-p5-template/tree/main/demo-games/runner
  - From Thomas: the general structure (setup/draw, gravity, spawning enemies
    at random moments, the enemy loop) and the Arduino serial connection code
  - Added for this game (with the help of Claude, an AI assistant): the screens
    and game states, the skins, the enemy types, the score and high score
*/


/* ================================================================
   VARIABLES
   ================================================================
   These variables are created outside of any function, so every
   function in every file can use them.
*/

// ----- pictures and font -----
// Empty for now: they're filled in setup(), once each file has loaded.
let backgroundImg;
let titleImg;
let arrowLeftImg;
let arrowRightImg;
let playImg;
let cactusImg;
let spinningShrimpImg;   // spinning shrimp picture
let shootingShrimpImg;   // shooting shrimp picture
let bubbleImg;           // bubble picture
let deathSignImg;
let trophyImg;           // trophy for the new high score
let pixelFont;           // the Press Start 2P pixel font

// ----- skins -----
let skins = [];       // list of the 4 skin pictures
let skinIndex = 0;    // which skin is selected (0 = first in the list)

// ----- game -----
let gameState = "home";   // which screen we're on: "home", "playing" or "dead"

let player;           // the player (created at the start of each game)
let gravity;          // the force pulling the player down

let groundY = 490;    // height of the ground on the background
let gameSpeed = 5;    // speed of the ground, in pixels per frame

let enemies = [];     // list of all enemies (and bubbles) currently on screen
let nextSpawn = 0;    // frame number when the next enemy will appear

let score = 0;               // goes up while the player survives
let highscore = 0;           // best score so far
                             // (it goes back to 0 if the page is refreshed)
let isNewHighscore = false;  // true if the last game beat the high score

// ----- Arduino (serial code added by Thomas in class) -----
let port;             // the connection with the Arduino, through the USB cable
let connectBtn;       // the "Connect to Arduino" button under the game
let microValue = 0;   // the latest mic value received from the Arduino


/* ================================================================
   SETUP
   ================================================================
   Runs only once, when the page opens.
   It creates the canvas, prepares the connection with the Arduino,
   and loads all the pictures and the font.

   With p5 version 2, files are loaded with "await": it means
   "wait here until this file is ready, then continue". That's why
   setup() starts with "async": a function using "await" needs it.
*/
async function setup(){
    createCanvas(720, 512);   // same size as the background picture

    // Arduino connection (serial code added by Thomas in class)
    port = createSerial();                              // prepare the connection
    connectBtn = createButton("Connect to Arduino");    // add a button under the game
    connectBtn.mousePressed(connectBtnClick);           // clicking it runs connectBtnClick()

    // If the Arduino was already connected before, reconnect automatically
    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
        port.open(usedPorts[0], 9600);
    }

    // Pictures are positioned by their center, not by their top-left corner.
    // This matches the hitboxes in enemies.js, which also use the center.
    imageMode(CENTER);

    // Load the pictures and the font, and wait until each one is ready
    backgroundImg = await loadImage("assets/background-game.png");
    titleImg = await loadImage("assets/title-game.png");
    arrowLeftImg = await loadImage("assets/arrow-left.png");
    arrowRightImg = await loadImage("assets/arrow-right.png");
    playImg = await loadImage("assets/play-button.png");
    cactusImg = await loadImage("assets/cactus.png");
    spinningShrimpImg = await loadImage("assets/spinning-shrimp.png");
    shootingShrimpImg = await loadImage("assets/shooting-shrimp.png");
    bubbleImg = await loadImage("assets/bubble.png");
    deathSignImg = await loadImage("assets/death-sign.png");
    trophyImg = await loadImage("assets/trophy-icon.png");
    pixelFont = await loadFont("assets/PressStart2P-Regular.ttf");

    // Skins: each one is added to the list with push().
    // The order here is the order the arrows go through them on the home screen.
    skins.push(await loadImage("assets/finn.png"));
    skins.push(await loadImage("assets/jake.png"));
    skins.push(await loadImage("assets/cowboy-frog.png"));
    skins.push(await loadImage("assets/capybara.png"));
}


/* ================================================================
   DRAW
   ================================================================
   Runs about 60 times per second, as long as the page is open.
   Each run draws one image on screen, like the frames of a cartoon.

   It only decides which screen to show, depending on gameState:
   - "home"    → the home screen
   - "playing" → one frame of the game
   - "dead"    → the death screen
*/
function draw(){
    // Keep the button text in sync with the real connection.
    // "!" means "not": "!port.opened()" = "the port is not open".
    if (!port.opened()) {
        connectBtn.html("Connect to Arduino");
    } else {
        connectBtn.html("Disconnect");
    }

    if(gameState === "home"){
        drawHomeScreen();
    } else if(gameState === "playing"){
        playGame();
    } else if(gameState === "dead"){
        drawDeathScreen();
    }
}


/* ================================================================
   START GAME
   ================================================================
   Called when the PLAY button is clicked (see mousePressed()).
   It sets everything up for a fresh game: a new player with the
   selected skin, no enemies, a score of 0, and a short break
   before the first enemy appears.
*/
function startGame(){
    player = new Player(0.8, 150, 440, skins[skinIndex]);   // mass, x, y, skin picture
    gravity = createVector(0, 0.3 * player.mass);   // pulls down (positive y = down)
    enemies = [];                    // no enemies left from the last game
    nextSpawn = frameCount + 90;     // first enemy 1.5 seconds after start (60 frames = 1 second)
    score = 0;                       // fresh score for each game
    gameState = "playing";           // switch to the game screen
}


/* ================================================================
   END GAME
   ================================================================
   Called when the player gets hit by an enemy.
   It checks if the score beats the high score, then switches
   to the death screen.

   The check at the start is a safety: if two enemies hit the player
   in the same frame, endGame() would run twice. The second time,
   the score would equal the high score instead of beating it, and
   the "new high score" would be wrongly cancelled. So if we're
   already dead, "return" stops the function right away.
*/
function endGame(){
    // if we're already dead (two enemies hit at once), do nothing
    if(gameState != "playing"){
        return;
    }

    // compare with the high score
    if(score > highscore){
        highscore = score;          // the new best score
        isNewHighscore = true;      // the death screen will show the trophy
    } else {
        isNewHighscore = false;     // normal death screen
    }

    gameState = "dead";             // switch to the death screen
}


/* ================================================================
   PLAY GAME
   ================================================================
   One frame of the game, called by draw() about 60 times per second.
   The order matters: things drawn later appear on top of things
   drawn earlier.
   1. background and floor
   2. score goes up
   3. forces on the player (gravity + scream), then move and draw it
   4. create new enemies when it's time
   5. move, draw and check every enemy
   6. score at the top, drawn last so it's on top of everything
*/
function playGame(){
    // Background (centered, because of imageMode(CENTER))
    image(backgroundImg, width / 2, height / 2, width, height);

    // Moving floor, drawn on top of the background's ground band (see screen.js)
    drawFloor();

    // The score goes up by 1 each frame the player survives (about 60 points per second)
    score = score + 1;

    // Gravity always pulls the player down
    player.applyForce(gravity);

    // ----- microphone (serial code added by Thomas in class) -----
    // The Arduino sends the mic level as text, one value per line (for example "12").
    // Several values may have arrived since the last frame: we read them all
    // and only keep the newest, so the game always reacts to the latest sound.

    let str = port.readUntil("\n");           // read one value, up to the line break
    while(str != null && str != ""){          // as long as there are values waiting
        // remove extra characters: "12   " -> "12"
        str = str.trim();
        if(str != ""){
            // text -> whole number ("12" -> 12), so we can do math with it
            microValue = parseInt(str, 10);
        }
        str = port.readUntil("\n");           // read the next one
    }

    // Turn the mic value into an upward force.
    // map() converts a number from one range to another: a mic value from 0 to 120
    // becomes a force from 0 to -0.75. Negative = up. The "true" at the end stops
    // the force from going past -0.75, even if the scream goes above 120.
    let normalizedMic = map(microValue, 0, 120, 0, -0.75, true);
    // console.log(microValue);   // TEST: shows the mic value in the console
    player.applyForce(createVector(0, normalizedMic));

    // ---------------------------------------------------------------

    // Move the player, keep it between the ground and the top, then draw it
    player.update();
    player.checkEdges(groundY);
    player.display();

    // Create a random enemy when it's time, then choose when the next one comes.
    // frameCount is a p5 variable that counts how many frames have passed.
    if(frameCount >= nextSpawn){
        spawnEnemy();
        scheduleSpawn();
    }

    // Go through every enemy in the list, one by one
    enemies.forEach((enemy, index) => {
        enemy.update();     // move it
        enemy.display();    // draw it

        // The shooting shrimp spits a bubble when its timer says so.
        // A bubble is just another enemy, added to the same list, so it moves,
        // gets drawn and kills the player like any other enemy.
        if(enemy.wantsToShoot()){
            // type, picture, width, height, y (at the shrimp's mouth), extra speed (faster than the shrimp)
            let bubble = new Enemy("bubble", bubbleImg, 16, 16, enemy.y - 5, 4);
            bubble.x = enemy.x - enemy.w / 2;   // the bubble starts at the shrimp's left side
            enemies.push(bubble);
        }

        // If the enemy touches the player, the game ends.
        // (The "true" shows the hitboxes on screen; "false" hides them.)
        if(enemy.checkCollision(player, true)){
            endGame();   // checks the high score, then shows the death screen
        }

        // If the enemy has left the screen, remove it from the list
        if(enemy.isOutOfMap() === true){
            enemies.splice(index, 1);
        }
    });

    // Score and high score at the top, drawn last so they're on top of everything (see screen.js)
    drawHUD();
}


/* ================================================================
   SPAWN ENEMY
   ================================================================
   Creates one random enemy and adds it to the list.
   random(1) gives a number between 0 and 1, which works like a dice roll:
   - below 0.4         → cactus (40% of the time)
   - between 0.4 and 0.7 → spinning shrimp (30%)
   - above 0.7         → shooting shrimp (30%)
   Changing 0.4 and 0.7 makes some enemies more or less common.
*/
function spawnEnemy(){
    let r = random(1);   // random number between 0 and 1

    if(r < 0.4){
        // cactus: on the ground, moves with the floor (extra speed 0).
        // groundY - 48 / 2 puts its center half a cactus above the ground, so it stands on it.
        enemies.push(new Enemy("cactus", cactusImg, 40, 48, groundY - 48 / 2, 0));
    } else if(r < 0.7){
        // spinning shrimp: in the air at a random height, a bit faster than the floor
        let flyingY = random(250, 400);
        enemies.push(new Enemy("spinning", spinningShrimpImg, 33, 50, flyingY, 1));
    } else {
        // shooting shrimp: on the ground, moves with the floor
        enemies.push(new Enemy("shooting", shootingShrimpImg, 42, 50, groundY - 50 / 2, 0));
    }
}


/* ================================================================
   SCHEDULE SPAWN
   ================================================================
   Chooses when the next enemy will appear: between 60 and 180 frames
   from now (1 to 3 seconds). The random wait makes the game less
   predictable. floor() removes the decimals (2.7 → 2).
*/
function scheduleSpawn(){
    nextSpawn = frameCount + floor(random(60, 180));
}


/* ================================================================
   MOUSE PRESSED
   ================================================================
   A special p5 function that runs once each time the mouse is clicked.
   It only does something on the home screen: it checks if the click
   is on the left arrow, the right arrow or the PLAY button.

   The positions here must match the ones in drawHomeScreen() (screen.js).
*/
function mousePressed(){
    if(gameState === "home"){
        // Left arrow: previous skin
        if(isMouseOver(250, 290, 50, 50)){
            skinIndex = skinIndex - 1;
            if(skinIndex < 0){
                skinIndex = skins.length - 1;   // before the first → go to the last
            }
        }

        // Right arrow: next skin
        // (skins.length = how many skins are in the list, so 4)
        if(isMouseOver(470, 290, 50, 50)){
            skinIndex = skinIndex + 1;
            if(skinIndex >= skins.length){
                skinIndex = 0;                  // after the last → go back to the first
            }
        }

        // PLAY button: start a game
        if(isMouseOver(360, 410, 110, 49)){
            startGame();
        }
    }
}


/* ================================================================
   KEY PRESSED
   ================================================================
   A special p5 function that runs once each time a key is pressed.
   On the death screen, pressing A goes back to the home screen.
   "||" means "or": it works with "a" or "A", even with Caps Lock on.
*/
function keyPressed(){
    if(gameState === "dead"){
        if(key === "a" || key === "A"){
            gameState = "home";
        }
    }
}


/* ================================================================
   IS MOUSE OVER
   ================================================================
   Checks if the mouse is inside a rectangle (a button) centered on x, y,
   of size w × h. Returns true or false.
   mouseX and mouseY are p5 variables holding the mouse position.
   It works like the collision check: the mouse is inside if it's closer
   to the center than half the width sideways, AND half the height up/down.
*/
function isMouseOver(x, y, w, h){
    return abs(mouseX - x) < w / 2 && abs(mouseY - y) < h / 2;
}


/* ================================================================
   CONNECT BUTTON CLICK
   ================================================================
   Runs when the "Connect to Arduino" button is clicked.
   If the Arduino isn't connected, it opens the connection
   (Chrome then shows a list of ports to choose from).
   If it's already connected, it closes the connection.
   9600 is the speed, and must match Serial.begin(9600) in the Arduino code.
*/
function connectBtnClick() {
  if (!port.opened()) {
    port.open(9600);
  } else {
    port.close();
  }
}
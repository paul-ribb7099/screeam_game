// Based on the "runner" demo by Thomas (my copy of his MITID-p5-template):
// https://github.com/paul-ribb7099/MITID-p5-template/tree/main/demo-games/runner

let backgroundImg;
let finnImg;

let player;
let gravity;
let lift;
let screaming = false;  // true while the player is "screaming" (space held for now)

let groundY = 490;  // height of the ground on the background

let port;  // serial port object
let connectBtn;
let microValue = 0;

// p5 version 2: files are loaded in setup with async/await (no more preload)
async function setup(){
    createCanvas(720, 512);

    // port setup
    port = createSerial();
    connectBtn = createButton("Connect to Arduino");
    connectBtn.mousePressed(connectBtnClick);

    // if port previously used, open it. 
    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
        port.open(usedPorts[0], 9600);
    }

    imageMode(CENTER);

    // load the pictures, and wait until each one is ready
    backgroundImg = await loadImage("assets/background-game.png");
    finnImg = await loadImage("assets/finn.png");

    // create the player once Finn's picture is loaded
    player = new Player(0.8, 150, 440, finnImg);
    gravity = createVector(0, 0.3 * player.mass);   // pulls down
}

function draw(){
    // background (centered, because of imageMode(CENTER))
    image(backgroundImg, width / 2, height / 2, width, height);

    // gravity always pulls the player down
    player.applyForce(gravity);

    // on ecoute les infos qui arrivent du port serie
    let str = port.readUntil("\n");
    if(str != null && str != ""){
        // on enleve les caracteres parasites: "12   " -> "12"
        str = str.trim();
        // on convertit la valeur en nombre entier: string -> nombre entier
        let micValue = parseInt(str, 10);
        // on traduit la valeur en une valeur acceptable pour un vecteur de force: 0-30 -> 0-(-4) -4 car on va vers le haut
        let normalizedMic = map(micValue, 0, 30, 0, -4);
        // on applique la force au joueur
        player.applyForce(createVector(0, normalizedMic));
    }

    player.update();
    player.checkEdges(groundY);
    player.display();


    
}
//--------------------------------------------------------------
// For testing purposes:
// space pressed → start screaming
/*
function keyPressed(){
    if(key === ' '){
        screaming = true;
    }
}

// space released → stop screaming
function keyReleased(){
    if(key === ' '){
        screaming = false;
    }
}


*/

function connectBtnClick() {
  if (connectBtn.html() != "Disconnect") {
    port.open("Arduino", 9600);
    connectBtn.html("Disconnect");
    //connectBtn.hide();
  } else {
    port.close();
    connectBtn.html("Connect to Arduino");
  }
}

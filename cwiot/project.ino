/*
  ARDUINO CODE: MICROPHONE
  ------------------------
  In all transparency, the Arduino code has been completely written by Thomas.
  Nonetheless, I will provide a brief explanation of the code.

  This code runs on the Arduino UNO. It reads the microphone, works out
  how loud the sound is, and sends that number to the computer through
  the USB cable. The game (script.js) reads these numbers and uses them
  to push the player up: the louder the scream, the higher the player goes.
*/

// "sum" adds up several mic readings, "moyenne" (average in French) holds their average.
// "int" means these variables hold whole numbers (nombres entiers in French).
int sum = 0;
int moyenne = 0;

/*
  SETUP
  Runs only once, when the Arduino gets power.
  It starts the USB connection with the computer at a speed of 9600.
  This speed must be the same as in the game (port.open(9600) in script.js),
  otherwise the two sides wouldn't understand each other.
*/
void setup() {
  Serial.begin(9600);
}

/*
  LOOP
  Runs again and again, as long as the Arduino has power.

  Sound is a wave: the mic's signal goes up and down very quickly.
  So one single reading could land on a high point or a low point by chance.
  To get a stable "how loud is it right now" value, the code reads the mic
  several times, then calculates the average of those readings.
  It then sends that average to the computer, and starts again.
*/
void loop() {
  // Read the mic several times and add up the readings.
  // i starts at 0 and goes up by 1 (i++) as long as it's 10 or less,
  // so the readings are repeated 11 times.
  for(int i = 0; i <= 10; i++){
    sum += analogRead(A0);    // read the mic's voltage on pin A0 (a number from 0 to 1023)
                              // and add it to sum ("+=" means sum = sum + ...)
    //Serial.println(sum);    // test line, turned off
    delay(50);                // wait 50 milliseconds between two readings
  }

  // Average of the readings (the total divided by 10)
  moyenne = sum / 10;

  // Send the average to the computer, followed by a line break.
  // The game reads each value up to that line break, with port.readUntil("\n").
  Serial.println(moyenne);

  // Empty both variables, so the next round starts from 0
  moyenne = 0;
  sum = 0;
  delay(10);   // short pause before starting again
}
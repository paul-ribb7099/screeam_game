/* In all transparency, the arduino code has been completely written by Thomas.
Nonetheless, I will provide A brief explanation of the code.
*/
int sum = 0;
int moyenne = 0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  for(int i = 0; i <= 10; i++){
    sum += analogRead(A0);
    //Serial.println(sum);
    delay(50);
  }

  moyenne = sum / 10;

  Serial.println(moyenne);

  moyenne = 0;
  sum = 0;
  delay(10);
}

// Single-servo 90-degree calibration sketch
// Change SERVO_PIN to calibrate each servo one at a time
// Pin 4 = Servo 1 (base), Pin 5 = Servo 2, Pin 6 = Servo 3, Pin 7 = Servo 4 (gripper)

#include <Servo.h>

#define SERVO_PIN 4

Servo myservo;

void setup() {
  Serial.begin(9600);
  Serial.print("Attaching servo on pin 4");
  Serial.println(SERVO_PIN);

  myservo.attach(SERVO_PIN);
  delay(500);
  myservo.write(90);
  delay(500);

  Serial.println("Servo set to 90 degrees.");
}

void loop() {
  // Keep sending PWM signal by re-writing every 2 seconds
  myservo.write(90);
  delay(2000);
}

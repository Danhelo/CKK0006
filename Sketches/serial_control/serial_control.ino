/*
 * Serial Control sketch for CKK0006 Cokoino Robotic Arm
 *
 * Replaces joystick input with serial command parsing.
 * Uses CokoinoArm for servo attach/read, but implements our own
 * movement function (moveServos) with oscillation fix and early exit.
 *
 * Serial protocol (9600 baud):
 *   MOVE,s1,s2,s3,s4,speed\n  — move servos to target angles at given speed
 *   READ\n                     — report current servo angles
 *   PING\n                     — health check
 *
 * Responses:
 *   READY\n                    — sent on boot
 *   ACK,a1,a2,a3,a4\n         — current angles (after MOVE or READ)
 *   DONE\n                     — movement complete (after MOVE)
 *   PONG\n                     — health check response
 *   ERR,reason\n               — error response
 */

#include "src/CokoinoArm.h"

#define buzzerPin 9
#define ANGLE_MIN 10
#define ANGLE_MAX 170

CokoinoArm arm;

// Clamp angle to safe mechanical range
int clampAngle(int a) {
  if (a < ANGLE_MIN) return ANGLE_MIN;
  if (a > ANGLE_MAX) return ANGLE_MAX;
  return a;
}

// Send the current angles of all 4 servos as ACK,a1,a2,a3,a4
void sendAngles() {
  Serial.print("ACK,");
  Serial.print(arm.servo1.read());
  Serial.print(",");
  Serial.print(arm.servo2.read());
  Serial.print(",");
  Serial.print(arm.servo3.read());
  Serial.print(",");
  Serial.println(arm.servo4.read());
}

// Our movement function — fixes from CokoinoArm::do_action:
//   1. No oscillation when target == current (holds still)
//   2. Early exit when all servos reach target
//   3. Angle clamping to safe range
void moveServos(int target[4], int speed) {
  CokoinoServo *servos[4] = {&arm.servo1, &arm.servo2, &arm.servo3, &arm.servo4};
  int S[4];
  int T[4];
  for (int i = 0; i < 4; i++) {
    T[i] = clampAngle(target[i]);
    S[i] = servos[i]->read();
  }
  int count = 0;
  do {
    int doneCount = 0;
    for (int i = 0; i < 4; i++) {
      if (T[i] > S[i]) {
        S[i]++;
      } else if (T[i] < S[i]) {
        S[i]--;
      } else {
        doneCount++;
      }
      servos[i]->write(S[i]);
    }
    count++;
    delay(speed);
    if (doneCount == 4) break;
  } while (count < 180);
  delay(speed * 20);
}

void setup() {
  Serial.begin(9600);
  arm.ServoAttach(4, 5, 6, 7);
  pinMode(buzzerPin, OUTPUT);
  Serial.println("READY");
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();

    if (line.length() == 0) {
      return; // ignore empty lines
    }

    if (line.startsWith("MOVE,")) {
      // Parse: MOVE,s1,s2,s3,s4,speed
      String params = line.substring(5); // everything after "MOVE,"

      int idx1 = params.indexOf(',');
      int idx2 = params.indexOf(',', idx1 + 1);
      int idx3 = params.indexOf(',', idx2 + 1);
      int idx4 = params.indexOf(',', idx3 + 1);

      if (idx1 == -1 || idx2 == -1 || idx3 == -1 || idx4 == -1) {
        Serial.println("ERR,BAD_MOVE_FORMAT");
        return;
      }

      int target[4];
      target[0] = params.substring(0, idx1).toInt();
      target[1] = params.substring(idx1 + 1, idx2).toInt();
      target[2] = params.substring(idx2 + 1, idx3).toInt();
      target[3] = params.substring(idx3 + 1, idx4).toInt();
      int speed  = params.substring(idx4 + 1).toInt();

      // Validate speed
      if (speed < 1) speed = 1;
      if (speed > 50) speed = 50;

      // Acknowledge with current angles before moving
      sendAngles();

      // Execute movement with our fixed function
      moveServos(target, speed);

      // Signal completion
      Serial.println("DONE");

    } else if (line == "READ") {
      sendAngles();

    } else if (line == "PING") {
      Serial.println("PONG");

    } else {
      Serial.print("ERR,UNKNOWN_CMD:");
      Serial.println(line);
    }
  }
}

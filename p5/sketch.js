let socket;
let gazeX = 0;
let gazeY = 0;
let smoothGazeX = 0;
let smoothGazeY = 0;
let prevGazeX = 0;
let prevGazeY = 0;

let calibrationSteps = ['center', 'left', 'right', 'up', 'down'];
let currentCalibrationStep = 0;
let calibrated = false;
let calibrationData = {};
let currentPitch = 0;
let currentYaw = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);


  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = function(event) {
    console.log('WebSocket is open now.');
  };

  socket.onmessage = function(event) {
    let data = JSON.parse(event.data);


    currentYaw = data.yaw;
    currentPitch = data.pitch;
  };

  socket.onclose = function(event) {
    console.log('WebSocket is closed now.');
  };
}

function draw() {
  background(220);

  if (currentCalibrationStep < calibrationSteps.length) {
    // Calibration mode
    let step = calibrationSteps[currentCalibrationStep];
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('Calibration Step: ' + step, width / 2, height / 2 - 50);
    text('Look at the target and click', width / 2, height / 2 - 20);

    drawCalibrationTarget(step);
  } else if (calibrated) {
    // Tracking mode


    let yawMin = Math.min(calibrationData['left'].yaw, calibrationData['right'].yaw);
    let yawMax = Math.max(calibrationData['left'].yaw, calibrationData['right'].yaw);
    let pitchMin = Math.min(calibrationData['up'].pitch, calibrationData['down'].pitch);
    let pitchMax = Math.max(calibrationData['up'].pitch, calibrationData['down'].pitch);

    gazeX = map(currentYaw, calibrationData['left'].yaw, calibrationData['right'].yaw, 0, width);
    gazeY = map(currentPitch, calibrationData['up'].pitch, calibrationData['down'].pitch, 0, height);


    gazeX = constrain(gazeX, 0, width);
    gazeY = constrain(gazeY, 0, height);


    smoothGazeX = lerp(prevGazeX, gazeX, 0.2);
    smoothGazeY = lerp(prevGazeY, gazeY, 0.2);

    prevGazeX = smoothGazeX;
    prevGazeY = smoothGazeY;


    fill(255, 0, 0);
    ellipse(smoothGazeX, smoothGazeY, 50, 50);
  } else {
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('Calibration complete. Waiting for data...', width / 2, height / 2);
  }
}

function drawCalibrationTarget(step) {
  fill(0, 0, 255);
  let targetSize = 50;
  let x, y;

  if (step === 'center') {
    x = width / 2;
    y = height / 2;
  } else if (step === 'left') {
    x = width * 0.1; 
    y = height / 2;
  } else if (step === 'right') {
    x = width * 0.9; 
    y = height / 2;
  } else if (step === 'up') {
    x = width / 2;
    y = height * 0.1; 
  } else if (step === 'down') {
    x = width / 2;
    y = height * 0.9;
  }

  ellipse(x, y, targetSize, targetSize);
}

function mousePressed() {
  if (currentCalibrationStep < calibrationSteps.length) {
    let step = calibrationSteps[currentCalibrationStep];
    calibrationData[step] = {
      pitch: currentPitch,
      yaw: currentYaw
    };
    console.log('Calibrated ' + step + ':', calibrationData[step]);

    currentCalibrationStep++;

    if (currentCalibrationStep === calibrationSteps.length) {
      calibrated = true;
      console.log('Calibration complete.');
    }
  }
}

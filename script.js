let lines = [];
let animationIndex = 0;
let animating = false;
let video;
let handPose;
let hands = [];
let time = 0;
let labels = ["World", "Web", "Wide"];
let showWebcam = false; 
let webcamX, webcamY; 
let labelPositions = []; 

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(1280, 960);

  const button = select("#startButton");
  button.mousePressed(startAnimation);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  background(220);
  textSize(50);
  textAlign(CENTER, CENTER);
  textFont("Fira Code");
}

function startAnimation() {
  background(220); 
  lines = []; 
  labelPositions = []; 
  animationIndex = 0;
  animating = true;

  let centerX = width / 2;
  let centerY = height / 2;
  let numLines = 50; 

  for (let i = 0; i < numLines; i++) {
    let angle = random(TWO_PI);
    let radius = random(40, min(width, height) / 2 - 10);
    let xRadius = random(40, width / 2 - 10);

    let x1 = centerX;
    let y1 = centerY;
    let x2 = centerX + cos(angle) * xRadius;
    let y2 = centerY + sin(angle) * radius;

    lines.push({ x1, y1, x2, y2 });


    labelPositions.push({ label: labels[0], x: x1, y: y1 });
    labelPositions.push({ label: labels[1], x: x2, y: y2 });
    labelPositions.push({ label: labels[2], x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
  }

 
  webcamX = random(width - width / 4);
  webcamY = random(height - height / 4);
}

function draw() {
  if (animating && animationIndex < lines.length) {
    let l = lines[animationIndex];


    let colorChance = random(1);
    if (colorChance < 0.8) {
      stroke(0); 
    } else if (colorChance < 0.9) {
      stroke(69, 42, 97);
    } else {
      stroke(62, 91, 152); 
    }

    strokeWeight(random(1, 2, 3));
    line(l.x1, l.y1, l.x2, l.y2);

    let midX = (l.x1 + l.x2) / 2;
    let midY = (l.y1 + l.y2) / 2;

    // 텍스트 색상도 랜덤 설정
    let labelColorChance = random(1);
    let labelColor;
    if (labelColorChance < 0.8) {
      labelColor = color(0);
    } else if (labelColorChance < 0.9) {
      labelColor = color(69, 42, 97);
    } else {
      labelColor = color(62, 91, 152);
    }
    
    fill(labelColor); // 랜덤 텍스트 색상 적용
    textSize(24);
    text(labels[0], l.x1, l.y1 - 5); 
    text(labels[1], l.x2, l.y2 - 5); 
    text(labels[2], midX, midY - 5);

    animationIndex++;
  } else if (animationIndex >= lines.length) {
    animating = false;
  }

 
  if (showWebcam) {
    let webcamWidth = width / 4;
    let webcamHeight = (video.height / video.width) * webcamWidth;
    image(video, webcamX, webcamY, webcamWidth, webcamHeight);

    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let keypoints = hand.keypoints;
      drawSpiderweb(keypoints, webcamX, webcamY, webcamWidth, webcamHeight);
    }
  }
}


function gotHands(results) {
  hands = results;
}

function drawSpiderweb(keypoints, offsetX, offsetY, areaWidth, areaHeight) {
  noFill();
  let centerX = offsetX + areaWidth / 2;
  let centerY = offsetY + areaHeight / 2;

  let maxRadius = areaWidth / 4;
  let numRings = 6;
  let numLines = keypoints.length;
  let alpha = map(sin(time), -1, 1, 100, 200);
  stroke(255, alpha);


  for (let i = 0; i < numLines; i++) {
    for (let j = i + 1; j < numLines; j++) {
      let start = keypoints[i];
      let end = keypoints[j];
      if (start && end) {
        strokeWeight(0.3); 
        line(start.x + offsetX, start.y + offsetY, end.x + offsetX, end.y + offsetY);
      }
    }
  }

  
  for (let i = 0; i < numLines; i++) {
    let point = keypoints[i];
    if (point) {
      strokeWeight(0.3); 
      line(centerX, centerY, point.x + offsetX, point.y + offsetY);
    }
  }

  time += 0.05;
}


function mousePressed() {
  for (let pos of labelPositions) {
 
    textSize(24);
    let textWidthValue = textWidth(pos.label); 
    let textHeightValue = textSize(); 

    let leftBound = pos.x - textWidthValue / 2; 
    let rightBound = pos.x + textWidthValue / 2; 
    let topBound = pos.y - textHeightValue / 2; 
    let bottomBound = pos.y + textHeightValue / 2; 

    if (
      mouseX >= leftBound &&
      mouseX <= rightBound &&
      mouseY >= topBound &&
      mouseY <= bottomBound
    ) {
      showWebcam = true;
      webcamX = random(width - width / 4);
      webcamY = random(height - height / 4);
      break;
    }
  }
}

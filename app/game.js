function updateGameDisplay(gameState) {
  let doc = document;

  let roundPointsElem = doc.getElementById("roundpoints");
  let roundPointsLogoElem = doc.getElementById("roundpointslogo");
  if (gameState.pointsRound === 0) {
    roundPointsElem.style.display = "none";
    roundPointsLogoElem.hidden = false;
  } else {
    roundPointsElem.textContent = gameState.pointsRound;
    roundPointsElem.style.display = "flex";
    roundPointsLogoElem.hidden = true;
  }

  doc.getElementById("teamAlabel").textContent = gameState.teams.a;
  doc.getElementById("teamApoints").textContent = gameState.pointsA;
  doc.getElementById("teamBlabel").textContent = gameState.teams.b;
  doc.getElementById("teamBpoints").textContent = gameState.pointsB;
  doc.getElementById("stagelabel").textContent = gameState.stage;
  doc.getElementById("captionlabel").textContent = gameState.caption;

  /* Delete old answer boxes. */
  doc.getElementById("answercol0").innerHTML = "";
  doc.getElementById("answercol1").innerHTML = "";

  /* Create question and answer boxes. */
  for (let i = 0; i < gameState.answers.length; i++) {
    /* Decide which column to put it in. */
    let a = 0;
    if (i >= gameState.answers.length / 2) a = 1;
    let column = doc.getElementById("answercol" + a);

    if (gameState.answers[i].revealed) {
      /* Create answer box (and stuff inside). */
      let answerBox = doc.createElement("div");
      answerBox.className = "answerbox";
      answerBox.id = "answer" + i;

      let answerBoxLeft = doc.createElement("div");
      answerBoxLeft.className = "answerboxleft";
      /* Fit font size of each answer (line is y = -0.02x + 0.95). */
      let mult = -0.02 * gameState.answers[i].content.length + 0.95;
      if (mult < 0.3) mult = 0.3;
      answerBoxLeft.style.fontSize = mult + "em";
      answerBoxLeft.textContent = gameState.answers[i].content;
      answerBox.appendChild(answerBoxLeft);

      let answerBoxRight = doc.createElement("div");
      answerBoxRight.className = "answerboxright";
      answerBoxRight.id = "answerpoints" + i;
      if (gameState.answers[i].points < 10)
        answerBoxRight.textContent = "0" + gameState.answers[i].points;
      else answerBoxRight.textContent = gameState.answers[i].points;
      answerBox.appendChild(answerBoxRight);

      column.appendChild(answerBox);
    } else {
      /* Create covered answer box */
      let answerCoverBox = doc.createElement("div");
      answerCoverBox.className = "answercoverbox";
      answerCoverBox.id = "question" + i;
      answerCoverBox.textContent = i + 1;
      column.appendChild(answerCoverBox);
    }
  }
}

/* Play the current strike animation graphically (just the animation). */
function playStrike(strikes) {
  let num = strikes + 1;
  if (num < 1) num = 1;

  let buzzer = new Audio("../assets/buzzer.mp3");
  buzzer.play();

  let strike = document.createElement("div");
  strike.className = "strike" + num;
  document.body.appendChild(strike);
  setTimeout(function () {
    strike.remove();
  }, 1000);
}

window.addEventListener("message", (event) => {
  /* If the message indicates, we should play a strike. */
  if (event.data[1]) playStrike(event.data[0].strikes);
  else updateGameDisplay(event.data[0]);
});

/*

Backend interaction stuff.

*/

/* Answer format:
- Num: 1, ...
- Text: String
- Revealed: Bool

Game state format:
- Stage: ["Waiting", "Faceoff", "Faceoff (Steal)", "Faceoff (Decide)", "Guess", "Steal", "Round Over"]
- Strikes: [0, 1, 2, 3]
- Answers: [{Txt, Revealed?, Points}, ...]
- Teams: String array of names
- Team selected: Bool
- Points collected: 0, ... (show family feud logo if it's 0)
- Multiplier: 1x, 2x, 3x
- Team 1 points: 0, ...
- Team 2 points: 0, ...
- Caption: String that describes the current game state
*/
let gameState = {
  stage: "Waiting",
  strikes: 0,
  question: "N/A",
  answers: [],
  teams: { a: "Team A", b: "Team B" },
  teamASelected: true,
  pointsRound: 0,
  multiplier: 1,
  pointsA: 0,
  pointsB: 0,
  caption: "Loading...",
};

let gameWindow;

/* Helper function that gets the currently selected team's name. */
function getSelTeamName() {
  return gameState.teamASelected ? gameState.teams.a : gameState.teams.b;
}

/* Game handling function. Reset the game state to the default. Retains team scores. */
function handleReset() {
  gameState.stage = "Waiting";
  gameState.strikes = 0;
  gameState.question = "N/A";
  gameState.answers = [];
  gameState.teamASelected = true;
  gameState.pointsRound = 0;
  gameState.multiplier = 1;
  gameState.caption = `Waiting for team ${gameState.teams.a} or ${gameState.teams.b} to buzz in.`;
  updateDisplay(gameState);
}

/* Game handling function. Team A buzzes in if TEAM = true (and team B buzzes otherwise) and updates the game state as needed. */
function handleBuzz(team) {
  let teamName = team ? gameState.teams.a : gameState.teams.b;
  console.log(teamName + " buzzing in");

  gameState.teamASelected = team;
  gameState.stage = "Faceoff";
  gameState.caption = teamName + " is guessing the faceoff.";

  updateDisplay(gameState);
}

/* Game handling function. The selected team plays if PLAY = true. */
function handleDecide(play) {
  if (!play) gameState.teamASelected = !gameState.teamASelected;
  console.log(getSelTeamName() + " playing.");

  gameState.stage = "Guess";
  gameState.caption = getSelTeamName() + " is guessing.";

  updateDisplay(gameState);
}

/* Game handling function. Reveals answer i and updates the game state as needed. */
function handleReveal(i) {
  if (i < 0 || i >= gameState.answers.length || gameState.answers[i].revealed) {
    console.error("handleReveal(" + i + ")");
  }

  console.log(getSelTeamName() + " revealing " + i);

  gameState.answers[i].revealed = true;
  playBell();

  if (gameState.stage != "Round Over")
    gameState.pointsRound += gameState.multiplier * gameState.answers[i].points;

  if (gameState.stage === "Faceoff") {
    if (i === 0) {
      /* Opponent's can't steal if the top answer was guessed. Jump right to the "decide" stage. */
      gameState.caption = getSelTeamName() + " is deciding to pass or play.";
      gameState.stage = "Faceoff (Decide)";
    } else {
      /* Otherwise, let them steal. */
      gameState.stage = "Faceoff (Steal)";
      gameState.teamASelected = !gameState.teamASelected;
      gameState.caption = getSelTeamName() + " is trying to steal the faceoff.";
    }
  } else if (gameState.stage === "Faceoff (Steal)") {
    /* Find the revealed answer (should only be one at this point: the last revealed answer). */
    let revealed = -1;
    for (let j = 0; j < gameState.answers.length; j++) {
      if (gameState.answers[j].revealed) {
        revealed = j;
        break;
      }
    }
    if (revealed === -1) {
      console.error("handleReveal(" + i + "): Faceoff (Steal)");
    }

    /* Check if it's above or below the last revealed answer. */
    if (i > revealed) {
      /* Below. The other team will decide to pass or play. */
      gameState.teamASelected = !gameState.teamASelected;
    }
    gameState.caption = getSelTeamName() + " is deciding to pass or play.";
    gameState.stage = "Faceoff (Decide)";
  } else if (gameState.stage === "Guess") {
    /* Count number of revealed answers. */
    let revealedCount = 0;
    for (let j = 0; j < gameState.answers.length; j++)
      if (gameState.answers[j].revealed) revealedCount++;
    console.log(`revealed count: ${revealedCount}`);

    if (revealedCount === gameState.answers.length) {
      /* Current team wins. */
      gameState.stage = "Round Over";
      gameState.caption = getSelTeamName() + " wins the round!";

      /* Add points. */
      if (gameState.teamASelected) gameState.pointsA += gameState.pointsRound;
      else gameState.pointsB += gameState.pointsRound;
      gameState.pointsRound = 0;
    }
  } else if (gameState.stage === "Steal") {
    /* Current team wins. */
    gameState.stage = "Round Over";
    gameState.caption = getSelTeamName() + " wins the round!";

    /* Add points. */
    if (gameState.teamASelected) gameState.pointsA += gameState.pointsRound;
    else gameState.pointsB += gameState.pointsRound;
    gameState.pointsRound = 0;
  } else if (gameState.stage != "Round Over") {
    console.error("handleReveal(" + i + ")");
  }

  updateDisplay(gameState);
}

/* Game handling function. Reveals answer i and updates the game state as needed. */
function handleStrike() {
  console.log("strike #" + gameState.strikes);
  playStrike(gameState);

  if (gameState.stage === "Faceoff") {
    gameState.teamASelected = !gameState.teamASelected;
    gameState.caption = getSelTeamName() + " is guessing the faceoff.";
  } else if (gameState.stage === "Faceoff (Steal)") {
    gameState.teamASelected = !gameState.teamASelected;
    gameState.caption = getSelTeamName() + " is deciding to pass or play.";
    gameState.stage = "Faceoff (Decide)";
  } else if (gameState.stage === "Guess") {
    gameState.strikes++;

    if (gameState.strikes >= 3) {
      gameState.stage = "Steal";
      gameState.strikes = 0;
      gameState.teamASelected = !gameState.teamASelected;
      gameState.caption = getSelTeamName() + " is trying to steal the round.";
    }
  } else if (gameState.stage === "Steal") {
    /* Current team wins. */
    gameState.stage = "Round Over";
    gameState.teamASelected = !gameState.teamASelected;
    gameState.caption = getSelTeamName() + " wins the round!";

    /* Add points. */
    if (gameState.teamASelected) gameState.pointsA += gameState.pointsRound;
    else gameState.pointsB += gameState.pointsRound;
    gameState.pointsRound = 0;
  } else {
    console.error("handleStrike()");
  }

  updateDisplay(gameState);
}

function handleNameChange(team) {
  let id = team ? "controlnameA" : "controlnameB";
  let nameElem = document.getElementById(id);

  if (team) {
    if (nameElem.value === "") gameState.teams.a = "Team A";
    else gameState.teams.a = nameElem.value;
  } else {
    if (nameElem.value === "") gameState.teams.b = "Team B";
    else gameState.teams.b = nameElem.value;
  }

  updateDisplay(gameState);
}

function handleMultiplierChange() {
  let multElem = document.getElementById("controlmultiplier");
  gameState.multiplier = multElem.value;
  updateDisplay(gameState);
}

document
  .getElementById("controlfile")
  .addEventListener("change", handleFile, false);
handleReset();

/* Load file and reset game. */
function handleFile() {
  handleReset();
  gameState.answers = [];

  const fileList = this.files;
  let jsonFile = fileList[0];
  if (fileList[0] === undefined) {
    return;
  }
  let read = new FileReader();
  read.readAsText(jsonFile);
  read.onloadend = function () {
    let jsonAnswers = JSON.parse(read.result).answers;
    let jsonQuestion = JSON.parse(read.result).question;
    for (let i = 0; i < jsonAnswers.length; i++) {
      gameState.answers.push({
        content: jsonAnswers[i].answer.toUpperCase(),
        points: parseInt(jsonAnswers[i].points),
        revealed: false,
      });
    }
    gameState.question = jsonQuestion;
    updateDisplay(gameState);
  };
}

/*

Frontend interaction stuff.

*/

function updateGameDisplay(state) {
  if (!gameWindow) return;

  /* "false" is read as "update the display, don't play a strike". */
  gameWindow.postMessage([state, false], "*");
}

/* Play the current strike animation graphically (just the animation). */
function playStrike(state) {
  if (!gameWindow) return;
  /* "true" is read as "play a strike, don't update the display". */
  gameWindow.postMessage([state, true], "*");
}

function playBell() {
  let bell = new Audio("../assets/bell.mp3");
  bell.play();
}

function openGame() {
  gameWindow = open("game.html");
  /* Let the window's js script run before sending anything. */
  gameWindow.addEventListener("load", (e) => {
    updateDisplay(gameState);
  });
}

/* Update display on control panel and game window (if there is one). */
function updateDisplay(state) {
  let answerDisplay = document.getElementById("displayanswers");
  let answerControl = document.getElementById("controlanswers");
  answerDisplay.innerHTML = "";
  answerControl.innerHTML = "";
  for (let i = 0; i < state.answers.length; i++) {
    /* Add answer label. */
    let answerElem = document.createElement("div");
    answerElem.className = state.answers[i].revealed
      ? "paneltext paneltextshown"
      : "paneltext paneltexthidden";
    answerElem.textContent =
      i + 1 + ". " + state.answers[i].content + " | " + state.answers[i].points;
    answerDisplay.append(answerElem);

    /* Add answer reveal button (if it's not revealed). */
    if (!state.answers[i].revealed) {
      let answerButtonElem = document.createElement("button");
      answerButtonElem.textContent = i + 1 + ". " + state.answers[i].content;
      answerButtonElem.addEventListener("click", () => handleReveal(i));
      answerControl.append(answerButtonElem);
    }
  }

  /* Add buttons based on the stage. */
  let decideControlWrap = document.getElementById("controldecidewrap");
  let buzzControlWrap = document.getElementById("controlbuzzwrap");
  let answerControlWrap = document.getElementById("controlanswerswrap");
  let strikeControlWrap = document.getElementById("controlstrikeswrap");
  if (state.stage === "Waiting") {
    let buzzAElem = document.getElementById("controlbuzzA");
    buzzAElem.textContent = `${state.teams.a} buzz in`;
    let buzzBElem = document.getElementById("controlbuzzB");
    buzzBElem.textContent = `${state.teams.b} buzz in`;

    answerControlWrap.hidden = true;
    strikeControlWrap.hidden = true;
    buzzControlWrap.hidden = false;
    decideControlWrap.hidden = true;
  } else if (state.stage === "Faceoff (Decide)") {
    answerControlWrap.hidden = true;
    strikeControlWrap.hidden = true;
    buzzControlWrap.hidden = true;
    decideControlWrap.hidden = false;
  } else if (state.stage === "Round Over") {
    answerControlWrap.hidden = false;
    strikeControlWrap.hidden = true;
    buzzControlWrap.hidden = true;
    decideControlWrap.hidden = true;
  } else {
    answerControlWrap.hidden = false;
    strikeControlWrap.hidden = false;
    buzzControlWrap.hidden = true;
    decideControlWrap.hidden = true;
  }

  document.getElementById("displayquestion").textContent = state.question;
  document.getElementById("displaypointsround").textContent = state.pointsRound;
  document.getElementById("displaymultiplier").textContent = state.multiplier;
  document.getElementById("displaypointstitleA").textContent = state.teams.a;
  document.getElementById("displaypointstitleB").textContent = state.teams.b;
  document.getElementById("displaypointsA").textContent = state.pointsA;
  document.getElementById("displaypointsB").textContent = state.pointsB;
  document.getElementById("displaystrikes").textContent = state.strikes;
  document.getElementById("displaystage").textContent = state.stage;
  document.getElementById("displaycaption").textContent = state.caption;

  if (gameWindow) updateGameDisplay(state);
}

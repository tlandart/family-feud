let answers = [];
let points = [];
let teamASelected = true; // which team is playing right now
let pointsAddedThisRound = 0; // total points awarded to the currently selected team this round
let strikes = 0; // number of strikes the selected team has this round
let stealing = false; // whether the other team is stealing right now or not
let numRevealed = 0; // number of answers revealed this round so far

// https://stackoverflow.com/questions/16505333/get-the-data-of-uploaded-file-in-javascript
let answerFile = document.getElementById("answerfile");
answerFile.addEventListener('change', handleFile, false);

// place new highlight (on the left)
let highlight = document.createElement("div");
highlight.id = "teamhighlightleft";
let parent = document.getElementById("teamAholder");
parent.appendChild(highlight);

function handleFile() {
    answers = [];
    points = [];

    const fileList = this.files;
    let jsonFile = fileList[0];
    console.log(fileList[0]);
    if(fileList[0] === undefined) {
        newRound();
        return;
    }
    let read = new FileReader();
    read.readAsText(jsonFile);
    read.onloadend = function() {
        let jsonAnswers = JSON.parse(read.result).answers;
        for(let i=0;i<jsonAnswers.length;i++) {
            answers[i] = jsonAnswers[i].answer;
            points[i] = parseInt(jsonAnswers[i].points);
        }
        newRound();
    }
}

function newRound() {
    pointsAddedThisRound = 0;
    strikes = 0;
    stealing = false;
    numRevealed = 0;

    if(teamASelected) teamAselect();
    else teamBselect();
    lightenHighlight();

    // delete all old question and answer boxes
    document.getElementById("answercol0").textContent = '';
    document.getElementById("answercol1").textContent = '';

    // create all question and answer boxes
    for(let i=0; i<answers.length; i++) {
        // i ran into an interesting problem that i want to remember. if we just use the variable "i" in the for loop for creating and assigning events to question boxes, the variable i changes to 8 by the end of the loop, hence making all of the question boxes call the function revealQuestionBox(8) which is not what we want. its better explained here https://forum.freecodecamp.org/t/function-inside-for-loop/195973/4. this is fixed by using "let" instead of "var" which i originally used

        // decide which column to put it in
        let a = 0;
        if(i >= answers.length/2) a = 1;
        let column = document.getElementById("answercol" + a);

        // create question boxes
        let questionBox = document.createElement("div");
        questionBox.className = "questionbox";
        questionBox.id = "question" + i;
        questionBox.textContent = i+1;
        questionBox.onmousedown = function() {clickBox(i)};

        column.appendChild(questionBox);

        // create answer boxes (and stuff inside)
        let answerBox = document.createElement("div");
        answerBox.className = "answerbox";
        answerBox.id = "answer" + i;
        
        let answerBoxLeft = document.createElement("div");
        answerBoxLeft.className = "answerboxleft";
        // fit font size of each answer (line is y = -0.02x + 0.95)
        let mult = -0.02 * answers[i].length + 0.95;
        if(mult < 0.3) mult = 0.3;
        answerBoxLeft.style.fontSize = mult + "em";
        answerBoxLeft.textContent = answers[i];
        answerBox.appendChild(answerBoxLeft);
        answerBox.style.display = "none";
        
        let answerBoxRight = document.createElement("div");
        answerBoxRight.className = "answerboxright";
        answerBoxRight.id = "answerpoints" + i;
        if(points[i] < 10)
            answerBoxRight.textContent = "0" + points[i];
        else
            answerBoxRight.textContent = points[i];
        answerBox.appendChild(answerBoxRight);

        column.appendChild(answerBox);
    }
}

function teamAselect() {
    if(teamASelected == false && numRevealed  < 1) {
        teamASelected = true;
    
        // delete old highlight (on the right)
        document.getElementById("teamhighlightright").remove();
    
        // place new highlight (on the left)
        let highlight = document.createElement("div");
        highlight.id = "teamhighlightleft";
        highlight.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        let parent = document.getElementById("teamAholder");
        parent.appendChild(highlight);
    }
}

function teamBselect() {
    if(teamASelected == true && numRevealed  < 1 && strikes < 1) {
        teamASelected = false;
    
        // delete old highlight (on the left)
        document.getElementById("teamhighlightleft").remove();
    
        // place new highlight (on the right)
        let highlight = document.createElement("div");
        highlight.id = "teamhighlightright";
        highlight.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        let parent = document.getElementById("teamBholder");
        parent.appendChild(highlight);
    }
}

function darkenHighlight() {
    if(teamASelected) {
        let highlight = document.getElementById("teamhighlightleft");
        highlight.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    }
    else {
        let highlight = document.getElementById("teamhighlightright");
        highlight.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    }
}

function lightenHighlight() {
    if(teamASelected) {
        let highlight = document.getElementById("teamhighlightleft");
        highlight.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
    else {
        let highlight = document.getElementById("teamhighlightright");
        highlight.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
}

onkeydown = (e) => {
    if(numRevealed < answers.length) {
        for(let i=0;i<=answers.length;i++) {
            if(e.code === "Digit" + i || e.code === "Numpad" + i || e.key === i) {
                clickBox(i-1);
            }
        }
        
        if(e.key === "x" || e.code === "KeyX" || e.key === "Delete" || e.code === "Delete") {
            strike();
        }
    }
}

// reveal the box graphically (doesn't handle any rules, just straight up reveals it) and whether to play the bell sound or not
function revealQuestionBox(i, playSound) {
    if(document.getElementById("answer" + i).style.display === "none") {
        if(playSound) {
            let bell = new Audio('assets/bell.mp3');
            bell.play();
        }

        document.getElementById("answer" + i).style.display = "flex";
        document.getElementById("question" + i).style.display = "none";

        numRevealed++;

        // change color of the highlight to show that you can't change it once you get one thing right
        darkenHighlight();
    }
}

// reveal the box and follow any consequential procedure of the game
function clickBox(i) {
    let boxRevealed = !(document.getElementById("answer" + i).style.display === "none");

    if(!boxRevealed) { // if the box is revealed nothing happens
        revealQuestionBox(i, true);
        
        if(stealing) { // remove this round's points from selected team and add them to the other team. also, the round is over
            let team = teamASelected ? "A" : "B";
            let otherTeam = teamASelected ? "B" : "A";
            let teamLabel = document.getElementById("team" + team + "points");
            teamLabel.textContent = parseInt(teamLabel.textContent) - pointsAddedThisRound; // remove the points the selected team got this round
            let toAdd = parseInt(document.getElementById("answerpoints" + i).textContent);
            pointsAddedThisRound += toAdd;
            let otherTeamLabel = document.getElementById("team" + otherTeam + "points");
            otherTeamLabel.textContent = parseInt(otherTeamLabel.textContent) + pointsAddedThisRound;

            endRound();
        }
        else { // add points to the selected team
            let team = teamASelected ? "A" : "B";
            let toAdd = parseInt(document.getElementById("answerpoints" + i).textContent);
            pointsAddedThisRound += toAdd;
            let teamLabel = document.getElementById("team" + team + "points");
            teamLabel.textContent = parseInt(teamLabel.textContent) + toAdd;
        }

        console.log("points added this round: " + pointsAddedThisRound + "\nteam A points: " + document.getElementById("teamApoints").textContent + "\nteam B points: " + document.getElementById("teamBpoints").textContent);
    }
}

// reveal the box and follow any consequential procedure of the game
function strike() {
    strikes++;

    if(strikes > 3) return;

    darkenHighlight();

    let buzzer = new Audio('assets/buzzer.mp3');
    buzzer.play();

    let strike = document.createElement("div");
    strike.className = "strike" + strikes;
    document.body.appendChild(strike);
    setTimeout(function() {
        strike.remove();
    }, 1000);

    if(stealing && strikes > 0) { // if the other team is stealing but fails. the round is over and the selected team gets to keep their points from this round
        endRound();
    }
    else if(strikes > 2) { // if the selected team is guessing and gets 3 strikes, the other team can steal
        stealing = true;
        strikes = 0;
    }
}

function endRound() {
    stealing = false;
    strikes = 0;
    pointsAddedThisRound = 0;
    for(let i=0;i<answers.length;i++) revealQuestionBox(i, false);
}
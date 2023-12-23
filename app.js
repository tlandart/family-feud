
let answers = ["ANS/WER NUM 1", "ANS 2 IT", "ANSWERERERERERER 3", "ANSWER NUMBER FOUR LONG LIKE REALLY LONG", "a4", "a5", "a6", "oai32rwegfjs244g2fefdiosjd"];
let points = [65, 25, 14, 10, 6, 4, 2, 0];

// i ran into an interesting problem. if we just use the variable "i" in the for loop for creating and assigning events to question boxes, the variable i changes to 8 by the end of the loop, hence making all of the question boxes call the function clickQuestionBox(8) which is not what we want. its better explained here https://forum.freecodecamp.org/t/function-inside-for-loop/195973/4. this is fixed by using "let" instead of "var" which i originally used

// create all question and answer boxes
for(let i=0; i<answers.length; i++) {
    // decide which column to put it in
    let a = 0;
    if(i >= answers.length/2) a = 1;
    let column = document.getElementById("answercol" + a);

    // create question boxes
    let questionBox = document.createElement("div");
    questionBox.className = "questionbox";
    questionBox.id = "question" + i;
    questionBox.textContent = i+1;
    questionBox.onmousedown = function() {clickQuestionBox(i)};

    column.appendChild(questionBox);

    // create answer boxes (and stuff inside)
    let answerBox = document.createElement("div");
    answerBox.className = "answerbox";
    answerBox.id = "answer" + i;
    answerBox.onmousedown = function() {clickAnswerBox(i)};
    
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
    if(points[i] < 10)
        answerBoxRight.textContent = "0" + points[i];
    else
        answerBoxRight.textContent = points[i];
    answerBox.appendChild(answerBoxRight);

    column.appendChild(answerBox);
}

onkeydown = (e) => {
    for(let i=0;i<=answers.length;i++) {
        if(e.code === "Digit" + i || e.code === "Numpad" + i || e.key === i) {
            toggleBox(i-1);
        }
    }
    
    if(e.key === "x" || e.code === "KeyX" || e.key === "Delete" || e.code === "Delete") {
        strike(3);
    }
}

function clickQuestionBox(i) {
    console.log("clicked question box " + i);
    document.getElementById("answer" + i).style.display = "flex";
    document.getElementById("question" + i).style.display = "none";
}

function clickAnswerBox(i) {
    console.log("clicked answer box " + i);
    document.getElementById("answer" + i).style.display = "none";
    document.getElementById("question" + i).style.display = "flex";
}

function toggleBox(i) {
    if(document.getElementById("answer" + i).style.display === "none") clickQuestionBox(i);
    else clickAnswerBox(i);
}

function strike(i) {
    let strike = document.createElement("div");
    strike.className = "strike" + i;
    document.body.appendChild(strike);
    setTimeout(function() {
        strike.remove();
    }, 2000);
}
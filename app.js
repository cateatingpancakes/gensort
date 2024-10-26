const PLAYER_A = 0;
const PLAYER_B = 1;

const RESET = 0;
const CONTINUE = 1;

const NO_FORCE = 0;
const FORCE = 1;

function getElement(elementId) {
    return document.getElementById(elementId);
}

function getInputValue(inputElement) {
    if(inputElement.value === "") {
        return parseInt(inputElement.placeholder);
    } else {
        return parseInt(inputElement.value);
    }
}

function removeAllChildren(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

let params = {
    "rounds": null,
    "forget": null,
    "rating": null,
    "log-base": null,
    "k-factor": null,
    "divide-by": null,
    "sigma": null
}

let scoreboard = null;
let matchHistory = null;
let completedRounds = null;
let activeMatch = null;

let spanCompleted = getElement("rounds-completed");
let choiceA = getElement("choice-a");
let choiceB = getElement("choice-b");
let scoreBox = getElement("score-box");

let actionSubmit = getElement("action-submit");
let actionSkip = getElement("action-skip");
let actionLoad = getElement("action-load");
let actionForce = getElement("action-force");
let actionHide = getElement("action-hide");

function loadParameters() {
    for(let paramName in params) {
        let paramInput = getElement("param-" + paramName);
        params[paramName] = getInputValue(paramInput);
    }
}

function makeScoreboard () {
    scoreboard = [];

    getElement("sort-targets").value.split("\n").forEach((sortTarget) => {
        scoreboard.push({
            "name": sortTarget,
            "rating": params["rating"]
        });
    });
}

function sortedScoreboard() {
    return scoreboard.slice().sort((a, b) => {
        return b["rating"] - a["rating"];
    });
}

function updateHistory(lastMatch) {
    if(matchHistory === null) {
        matchHistory = [];
    }

    if(params["forget"] !== 0) {
        while(matchHistory.length >= params["forget"]) {
            matchHistory.shift();
        }
        matchHistory.push(lastMatch);
    } else {
        matchHistory = [];
    }
}

function selectRandom(weightedList) {
    let totalWeight = weightedList.reduce((currentTotal, element) => {
        return currentTotal + element["weight"];
    }, 0);

    let random = Math.random() * totalWeight;

    for(let i = 0; i < weightedList.length; i++) {
        let element = weightedList[i];
        random -= element["weight"];
        if(random < 0) {
            return element;
        }
    }

    return null;
}

function completeRound(flag = CONTINUE) {
    if(flag === RESET) {
        completedRounds = 0;
    } else if(flag === CONTINUE) {
        completedRounds++;
    }

    spanCompleted.innerText = completedRounds.toString();
}

function gaussianWeight(ratingA, ratingB) {
    return Math.exp(-Math.pow((Math.abs(ratingA - ratingB) / params["sigma"]), 2));
}

function expectedScore(ratingA, ratingB, player) {
    let ratingDifference = null;

    if(player === PLAYER_A) {
        ratingDifference = ratingB - ratingA;
    } else if(player === PLAYER_B) {
        ratingDifference = ratingA - ratingB;
    } else {
        return null;
    }

    return 1 / (1 + Math.pow(params["log-base"], ratingDifference / params["divide-by"]));
}

function getNewRatings(ratingA, ratingB, winner) {
    let expectedA = expectedScore(ratingA, ratingB, PLAYER_A);
    let expectedB = expectedScore(ratingA, ratingB, PLAYER_B);

    let scoreA = (winner === PLAYER_A) ? 1 : 0;
    let scoreB = (winner === PLAYER_B) ? 1 : 0;

    let newRatingA = ratingA + params["k-factor"] * (scoreA - expectedA);
    let newRatingB = ratingB + params["k-factor"] * (scoreB - expectedB);

    return [newRatingA, newRatingB];
}

function generateMatch() {
    if(scoreboard === null) {
        return null;
    }

    let matches = [];

    for(let i = 0; i < scoreboard.length; i++) {
        for(let j = i + 1; j < scoreboard.length; j++) {
            if(!matchHistory.includes([i, j]) &&
               !matchHistory.includes([j, i])) {
                /* Second check should be redundant */
                matches.push({
                    "match": [i, j],
                    "weight": gaussianWeight(scoreboard[i]["rating"], scoreboard[j]["rating"])
                });
            }
        }
    }

    return selectRandom(matches)["match"];
}

function declareWinner(winner) {
    let ratingA = scoreboard[activeMatch[PLAYER_A]]["rating"];
    let ratingB = scoreboard[activeMatch[PLAYER_B]]["rating"];

    let newRatings = getNewRatings(ratingA, ratingB, winner);

    scoreboard[activeMatch[PLAYER_A]]["rating"] = newRatings[PLAYER_A];
    scoreboard[activeMatch[PLAYER_B]]["rating"] = newRatings[PLAYER_B];
}

function showResults(flag = NO_FORCE) {
    if(scoreboard === null) {
        return;
    }

    if(completedRounds >= params["rounds"] || flag === FORCE) {
        let results = sortedScoreboard();
        removeAllChildren(scoreBox);
        for(let i = 0; i < results.length; i++) {
            let result = results[i];
            let resultParagraph = document.createElement("p");
            resultParagraph.innerText = "#" + (i + 1).toString() + ": " + result["name"] + " (" + result["rating"].toString() + ")";
            scoreBox.appendChild(resultParagraph);
        }
        actionHide.classList.remove("hidden");
    }
}

function nextMatch() {
    activeMatch = generateMatch();
    updateHistory(activeMatch);

    choiceA.innerText = scoreboard[activeMatch[PLAYER_A]]["name"];
    choiceB.innerText = scoreboard[activeMatch[PLAYER_B]]["name"];
}

function startGame() {
    matchHistory = [];
    completeRound(RESET);
    nextMatch();
}

Array.from(document.getElementsByTagName("button")).forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
    })
});

actionLoad.addEventListener("click", (event) => {
    loadParameters();
});

actionSubmit.addEventListener("click", (event) => {
    makeScoreboard();
    startGame();
});

actionSkip.addEventListener("click", (event) => {
    completeRound(CONTINUE);
    nextMatch();
});

actionForce.addEventListener("click", (event) => {
    showResults(FORCE);
});

actionHide.addEventListener("click", (event) => {
    removeAllChildren(scoreBox);
    actionHide.classList.add("hidden");
});

choiceA.addEventListener("click", (event) => {
    declareWinner(PLAYER_A);
    completeRound(CONTINUE);
    showResults(NO_FORCE);
    nextMatch();
});

choiceB.addEventListener("click", (event) => {
    declareWinner(PLAYER_B);
    completeRound(CONTINUE);
    showResults(NO_FORCE);
    nextMatch();
});

loadParameters();
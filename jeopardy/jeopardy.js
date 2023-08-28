// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

// http://jservice.io/api/category

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
let categories = [];
let gameStarted = false;


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let res = await axios.get('https://jservice.io/api/categories?count=100');
    let catIds = res.data.map(c => c.id);
    let catArr = []
    for(let id = 0; id < NUM_CATEGORIES; id++){
        catArr.push(catIds[Math.floor(Math.random() * catIds.length)]);
    }      
    return catArr;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    let cat= res.data;
    let allClues = cat.clues;
    let randomClues = [];
    for(let c = 0; c < NUM_QUESTIONS_PER_CAT; c++){
        const rdmIdx = Math.floor(Math.random() * allClues.length);
        randomClues.push(allClues[rdmIdx]);
    }    
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }))
    return {title: cat.title, clues}
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const $body = $('body');
    const $htmlTable = $('<table id="jeopardy"></table>'); 
    const $thead = $('<thead></thead>');
    const $tbody = $('<tbody></tbody>');
    const $tr = $('<tr>'); 

    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        $tr.append($('<th>').text(categories[catIdx].title));
    }

    $htmlTable.append($thead).append($tr);

    for (let qIdx = 0; qIdx < NUM_QUESTIONS_PER_CAT; qIdx++) {
        let $tr = $("<tr>");
        for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
            $tr.append($(`<td onclick="handleClick(${catIdx}, ${qIdx})">`).attr('id', `${catIdx}-${qIdx}`).text('?'));
        }
        $tbody.append($tr);
    }
    $htmlTable.append($tbody);
    $body.append($htmlTable);
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(catIdx, clueIdx) {
    let clue = categories[catIdx].clues[clueIdx];
    let msg;

    if (!clue.showing) {
        msg = clue.question;
        clue.showing = 'question';
    } else if (clue.showing === 'question') {
        msg = clue.answer;
        clue.showing = 'answer';
    } else {
        return;
    }
    $(`#${catIdx}-${clueIdx}`).html(msg);

}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    const $img = $('<img src = "https://i.gifer.com/ZKZg.gif">')
    $("body").append($img)
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    setTimeout(function() {
        $('img').remove()
    }, 975)
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

function startGame () {
    // const $start = $('<button id="start">Start Game!</button>')
    const $header = $('<h1>Jeopardy!</h1>')
    const $newGame = $('<button id="newGame">New Game!</button>')    
    
    $("body").append($header).append($newGame);
    // $("#start").on("click", setupAndStart);
    $("#newGame").on("click", newGame);
}

async function setupAndStart() {
    categories = [];
    let catIds = await getCategoryIds();
    for(let catId of catIds){
        let category = await getCategory(catId);
        categories.push(category);
    }
    fillTable();
}



/** On click of start / restart button, set up game. */

function newGame () {
    gameStarted = false;
    $("table").empty();
    showLoadingView();
    hideLoadingView();
    setupAndStart();
}



/** On page load, add event handler for clicking clues */

$(document).ready(function() {
    startGame();
});
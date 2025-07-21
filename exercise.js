export const exerciseRepository = {
    // More complex exercises are defined using a custom syntax.
    basic1: {display: "Basic 1", pattern: "4(Rrr-) 4(Lll-) 4(Rrr-) 2(Lll-) 2(LlRr)", tempo: "quaver"},
    basic2: {display: "Basic 2", pattern: "7(R-llL-rr) 2(RlLr)", tempo: "quaver"},
}

export const patternRepository = {
    paradiddle: {display: "Paradiddle", pattern: "RLRRLRLL"},
    paradiddleLeft: {display: "Paradiddle Left", pattern: "LRLLRLRR"},
    doubleParadiddle: {display: "Double Paradiddle", pattern: "RLRLRRLRLRLL"},
    singleBeat: {display: "Single Beat", pattern: "RLRLRLRL"},
    singleBeatLeft: {display: "Single Beat Left", pattern: "LRLRLRLR"}
}

function expandPattern(pattern) {
    /* To make the exercises easier to write, we use a syntax that allows us to repeat some patterns.
    Examples:
     - 2(rrllR-L-) -> rrllR-L- rrllR-L-
     - 4(R-L-rrll) -> R-L-rrll R-L-rrll R-L-rrll R-L-rrll
    */
    const regex = /\d\([rRLl\-K]+\)/
    const tokens = pattern.split(" ");
    let result = "";
    for (const token of tokens) {
        if (regex.test(token)) {
            const [count, pattern] = token.split("(");            
            result += pattern.replace(")", " ").repeat(count);
        } else {
            result += token + " ";
        }
    }
    return result;
}

export function processExercise(exercise) {
    // TODO: Check if the syntax is valid. Gotta get that interpreter working LUL
    const expandedExercise = expandPattern(exercise);
    const result = styleExercise(expandedExercise);
    return result;
}

export function loadExerciseFromRepository(exerciseName) {
    const exercise = exerciseRepository[exerciseName];
    const expandedExercise = expandPattern(exercise.pattern);

    const result = styleExercise(expandedExercise);
    return result
}

export function generateOneBarPatternExercise(pattern, bars, strokes, flip, rndLen) {    
    let bar = "";
    if (pattern === "random") {
        bar = generateRandomPattern(rndLen, strokes, flip);
    } else {
        bar = patternRepository[pattern].pattern;
    }
    // Convert the bar to our lovely expandable syntax
    bar = bars + "(" + bar + ")";
    const expandedBar = expandPattern(bar);

    const result = styleExercise(expandedBar);
    return result;
}

/* TODO: Make this random generator a bit more sophisticated. Examples:
  - Force to start with a specific stroke
  - look to build the patterns with "phrases" (predefined groups of strokes)
*/
function generateRandomPattern(rndLen, strokes, flip) {
    // Define default strokes R and L if none selected
    let availableStrokes = strokes;
    if (availableStrokes.length === 0) {
        availableStrokes = ["R", "L"];
    }
    
    let bar = "";
    
    // Generate random pattern of specified length
    for (let i = 0; i < rndLen; i++) {
        const randomStroke = availableStrokes[Math.floor(Math.random() * availableStrokes.length)];
        bar += randomStroke;
    }
    
    if (flip) {
        // Duplicate the random pattern and flip R, r <-> L, l. keep K or any other character unchanged.
        const copy = bar;
        for (const c of copy) {
            if (c === 'R') {
                bar += 'L';
            } else if (c === 'L') {
                bar += 'R';
            } else if (c === 'r') {
                bar += 'l';
            } else if (c === 'l') {
                bar += 'r';
            } else {
                bar += c;
            }
        }
    }

    return bar;
}


function styleExercise(exercise) {
    // A bit hacky but treat each bar as a separate entity to gracefully handle the empty spaces between bars
    const bars = exercise.split(" ");
    let strokeIndex = 0;
    let result = "";

    for (let i = 0; i < bars.length; i++) {
        // Color-code each stroke in the pattern and add unique IDs
        for (const stroke of bars[i]) {
            result += classifyStroke(stroke, strokeIndex);
            strokeIndex++;
        }
        if (i < bars.length - 1) {
            result += " "; // Add space between bars
        }
    }

    return result;
}

function classifyStroke(stroke, strokeIndex) {
    switch (stroke) {
        case "R":
            return `<span class="stroke-r" id="stroke-${strokeIndex}">R</span>`;            
        case "L":
            return `<span class="stroke-l" id="stroke-${strokeIndex}">L</span>`;
        case "K":
            return `<span class="stroke-k" id="stroke-${strokeIndex}">K</span>`;
        case "r":
            return `<span class="stroke-r-lower" id="stroke-${strokeIndex}">r</span>`;
        case "l":
            return `<span class="stroke-l-lower" id="stroke-${strokeIndex}">l</span>`;
        case "-":
            return `<span class="stroke-m" id="stroke-${strokeIndex}">-</span>`;
        default:
            return `<span id="stroke-${strokeIndex}">${stroke}</span>`;
    }
}
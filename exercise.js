export const ExerciseEntity = {
    name: "",
    pattern: "",

    update: function(name, pattern) {
        this.name = name;
        this.pattern = pattern;
        //console.log("Updated exercise: " + this.name + " " + this.pattern);
    },

    style: function(timeSignatureStep) {
        const bars = this.expand();
        let strokeIndex = 0;
        let result = "";
    
        for (let i = 0; i < bars.length; i++) {
            // Color-code each stroke in the pattern and add unique IDs
            for (const stroke of bars[i]) {
                result += classifyStroke(stroke, strokeIndex);
                strokeIndex++;
                if (strokeIndex % timeSignatureStep == 0) {
                    // &#8203; is a zero-width space to force the line to break around the bar delimiter
                    result += "|&#8203;";
                }
            }    
        }
        //console.log("Styled exercise: " + result);
        return result;
    },

    expand: function() {
        /* To make the exercises easier to write, we use a syntax that allows us to repeat some patterns.
        Examples:
            - 2(rrllR-L-) -> rrllR-L- rrllR-L-
            - 4(R-L-rrll) -> R-L-rrll R-L-rrll R-L-rrll R-L-rrll
        */
        const group_regex = /\d\([rRLl\-K]+\)/
        const simple_regex = /[rRLl\-K]+/
        const tokens = this.pattern.split(" ");
        let result = "";
        for (const token of tokens) {
            if (group_regex.test(token)) {
                const [count, pattern] = token.split("(");            
                result += pattern.replace(")", "").repeat(count);
            }
            else if (simple_regex.test(token)) {
                result += token;
            }
        }
        //console.log("Expanded pattern: " + result);
        return result;
    },
}

export const exerciseRepository = {
    // More complex exercises are defined using a custom syntax.
    basic1: {name: "Basic 1", pattern: "4(Rrr-) 4(Lll-) 4(Rrr-) 2(Lll-) 2(LlRr)"},
    basic2: {name: "Basic 2", pattern: "7(R-llL-rr) 2(RlLr)"},
}

export const patternRepository = {
    doubles: {name: "Doubles", pattern: "2(rrll)"},
    doublesLeft: {name: "Doubles Left", pattern: "2(llrr)"},
    paradiddle: {name: "Paradiddle", pattern: "rlrrlrll"},
    paradiddleAccent: {name: "Paradiddle (Accent)", pattern: "RlRrLrLl"},
    paradiddleLeft: {name: "Paradiddle Left", pattern: "lrllrlrr"},
    doubleParadiddle: {name: "Double Paradiddle", pattern: "rlrlrrlrlrll"},
    singleBeat: {name: "Singles", pattern: "4(rl)"},
    singleBeatLeft: {name: "Singles Left", pattern: "4(lr)"},
    singleAccent: {name: "Singles (accent)", pattern: "4(Rl)"},
    singleAccentLeft: {name: "Singles (accent) Left", pattern: "r(Lr)"},
    eightFourTwoTwo: {name: "8-4-2-2", pattern: "8(r) 8(l) 4(r) 4(l) rrllrrll"},
}


export function processExercise(exercise) {
    ExerciseEntity.update("User Edited", exercise);
}

export function loadExerciseFromRepository(exerciseName) {
    const exercise = exerciseRepository[exerciseName];
    ExerciseEntity.update(exercise.name, exercise.pattern);
}

export function generateOneBarPatternExercise(pattern, bars, strokes, flip, rndLen) {    
    let bar = "";
    if (pattern === "random") {
        bar = generateRandomPattern(rndLen, strokes, flip);
        pattern = bars + "(" + bar + ")";
        name = "Random"
        console.log("Random pattern: " + bar);
    } else {
        bar = patternRepository[pattern].pattern;
        pattern = bars + "(" + bar + ")";
    }

    ExerciseEntity.update(name, pattern);
}

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
            // &#x2011; is a special character that is a hyphen but doesn't break the line
            return `<span class="stroke-m" id="stroke-${strokeIndex}">&#x2011;</span>`;
        default:
            return `<span id="stroke-${strokeIndex}">${stroke}</span>`;
    }
}

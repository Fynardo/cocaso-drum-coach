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
            - 2(3(rr)ll) -> rrrrrrllrrrrrrll (nested groups)
        */
        const trimmed = this.pattern.replaceAll(" ", "");
        //console.log("Expanding pattern: " + trimmed);
        return this.expandToken(trimmed);
    },

    expandToken: function(token) {
        //console.log("Expanding token: " + token);
        // Base case: if no parentheses, return as is
        if (!token.includes('(')) {
            return token;
        }

        // Find the first digit followed by (
        const match = token.match(/\d+\(/);
        if (match) {
            const matchStart = match.index;
            const countStr = match[0].slice(0, -1); // Remove the '('
            const count = parseInt(countStr);
            const parenStart = matchStart + countStr.length;
            const parenEnd = this.findMatchingParen(token, parenStart);

            if (parenEnd !== -1) {
                const content = token.substring(parenStart + 1, parenEnd);
                // Recursively expand the content
                const expandedContent = this.expandToken(content);
                // Repeat the expanded content
                const repeated = expandedContent.repeat(count);
                // Replace the group in the token and continue expanding
                const before = token.substring(0, matchStart);
                const after = token.substring(parenEnd + 1);
                const newToken = before + repeated + after;
                return this.expandToken(newToken);
            }
        }
        return token;
    },

    findMatchingParen: function(str, startIndex) {
        let count = 1;
        for (let i = startIndex + 1; i < str.length; i++) {
            if (str[i] === '(') count++;
            else if (str[i] === ')') count--;
            if (count === 0) return i;
        }
        return -1;
    },
}

export const exerciseRepository = {
    // More complex exercises are defined using a custom syntax.
    basic1: {name: "Basic 1", pattern: "4(Rrr-) 4(Lll-) 4(Rrr-) 2(Lll-) 2(LlRr)"},
    basic2: {name: "Basic 2", pattern: "7(R-llL-rr) 2(RlLr)"},
}

export const patternRepository = {
    doubles: {name: "Doubles", pattern: "rrllrrll"},
    doublesLeft: {name: "Doubles Left", pattern: "llrrllrr"},
    paradiddle: {name: "Paradiddle", pattern: "rlrrlrll"},
    paradiddleAccent: {name: "Paradiddle (Accent)", pattern: "RlRrLrLl"},
    paradiddleLeft: {name: "Paradiddle Left", pattern: "lrllrlrr"},
    doubleParadiddle: {name: "Double Paradiddle", pattern: "rlrlrrlrlrll"},
    singleBeat: {name: "Singles", pattern: "rlrlrlrl"},
    singleBeatLeft: {name: "Singles Left", pattern: "lrllrlrr"},
    singleAccent: {name: "Singles (accent)", pattern: "RlRlRlRl"},
    singleAccentLeft: {name: "Singles (accent) Left", pattern: "LrLrLrLr"},
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
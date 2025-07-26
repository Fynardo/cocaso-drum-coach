import { Logger } from './logger.js';

export const ExerciseEntity = {
    name: "",
    pattern: "",
    strokes: ["R", "L", "r", "l", "-", "K"],

    update: function(name, pattern) {
        this.name = name;
        this.pattern = pattern;
        Logger.debug("Updated exercise: " + this.name + " " + this.pattern);
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
        Logger.debug("Styled exercise: " + result);
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
        Logger.debug("Expanding pattern: " + trimmed);
        return this.expandToken(trimmed);
    },

    expandToken: function(token) {
        Logger.debug("Expanding token: " + token);
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
    eightFourTwoTwo: {name: "8-4-2-2", pattern: "8(r) 8(l) 4(r) 4(l) rrllrrll"},
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
}


export function processExercise(exercise) {
    ExerciseEntity.update("User Edited", exercise);
}

export function loadExerciseFromRepository(exerciseName) {
    const exercise = exerciseRepository[exerciseName];
    ExerciseEntity.update(exercise.name, exercise.pattern);
}

export function generateOneBarPatternExercise(pattern, bars, strokes, rndLen) {
    let bar = "";
    if (pattern === "random") {
        pattern = generateRandomPattern(rndLen, strokes, bars);
        name = "Random"
        Logger.debug("Random pattern: " + pattern);
    } else {
        bar = patternRepository[pattern].pattern;
        pattern = bars + "(" + bar + ")";
    }

    ExerciseEntity.update(name, pattern);
}

/*  RANDOM PATTERN UTILS */
/* First attempt of refactoring the random generator.

The idea is to have a list of what I called "literals". Literals are pairs of strokes,
calculated by the cartesian product of all the available strokes. These literals will be used to generate the patterns.
The goal is that these generated patterns help to keep some sort of structure while not losing the random nature of the
generated exercise.

Strokes can be filtered in the UI by using the checkboxes.
*/

// I got this from https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// I don't understand how it works.
const cartesian =
  (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

// We need the cartesian product as pairs of strokes as strings.
const randomLiterals = cartesian(ExerciseEntity.strokes, ExerciseEntity.strokes).map(literal => literal.join(""))

function anyR(strokes) {
    return strokes.indexOf("R") !== -1;
}

function anyL(strokes) {
    return strokes.indexOf("L") !== -1;
}

function anyr(strokes) {
    return strokes.indexOf("r") !== -1;
}

function anyl(strokes) {
    return strokes.indexOf("l") !== -1;
}

function anyK(strokes) {
    return strokes.indexOf("K") !== -1;
}

function anym(strokes) {
    return strokes.indexOf("-") !== -1;
}

const filters = {
    "R": anyR,
    "L": anyL,
    "r": anyr,
    "l": anyl,
    "-": anym,
    "K": anyK,
}

function generateRandomPattern(rndLen, strokes, bars) {
    let useFilters = []
    strokes.forEach(stroke => {
        useFilters.push(filters[stroke]);
    });

    Logger.debug("Using filters for non-wanted strokes: " + useFilters);

    let availableLiterals = structuredClone(randomLiterals);

    for (const literal of randomLiterals) {
        for (const filter of useFilters) {
            if (filter(literal)) {
                availableLiterals.splice(availableLiterals.indexOf(literal), 1);
                break;
            }
        }
    };
    Logger.debug("Available Literals for random pattern generation: " + availableLiterals);
    
    let bar = "";
    const literalsPerBar = rndLen / 2;

    for (let i = 0; i < bars; i++) {
        for (let j = 0; j < literalsPerBar; j++) {
            bar += availableLiterals[Math.floor(Math.random() * availableLiterals.length)];
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
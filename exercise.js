export function generateRandomPattern(rndLen, availableStrokes, flip) {
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

export function generateDrumExercise(pattern, bars, strokes, flip, rndLen) {
    // Define default strokes R and L if none selected
    let availableStrokes = strokes;
    if (availableStrokes.length === 0) {
        availableStrokes = ["R", "L"];
    }
    
    let bar = "";
    
    switch (pattern) {
        case "paradiddle":
            bar = "RLRRLRLL";
            break;
        case "paradiddle-left":
            bar = "LRLLRLRR";
            break;
        case "double-paradiddle":
            bar = "RLRLRRLRLRLL";
            break;
        case "single-beat":
            bar = "RLRLRLRL";
            break;
        case "single-beat-left":
            bar = "LRLRLRLR";
            break;
        case "random":
            bar = generateRandomPattern(rndLen, availableStrokes, flip);
            break;
        default:
            // Same as random just to be sure we create something
            bar = generateRandomPattern(rndLen, availableStrokes, flip);
            break;
    }
    
    // Repeat pattern for the number of bars and add color coding + IDs for highlighting
    let result = "";
    let strokeIndex = 0;
    
    for (let i = 0; i < bars; i++) {
        // Color-code each stroke in the pattern and add unique IDs
        for (const stroke of bar) {
            switch (stroke) {
                case "R":
                    result += `<span class="stroke-r" id="stroke-${strokeIndex}">R</span>`;
                    break;
                case "L":
                    result += `<span class="stroke-l" id="stroke-${strokeIndex}">L</span>`;
                    break;
                case "K":
                    result += `<span class="stroke-k" id="stroke-${strokeIndex}">K</span>`;
                    break;
                case "r":
                    result += `<span class="stroke-r-lower" id="stroke-${strokeIndex}">r</span>`;
                    break;
                case "l":
                    result += `<span class="stroke-l-lower" id="stroke-${strokeIndex}">l</span>`;
                    break;
                case "M":
                    result += `<span class="stroke-m" id="stroke-${strokeIndex}">-</span>`;
                    break;
                default:
                    result += `<span id="stroke-${strokeIndex}">${stroke}</span>`;
                    break;
            }
            strokeIndex++;
        }
        if (i < bars - 1) {
            result += " "; // Add space between bars
        }
    }
    
    return result;
}


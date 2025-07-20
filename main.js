import { generateDrumExercise} from './exercise.js';
import { ThemeManager } from './theme.js';
import { Metronome } from './metronome.js';

// Set current year dynamically
 document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
});

// User Inteface functions made global because I don't know how to do it otherwise lul
function startMetronome() {
    Metronome.start();
}

function stopMetronome() {
    Metronome.stop();
}

window.startMetronome = startMetronome;
window.stopMetronome = stopMetronome;

// Stroke cycling variables
const strokeCycle = ['R', 'r', 'L', 'l', 'K', '-'];

// Form submission handler
document.getElementById('exercise-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const formData = new FormData(this);
    const pattern = formData.get('pattern');
    const barsStr = formData.get('bars');
    const flip = formData.get('flip') === 'true';
    const rndLenStr = formData.get('rnd_len');
    
    // Get selected strokes
    const strokes = [];
    const strokeCheckboxes = document.querySelectorAll('input[name="strokes"]:checked');
    strokeCheckboxes.forEach(checkbox => {
        strokes.push(checkbox.value);
    });
    
    // Parse bars as integer
    let bars = parseInt(barsStr);
    if (isNaN(bars) || bars <= 0) {
        bars = 1; // Default to 1 if invalid
    }
    
    // Parse rndLen as integer
    let rndLen = parseInt(rndLenStr);
    if (isNaN(rndLen) || rndLen <= 0) {
        rndLen = 6; // Default to 6 if invalid
    }
    
    // Generate drum exercise using JavaScript function
    // TODO: Add a multi-bar exercise generator (generateMultiBarExercise?)
    // TODO: Rename this to generateOnePatternExercise
    const exercise = generateDrumExercise(pattern, bars, strokes, flip, rndLen);
    
    // Display the result
    const exerciseDiv = `
        <div class="exercise-div">
            <h3>Drum Practice Exercise Generated!</h3>
            <p><strong>Bars:</strong> ${barsStr}</p>
            <p><strong>Pattern:</strong> ${pattern}</p>
            <p><strong>Strokes:</strong> ${formatStrokes(strokes)}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #495057;">Your Practice Exercise:</h4>
                <div class="exercise-display" id="exercise-display">${exercise}</div>
                <button class="copy-button" id="copy-exercise-btn" onclick="copyExercise()">📋 Copy Exercise</button>
            </div>
            <p><em>Each stroke represents one subdivision based on your selected structure. Start the metronome to practice!<br>The metronome begins with a preparation bar, then plays the exercise, with rest bars between cycles.<br><strong>Click on any stroke to cycle through different options (R → r → L → l → K → M)</strong></em></p>
        </div>
    `;
    
    document.getElementById('exercise-div').innerHTML = exerciseDiv;
    
    // Make strokes clickable after the exercise is loaded
    makeStrokesClickable();
});

// Stroke cycling functions
function makeStrokesClickable() {
    const strokeSpans = document.querySelectorAll('[id^="stroke-"]');
    strokeSpans.forEach(span => {
        span.classList.add('stroke-span');
        span.addEventListener('click', handleStrokeClick);
    });
}

function handleStrokeClick(event) {
    const currentStroke = event.target.textContent;
    const currentIndex = strokeCycle.indexOf(currentStroke);
    const nextIndex = (currentIndex + 1) % strokeCycle.length;
    const nextStroke = strokeCycle[nextIndex];
    
    // Update the span content and styling
    updateStrokeDisplay(event.target, nextStroke);
}

function updateStrokeDisplay(span, newStroke) {
    span.textContent = newStroke;
    
    // Remove old stroke classes
    span.className = span.className.replace(/stroke-[a-z-]+/g, '');
    
    // Add stroke-span class back and new stroke class
    span.classList.add('stroke-span');
    
    switch(newStroke) {
        case 'R': span.classList.add('stroke-r'); break;
        case 'L': span.classList.add('stroke-l'); break;
        case 'K': span.classList.add('stroke-k'); break;
        case 'r': span.classList.add('stroke-r-lower'); break;
        case 'l': span.classList.add('stroke-l-lower'); break;
        case 'M': span.classList.add('stroke-m'); break;
    }
}


// Handle metronome with keyboard (spacebar)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scroll
        if (!Metronome.isPlaying) {
            Metronome.start();
        } else {
            Metronome.stop();
        }
    }
});

// Handle page visibility change (stop metronome when tab is hidden)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && Metronome.isPlaying) {
        Metronome.stop();
    }
});

// JavaScript version of formatStrokes (for display purposes)
function formatStrokes(strokes) {
    if (strokes.length === 0) {
        return "None selected";
    }
    
    let result = "";
    for (let i = 0; i < strokes.length; i++) {
        if (i > 0) {
            result += ", ";
        }
        const stroke = strokes[i];
        switch (stroke) {
            case "R":
                result += `<span class="stroke-r">R</span>`;
                break;
            case "L":
                result += `<span class="stroke-l">L</span>`;
                break;
            case "K":
                result += `<span class="stroke-k">K</span>`;
                break;
            case "r":
                result += `<span class="stroke-r-lower">r</span>`;
                break;
            case "l":
                result += `<span class="stroke-l-lower">l</span>`;
                break;
            case "M":
                result += `<span class="stroke-m">-</span>`;
                break;
            default:
                result += stroke;
                break;
        }
    }
    return result;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
        
    // Initialize theme manager
    ThemeManager.init();
});
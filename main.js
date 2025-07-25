import { patternRepository, exerciseRepository, generateOneBarPatternExercise, loadExerciseFromRepository, processExercise, ExerciseEntity} from './exercise.js';
import { Metronome } from './metronome.js';
import { ThemeManager } from './theme.js';
import { Logger } from './logger.js';


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

document.getElementById('debug-button').addEventListener('click', () => {
    const debugButton = document.getElementById('debug-button');
    debugButton.classList.toggle('debug-button-enabled');
    Logger.debugMode = !Logger.debugMode;
});


// Stroke cycling variables
const strokeCycle = ['R', 'r', 'L', 'l', 'K', '-'];

function prepareExercise() {
    Logger.debug("Preparing exercise");
    const timeSignature = Metronome.getTimeSignatureSettings();
    const patternTempo = Metronome.getPatternTempoSettings();
    const step = timeSignature.beatsPerBar * patternTempo.subdivision; // Example: 3/4 * quavers (2) = 6 -> Space each 6 strokes
    Logger.debug("Step: " + step);
    const styledExercise = ExerciseEntity.style(step);
    return styledExercise;
}


document.getElementById('time-signature').onchange = function() {
    // Update the exercise
    Logger.debug("Time signature changed");
    document.getElementById('exercise-display').innerHTML = prepareExercise();
}

document.getElementById('pattern-tempo').onchange = function() {
    // Update the exercise
    Logger.debug("Pattern tempo changed");
    document.getElementById('exercise-display').innerHTML = prepareExercise();
}

// Forms submission handler
document.getElementById('rudiments-form').addEventListener('submit', function(e) {
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
    
    // Generate drum exercise based on the selected pattern
    const exercise = generateOneBarPatternExercise(pattern, bars, strokes, flip, rndLen);
    const styledExercise = prepareExercise();

    // Display the result
    const exerciseDiv = `
        <div class="exercise-div">
            <h3>Drum Practice Exercise Generated!</h3>
            <p><strong>Bars:</strong> ${barsStr}</p>
            <p><strong>Pattern:</strong> ${pattern}</p>
            <p><strong>Strokes:</strong> ${formatStrokes(strokes)}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #495057;">Your Practice Exercise:</h4>
                <div class="exercise-display" id="exercise-display">${styledExercise}</div>
                <button class="copy-button" id="copy-exercise-btn" onclick="copyExercise()">📋 Copy Exercise</button>
            </div>
            <p><em>Each stroke represents one subdivision based on your selected structure. Start the metronome to practice!<br>The metronome begins with a preparation bar, then plays the exercise, with rest bars between cycles.<br><strong>Click on any stroke to cycle through different options (R → r → L → l → K → M)</strong></em></p>
        </div>
    `;
    
    document.getElementById('exercise-div').innerHTML = exerciseDiv;
    
    // Make strokes clickable after the exercise is loaded
    makeStrokesClickable();
});


document.getElementById('exercises-repository-form').addEventListener('submit', function(e) {
     e.preventDefault();

    const formData = new FormData(this);
    const exerciseName = formData.get('exercises');
    loadExerciseFromRepository(exerciseName);
    const styledExercise = prepareExercise();
     
    const exerciseDiv = `
        <div class="exercise-div">
            <h3>Drum Practice Exercise Generated!</h3>         
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #495057;">Your Practice Exercise:</h4>
                <div class="exercise-display" id="exercise-display">${styledExercise}</div>
                <button class="copy-button" id="copy-exercise-btn" onclick="copyExercise()">📋 Copy Exercise</button>
            </div>
            <p><em>Each stroke represents one subdivision based on your selected structure. Start the metronome to practice!<br>The metronome begins with a preparation bar, then plays the exercise, with rest bars between cycles.<br><strong>Click on any stroke to cycle through different options (R → r → L → l → K → M)</strong></em></p>
        </div>
    `;
 
    document.getElementById('exercise-div').innerHTML = exerciseDiv;
 
    // Make strokes clickable after the exercise is loaded
    makeStrokesClickable();
});

function sanitizeExercise(exercise) {
    // Remove all chars that are not in our syntax. Basically numbers and chars that represent strokes.
    return exercise.replace(/[^0-9RrLlK-\s\(\)]/g, '');
}

document.getElementById('exercise-editor-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const customExercise = formData.get('exercise-editor-input');
    const sanitized = sanitizeExercise(customExercise);
    const exercise = processExercise(sanitized);
    const styledExercise = prepareExercise(exercise);

    const exerciseDiv = `
        <div class="exercise-div">
            <h3>Drum Practice Exercise Generated!</h3>         
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #495057;">Your Practice Exercise:</h4>
                <div class="exercise-display" id="exercise-display">${styledExercise}</div>
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
        case '-': span.classList.add('stroke-m'); break;
    }
}

// Handle metronome with keyboard
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && event.ctrlKey) {
        event.preventDefault(); // Prevent page scroll
        if (!Metronome.isPlaying) {
            Metronome.start();
        } else {
            Metronome.stop();
        }
    }
    if (event.code === 'ArrowUp' && event.ctrlKey) {
        event.preventDefault();
        document.getElementById('bpm').value = parseInt(document.getElementById('bpm').value) + 5;
    }
    if (event.code === 'ArrowDown' && event.ctrlKey) {
        event.preventDefault();
        document.getElementById('bpm').value = parseInt(document.getElementById('bpm').value) - 5;
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

// Populate the exercises dropdowns with repository data
function populateForms() {    
    const pattern_select = document.getElementById('pattern-select');
    for (const [key, value] of Object.entries(patternRepository)) {       
        pattern_select.innerHTML += `<option value="${key}">${value.name} - ${value.pattern}</option>`;
    }

    const exercises_select = document.getElementById('exercises-select');
    for (const [key, value] of Object.entries(exerciseRepository)) {       
        exercises_select.innerHTML += `<option value="${key}">${value.name} - ${value.pattern}</option>`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
        
    // Initialize theme manager
    ThemeManager.init();

    // Populate the forms
    populateForms();
});
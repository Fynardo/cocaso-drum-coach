
export const Metronome = {
    audioContext: null,
    metronomeInterval: null,
    isPlaying: false,
    currentStrokeIndex: 0,
    currentBarIndex: 0,
    totalStrokes: 0,
    isInEmptyBar: false,
    emptyBarClickCount: 0,
    isPreparationBar: false,
    clicksPerBar: 4, // Will be set dynamically based on time-signature and structure
    emptyBarClicksPerBar: 4, // Will be set dynamically based on time-signature (quarter notes only)

    initAudioContext: function() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    timeSignatures: {
        '3/4': {
            name: '3/4',
            beatsPerBar: 3
        },
        '4/4': {
            name: '4/4',
            beatsPerBar: 4
        },
        '5/4': {
            name: '5/4',
            beatsPerBar: 5
        },
        '6/4': {
            name: '6/4',
            beatsPerBar: 6
        },
        '7/4': {
            name: '7/4',
            beatsPerBar: 7
        },
        '8/4': {
            name: '8/4',
            beatsPerBar: 8
        },
        '9/4': {
            name: '9/4',
            beatsPerBar: 9
        }
    },

    // Get current time-signature settings (time signature)
    getTimeSignatureSettings: function() {
        const timeSignatureSelect = document.getElementById('time-signature');
        const timeSignature = timeSignatureSelect.value;
    
        return this.timeSignatures[timeSignature];
    },
    
    // Get current structure settings
    getStructureSettings: function() {
        const structureSelect = document.getElementById('structure');
        const structure = structureSelect.value;
        
        switch (structure) {
            case 'crotchet':
                return {
                    name: 'Crotchet',
                    subdivision: 1 // Quarter note divided by 1
                };
            case 'quaver':
                return {
                    name: 'Quaver',
                    subdivision: 2 // Quarter note divided by 2
                };
            case 'semiquaver':
                return {
                    name: 'Semiquaver', 
                    subdivision: 4 // Quarter note divided by 4
                };
            default:
                return {
                    name: 'Crotchet',
                    subdivision: 1
                };
        }
    },
    
    // Get current pattern tempo settings
    getPatternTempoSettings: function() {
        const patternTempoSelect = document.getElementById('pattern-tempo');
        const patternTempo = patternTempoSelect.value;
    
        switch (patternTempo) {
            case 'crotchet':
                return {
                    name: 'Crotchet',
                    subdivision: 1 // Quarter note
                };
            case 'quaver':
                return {
                    name: 'Quaver',
                    subdivision: 2 // Eighth note
                };
            case 'semiquaver':
                return {
                    name: 'Semiquaver',
                    subdivision: 4 // Sixteenth note
                };
            default:
                return {
                    name: 'Crotchet',
                    subdivision: 1
                };
        }
    },
    
    // Calculate stroke step based on metronome structure vs pattern tempo
    calculateStrokeStep: function() {
        const metronomeStructure = this.getStructureSettings();
        const patternTempo = this.getPatternTempoSettings();
    
        // Calculate the ratio between metronome clicks and pattern strokes
        // metronomeStructure.subdivision represents clicks per quarter note
        // patternTempo.subdivision represents strokes per quarter note
        const ratio = patternTempo.subdivision / metronomeStructure.subdivision;
    
        // For now, we'll work with simple integer ratios
        // If ratio >= 1: highlight every ratio-th stroke
        // If ratio < 1: we need to handle sub-divisions differently
        return Math.max(1, Math.round(ratio));
    },
    
    // Calculate clicks per bar based on timeSignature and structure
    getClicksPerBar: function() {
        const timeSignatureSettings = this.getTimeSignatureSettings();
        const structureSettings = this.getStructureSettings();
        return timeSignatureSettings.beatsPerBar * structureSettings.subdivision;
    },
    
    highlightBar: function(index) {
        const previouslyHighlighted = document.querySelector('.bar-highlight');
        if (previouslyHighlighted) {
            previouslyHighlighted.classList.remove('bar-highlight');
        }
        
        // Add highlight to current stroke
        const barElement = document.getElementById('bar-' + index);
        if (barElement) {
            barElement.classList.add('bar-highlight');
        }
    },
    
    // Highlight stroke functions
    highlightStroke: function(index) {
        // Remove previous highlights
        const previouslyHighlighted = document.querySelector('.stroke-highlight');
        if (previouslyHighlighted) {
            previouslyHighlighted.classList.remove('stroke-highlight');
        }
        
        // Add highlight to current stroke
        const strokeElement = document.getElementById('stroke-' + index);
        if (strokeElement) {
            strokeElement.classList.add('stroke-highlight');
        }
    },
    
    clearAllHighlights: function() {
        const highlighted = document.querySelectorAll('.stroke-highlight');
        highlighted.forEach(element => {
            element.classList.remove('stroke-highlight');
        });
    },
    
    updateTotalStrokes: function() {
        // Count total strokes in the exercise
        const exerciseDisplay = document.getElementById('exercise-display');
        if (exerciseDisplay) {
            const strokes = exerciseDisplay.querySelectorAll('[id^="stroke-"]');
            this.totalStrokes = strokes.length;
            // Re-make strokes clickable after counting (in case DOM was updated)
            //makeStrokesClickable();
        } else {
            this.totalStrokes = 0;
        }
    },
    
    // Switch to exercise interval (structure-based)
    switchToExerciseInterval: function() {
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            const bpmInput = document.getElementById('bpm');
            const bpm = parseInt(bpmInput.value);
            const structureSettings = this.getStructureSettings();
            const quarterNoteInterval = 60000 / bpm;
            const subdivisionInterval = quarterNoteInterval / structureSettings.subdivision;
            
            this.metronomeInterval = setInterval(() => {
                this.playClickAndHighlight();
            }, subdivisionInterval);
        }
    },
    
    // Switch to empty bar interval (quarter note based)
    switchToEmptyBarInterval: function() {
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            const bpmInput = document.getElementById('bpm');
            const bpm = parseInt(bpmInput.value);
            const quarterNoteInterval = 60000 / bpm;
            
            this.metronomeInterval = setInterval(() => {
                this.playClickAndHighlight();
            }, quarterNoteInterval);
        }
    },
    
    // Update status display for preparation bar
    updateStatusForPreparationBar: function() {
        const bpmInput = document.getElementById('bpm');
        const bpm = parseInt(bpmInput.value);
        const timeSignatureSettings = this.getTimeSignatureSettings();
        const statusText = 'Preparation bar (' + this.emptyBarClickCount + '/' + this.emptyBarClicksPerBar + ') - Get ready! Playing quarter notes in ' + timeSignatureSettings.name + ' at ' + bpm + ' BPM';
        document.getElementById('metronome-status').textContent = statusText;
    },
    
    // Update status display for rest bar
    updateStatusForRestBar: function() {
        const bpmInput = document.getElementById('bpm');
        const bpm = parseInt(bpmInput.value);
        const timeSignatureSettings = this.getTimeSignatureSettings();
        const statusText = 'Rest bar (' + this.emptyBarClickCount + '/' + this.emptyBarClicksPerBar + ') - Playing quarter notes in ' + timeSignatureSettings.name + ' at ' + bpm + ' BPM';
        document.getElementById('metronome-status').textContent = statusText;
    },
    
    // Update status display for exercise
    updateStatusForExercise: function() {
        const bpmInput = document.getElementById('bpm');
        const bpm = parseInt(bpmInput.value);
        const structureSettings = this.getStructureSettings();
        const timeSignatureSettings = this.getTimeSignatureSettings();
        const patternTempoSettings = this.getPatternTempoSettings();
        const strokeStep = this.calculateStrokeStep();
        const clicksPerMinute = Math.round(bpm * structureSettings.subdivision);
        const statusText = 'Playing ' + structureSettings.name.toLowerCase() + 's in ' + timeSignatureSettings.name + ' at ' + bpm + ' BPM (' + clicksPerMinute + ' clicks/min) | Pattern: ' + patternTempoSettings.name.toLowerCase() + 's (step: ' + strokeStep + ')';
        document.getElementById('metronome-status').textContent = statusText;
    },
       
    // Play click and handle highlighting
    playClickAndHighlight: function() {
        const metronomeStructure = this.getStructureSettings();
        const patternTempo = this.getPatternTempoSettings();
        
        if (this.totalStrokes > 0) {
            if (this.isPreparationBar) {
                // During preparation bar - no highlighting, just count clicks
                this.emptyBarClickCount++;
                this.updateStatusForPreparationBar();
                
                if (this.emptyBarClickCount > this.emptyBarClicksPerBar) {
                    // Preparation bar complete, start exercise
                    this.isPreparationBar = false;
                    this.emptyBarClickCount = 0;
                    this.currentStrokeIndex = 0;
                    this.highlightStroke(this.currentStrokeIndex);
                    this.currentStrokeIndex += this.calculateStrokeStep();
                    this.currentBarIndex = Math.floor(this.currentStrokeIndex / (this.getTimeSignatureSettings().beatsPerBar * patternTempo.subdivision));
                    
                    this.highlightBar(this.currentBarIndex);
                    this.updateStatusForExercise();
                    // Switch to exercise interval
                    this.switchToExerciseInterval();
                }
            } else if (this.isInEmptyBar) {
                // During rest bar - no highlighting, just count clicks
                this.emptyBarClickCount++;
                this.updateStatusForRestBar();
    
                if (this.emptyBarClickCount > this.emptyBarClicksPerBar) {
                    // Rest bar complete, return to beginning of exercise
                    this.isInEmptyBar = false;
                    this.emptyBarClickCount = 0;
                    this.currentStrokeIndex = 0;
                    this.highlightStroke(this.currentStrokeIndex);
                    this.currentStrokeIndex += this.calculateStrokeStep();
                    this.currentBarIndex = Math.floor(this.currentStrokeIndex / (this.getTimeSignatureSettings().beatsPerBar * patternTempo.subdivision));
                    this.highlightBar(this.currentBarIndex);
                    this.updateStatusForExercise();
                    // Switch to exercise interval
                    this.switchToExerciseInterval();
                }
            } else {
                // Normal exercise highlighting with dynamic stroke step
                this.highlightStroke(this.currentStrokeIndex);
                this.currentStrokeIndex += this.calculateStrokeStep();
                this.highlightBar(this.currentBarIndex);
                this.currentBarIndex = Math.floor(this.currentStrokeIndex / (this.getTimeSignatureSettings().beatsPerBar * patternTempo.subdivision));
                
                // Check if we've completed the exercise
                if (this.currentStrokeIndex > this.totalStrokes) {
                    // Exercise complete, enter rest bar
                    this.clearAllHighlights();
                    this.isInEmptyBar = true;
                    this.emptyBarClickCount = 1;
                    this.updateStatusForRestBar();
                    // Switch to empty bar interval
                    this.switchToEmptyBarInterval();
                }
            }
        }
        if (this.isPreparationBar) {
            this.playPreparationClick();
        } else if (this.isInEmptyBar) {
            this.playPreparationClick();
        } else {
            this.playExerciseClick();
        }
    },
    
    // Create click sound using Web Audio API - for preparation and rest bars
    playPreparationClick: function() {
        this.initAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Create a softer, lower pitched click sound for preparation/rest
        oscillator.frequency.value = 600; // 600 Hz frequency (lower than exercise)
        oscillator.type = 'sine';
        
        // Gentler attack and decay for preparation sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.12);
    },

    // Create click sound using Web Audio API - for exercise bars
    playExerciseClick: function() {
        this.initAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a sharper, higher pitched click sound for exercise
        oscillator.frequency.value = 1000; // 1000 Hz frequency (higher than preparation)
        oscillator.type = 'triangle'; // Different waveform for distinction

        // Sharp attack and decay for exercise sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.35, this.audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    },

    start: function() {
        if (this.isPlaying) return;

        this.initAudioContext();
        
        // Resume audio context if it's suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Get BPM from input field
        const bpmInput = document.getElementById('bpm');
        const bpm = parseInt(bpmInput.value);
        
        // Validate BPM range
        if (bpm < 30 || bpm > 250 || isNaN(bpm)) {
            alert('Please enter a valid BPM between 30 and 250');
            return;
        }

        // Get structure settings and calculate intervals
        const structureSettings = this.getStructureSettings();
        const timeSignatureSettings = this.getTimeSignatureSettings();
        this.clicksPerBar = this.getClicksPerBar();
        this.emptyBarClicksPerBar = timeSignatureSettings.beatsPerBar;
        
        // BPM is quarter notes, calculate intervals
        const quarterNoteInterval = 60000 / bpm; // Quarter note interval in ms

        this.isPlaying = true;
        
        // Initialize highlighting system with preparation bar
        this.updateTotalStrokes();
        this.currentStrokeIndex = 0;
        this.isInEmptyBar = false;
        this.isPreparationBar = true;
        this.emptyBarClickCount = 0;
        
        // Set initial status for preparation
        this.updateStatusForPreparationBar();
        
        
        if (document.getElementById("exercise-div").innerHTML === "") {
            // If no exercise is generated, just play some clicks
            this.playPreparationClick();

            // Start interval for subsequent clicks (quarter note interval for preparation bar)
            this.metronomeInterval = setInterval(() => {
                this.playPreparationClick();
            }, quarterNoteInterval);
        } else {
            // Play first click of preparation bar
            this.playClickAndHighlight();
            

            // Start interval for subsequent clicks (quarter note interval for preparation bar)
            this.metronomeInterval = setInterval(() => {
                this.playClickAndHighlight();
            }, quarterNoteInterval);
        }
    },

    stop: function() {    
        if  (!this.isPlaying) return;
        this.isPlaying = false;

        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
        
        // Clear all highlights and reset state
        this.clearAllHighlights();
        this.currentStrokeIndex = 0;
        this.isInEmptyBar = false;
        this.isPreparationBar = false;
        this.emptyBarClickCount = 0;
        
        document.getElementById('metronome-status').textContent = 'Stopped';
    }
}
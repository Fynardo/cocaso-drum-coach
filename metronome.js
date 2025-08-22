import { Logger } from './logger.js';

export const Metronome = {
    audioContext: null,
    metronomeInterval: null,
    isPlaying: false,
    currentIndex: 0,
    maxIndex: 0,
    schedulerInterval: 0,
    highlightOnClick: false,
    msPerMinute: 60000,
    bpm: 0,
    quarterNoteInterval: 0,
    currentBar: 0,
    beatsPerBar: 0,
    quartersPerBar: 0,

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

    notesRatios: function(patternTempo, metronomeTempo) {
        const ratios = {
            "crotchet": {
                "crotchet": 1,
                "quaver": null,
                "semiquaver": null
            },
            "quaver": {
                "crotchet": 2,
                "quaver": 1,
                "semiquaver": null
            },
            "semiquaver": {
                "crotchet": 4,
                "quaver": 2,
                "semiquaver": 1
            }
        }
        return ratios[patternTempo][metronomeTempo];
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
        return structureSelect.value;
    },
    
    // Get current pattern tempo settings
    getPatternTempoSettings: function() {
        const patternTempoSelect = document.getElementById('pattern-tempo');
        return patternTempoSelect.value;
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

        if (index !== false) {
            this.currentBar = Math.floor(index / this.beatsPerBar);          
        }
        
        this.highlightBar(this.currentBar);
    },
    
    clearAllHighlights: function() {
        const highlighted = document.querySelectorAll('.stroke-highlight');
        highlighted.forEach(element => {
            element.classList.remove('stroke-highlight');
        });
    },
    
    refresh: function() {
        const patternSettings = this.getPatternTempoSettings();
        const bpmInput = document.getElementById('bpm');
        const timeSig = this.getTimeSignatureSettings().beatsPerBar;
        this.bpm = parseInt(bpmInput.value);
        this.quarterNoteInterval = this.msPerMinute / this.bpm;
        this.schedulerInterval = this.quarterNoteInterval / this.notesRatios(patternSettings, "crotchet");
        this.quartersPerBar = this.notesRatios(patternSettings, "crotchet");
        this.beatsPerBar = timeSig * this.quartersPerBar;
    },

    loadExercise: function(pattern) {
        this.refresh();
        this.highlightOnClick = document.getElementById('highlight-on-click').checked;
        const patternSettings = this.getPatternTempoSettings();
        const metronomeSettings = this.getStructureSettings();
        const schedulerHits = pattern.length;

        this.clicks = [];
        this.highlights = [];
        // Preparation bar
        for (let i = 0; i < this.beatsPerBar; i++) {
            if (i % this.quartersPerBar == 0) {
                this.clicks.push('prepClick');
            } else {
                this.clicks.push(false);
            }
            this.highlights.push(false); // No highlighting on preparation bar
        }

        for (let i = 0; i < schedulerHits; i++) {
            const isClick = i % this.notesRatios(patternSettings, metronomeSettings) == 0;
            if (isClick && pattern[i] !== '-') {
                this.clicks.push('click');
                this.highlights.push(i);
            } else {
                this.clicks.push(false);
                if (this.highlightOnClick) {
                    this.highlights.push(false); 
                } else {
                    this.highlights.push(i);
                }
            }
        }
        this.maxIndex = this.clicks.length;
        Logger.debug("Metronome", "Max index: " + this.maxIndex);
        Logger.debug("Metronome", "Clicks: " + this.clicks);
        Logger.debug("Metronome", "Highlights: " + this.highlights);
    },

    playClick: function(clickType) {
        if (clickType === 'prepClick') {
            this.playPreparationClick();
        } else if (clickType === 'click') {
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
        
        // Validate BPM range
        if (this.bpm < 30 || this.bpm > 250 || isNaN(this.bpm)) {
            alert('Please enter a valid BPM between 30 and 250');
            return;
        }

        this.isPlaying = true;    
        
        if (document.getElementById("exercise-div").innerHTML === "") {
           console.log("Not implemented yet")
        } else {
            this.metronomeInterval = setInterval(() => {            
                this.playClick(this.clicks[this.currentIndex]);
                this.highlightStroke(this.highlights[this.currentIndex]);
                this.currentIndex++;
                if (this.currentIndex >= this.maxIndex) {
                    this.currentIndex = 0;
                }
            }, this.schedulerInterval);
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
        this.currentIndex = 0;
        this.currentBar = 0;
    }
}
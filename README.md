# Cocaso Drum Coach

**Cocaso Drum Coach** (from now on **CDC**) is a simple, lightweight, yet powerful drum practice tool designed to help myself (and hopefully others!) to learn and practice the beautiful art of drumming. It includes common paradiddles and rudiments as well as random pattern generation and integrated metronome functionality to make it enough by itself, no external stuff.

## What CDC is and what it isn't

### It is:

* A simple app that I can just open anywhere, generate some patterns, grab my practice pad and **practice**.

### It isn't:

* A fully capable or dreamed drummer 'companion' app
* Something that can show or read staff notation
* Something that probably no professional drummer may find useful (and that's fine)

## Technology

Built with **good old plain HTML, JavaScript, and CSS** - no frameworks or external dependencies required! This ensures maximum compatibility and performance.

## Features

### 🥁 Pattern Generation
- **Stroke Types**: Support for R (Right), L (Left), K (Kick), r (right ghost), l (left ghost), - (Mute, no stroke)
- **Predefined Patterns**: Paradiddle, Paradiddle Left, Double Paradiddle, Single Beat, Single Beat Left
- **Random Pattern Generator**: Create custom patterns with configurable length
- **Repository of predefined exercises**: Load one of the exercises and you are all set.
- **Exercise Editor**: Using our own lovely syntax, create practice exercises with all the strokes you want.
- **Interactive Strokes**: Click on any stroke in the display to cycle through different options, great for quick fixes.

### 🎵 Integrated Metronome
- **Multiple Structures**: Crotchet (4 clicks), Quaver (8 clicks), Semiquaver (16 clicks per bar)
- **BPM Range**: 30-250 BPM with real-time adjustment
- **Smart Timing**: Preparation bars, exercise playback, and rest bars between cycles
- **Visual Feedback**: Real-time stroke highlighting during practice
- **Keyboard Control**: Spacebar to start/stop metronome

### 💡 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Copy Exercise**: One-click copying of generated patterns
- **Customizable Practice**: Select specific strokes and configure bar lengths
- **Visual Stroke Coding**: Color-coded strokes for easy reading
- **Light And Dark Theme**: For those after-hours practice sessions

## Roadmap

Things I would like to add to better serve as a practice companion. Implementing these will depend on a tradeoff of their complexity, the value I can get from them from a learning perspective and the fact that they match the intention of the app.

* Better UX, specially in portable devices like phones and tablets. Think of starting / stopping the metronome by tapping the screen, not cropping the exercise view, and such.
* Import exercises. Just copy & paste a pattern and create a working exercise from it. The app will automatically add all the cool features (metronome highlighting, strokes rotation, etc)
* Make '3-line' exercises display (one for each type of stroke: R, L, K) Thus, it would be possible to define exercises that hit multiple strokes at once (like R+K, R+L, and so on)
* More 'structures' like triplets and other complex rhythms (e.g. mix quavers and crotchets).


## Device Compatibility

Works on **any device** as long as it runs basic JavaScript, including:
- Desktop computers (Windows, Mac, Linux)
- Smartphones (iOS, Android)
- Tablets
- Any modern web browser

## Getting Started

1. **Open**: Head to https://fynardo.github.io/cocaso-drum-coach/ in any web browser.
2. **Practice**: Generate patterns and start practicing with the metronome!
3. That's it


## Usage

1. **Select Pattern**: Choose from predefined patterns or select "Random"
2. **Configure**: Set number of bars, stroke types, and random length
3. **Generate**: Click "Generate Exercise" to create your practice pattern
4. **Practice**: Use the integrated metronome to practice your exercise
5. **Customize**: Click on individual strokes to modify them during practice

## Files Structure

```
cocaso-drum-coach/
├── index.html           # Main HTML file
├── style.css            # Main stylesheet
├── main.js              # App logic and UI handlers
├── exercise.js          # Exercise generation logic
├── metronome.js         # Metronome engine
├── theme.js             # Theme switching logic
└── README.md            # This file
```

## Authors

- **Fynardo** - Project creator and developer
- **Claude** - AI assistant and co-developer

## Version

v.1.0.0

---

*Happy drumming! 🥁* 

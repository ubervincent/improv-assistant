# Improv Assistant

A real-time guitar improvisation practice tool built with Next.js. It listens to your playing, visualizes notes on a fretboard, and helps you practice over custom chord progressions.

Deployed at: https://improv-assistant-6k36.vercel.app/

## Features

- **Real-time Pitch Detection**: Uses ML5.js (CREPE model) to detect guitar notes with low latency.
- **Fretboard Visualizer**: Maps played notes to a virtual fretboard, highlighting "safe notes" for the current chord.
- **Chord Sequencer**: Build custom backing tracks with a smart chord builder (diatonic chords & custom extensions).
- **Quick Presets**: Instantly load 12-Bar Blues or 2-5-1 Jazz progressions.
- **Metronome**: Built-in metronome with adjustable BPM and time signatures (4/4, 3/4, 6/8).
- **Customizable**: Adjustable sensitivity, input device selection, and visual settings.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Audio**: Tone.js (Synthesis & Timing), ML5.js (Pitch Detection)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ubervincent/improv-assistant.git
    cd improv-assistant
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com).

**Important**: This application requires **HTTPS** to access the microphone. Vercel provides this automatically. If self-hosting, ensure you have SSL configured.

## License

MIT

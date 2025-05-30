# Transcriber - Speech-to-Text Application

Transcriber is an Electron-based application for converting speech to text using faster-whisper models. It provides a user-friendly interface for transcribing audio files, editing transcripts, and exporting results in various formats.

## Features

- **Audio Transcription**: Convert audio files to text transcripts
- **Multi-language Support**: Supports 100+ languages with auto-detection
- **Quality Settings**: Choose from tiny (fastest) to large (best) models
- **Speaker Detection**: Adjustable speaker sensitivity for better separation
- **Transcript Editing**: 
  - Add, delete, and edit transcript segments
  - Insert manual segments
  - Adjust speaker labels
- **Audio Playback**:
  - Play entire audio or specific segments
  - Timeline navigation
  - Audio trimming capabilities
- **Export Formats**:
  - Text (TXT)
  - SubRip (SRT)
  - CSV
  - JSON
- **Multi-file Processing**: Process multiple files simultaneously

## Technology Stack

- **Frontend**: 
  - React + TypeScript
  - Vite build system
  - Electron for desktop application
- **Backend Processing**:
  - Python 3
  - faster-whisper library
- **Build Tools**:
  - electron-builder for packaging
  - Vite plugins for Electron integration

## Prerequisites

- Node.js (v18+)
- Python 3.9+
- FFmpeg (for audio processing)
- System Requirements:
  - 4GB RAM minimum (8GB recommended)
  - 2GB disk space for models

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/transcriber.git
cd transcriber
```

2. Install dependencies:
```bash
npm install
```

3. Set up Python environment:
```bash
cd Transcriber/python_env
pip install faster-whisper huggingface_hub[hf_xet]
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Use the application:
- Click "Add Files" to select audio files for transcription
- Select language and quality settings
- Monitor progress in the jobs list
- Edit transcripts as needed
- Export results in desired format

## Build and Distribution

To create distributable packages:

```bash
npm run build
```

Build outputs will be in the `release` directory with platform-specific installers.

## Project Structure

```
Transcriber/
├── electron/              # Electron main process code
│   ├── main.ts            # Main process entry point
│   └── preload.ts         # Preload script for IPC
├── python_env/            # Python transcription scripts
│   ├── transcribe.py      # Main transcription script
│   └── gemini_process.py  # Optional Gemini processing
├── src/                   # React application source
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   └── ...                # Other components and styles
├── public/                # Static assets
├── dist/                  # Built frontend assets
├── dist-electron/         # Built Electron assets
├── package.json           # NPM dependencies and scripts
├── electron-builder.json5 # Build configuration
└── vite.config.ts         # Vite configuration
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature/fix
3. Commit your changes
4. Submit a pull request with a clear description

Please ensure all code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

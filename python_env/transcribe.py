import sys
import json
import subprocess
import os
import argparse # Import argparse

def main():
    # Add Homebrew bin to PATH (if installed)
    homebrew_bin = "/opt/homebrew/bin"
    if os.path.exists(homebrew_bin):
        os.environ["PATH"] = homebrew_bin + ":" + os.environ["PATH"]
        print(f"Added {homebrew_bin} to PATH", file=sys.stderr)
    
    print(f"Using Python interpreter: {sys.executable}", flush=True)
    
    # Additional system diagnostics
    import platform
    print(f"System: {platform.system()} {platform.release()}", flush=True)
    print(f"Machine: {platform.machine()}", flush=True)
    print(f"Python implementation: {platform.python_implementation()}", flush=True)

    # Setup argument parser
    parser = argparse.ArgumentParser(description="Transcribe audio using faster-whisper.")
    parser.add_argument("input_audio", help="Path to the input audio file.")
    parser.add_argument("output_json", help="Path to the output JSON file.")
    parser.add_argument("--language", help="Target language code (e.g., 'en', 'es'). Auto-detect if omitted.", default=None)
    parser.add_argument("--model_size", help="Whisper model size (e.g., 'tiny', 'base', 'small', 'medium', 'large-v3').", default="large-v3")
    parser.add_argument("--speaker_sensitivity", help="Speaker separation sensitivity (0.0 to 1.0)", type=float, default=0.5)

    args = parser.parse_args()

    input_audio = args.input_audio
    output_json = args.output_json
    target_language = args.language
    model_size = args.model_size # Get model_size from args

    # Ensure dependencies are installed
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("Installing required dependencies...", file=sys.stderr)
        
        # Diagnostic checks for system dependencies
        print("=== DIAGNOSTIC: Checking system dependencies ===", file=sys.stderr)
        # Check for pkg-config
        try:
            result = subprocess.run(["pkg-config", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ pkg-config found: {result.stdout.strip()}", file=sys.stderr)
            else:
                print("✗ pkg-config command failed", file=sys.stderr)
        except FileNotFoundError:
            print("✗ pkg-config NOT FOUND - this is required for building PyAV", file=sys.stderr)
            print("  Install with: brew install pkg-config", file=sys.stderr)
        
        # Check for FFmpeg
        try:
            result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ FFmpeg found", file=sys.stderr)
            else:
                print("✗ FFmpeg command failed", file=sys.stderr)
        except FileNotFoundError:
            print("✗ FFmpeg NOT FOUND - this may be required for PyAV", file=sys.stderr)
            print("  Install with: brew install ffmpeg", file=sys.stderr)
        
        # Check for Xcode Command Line Tools
        try:
            result = subprocess.run(["xcode-select", "--print-path"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ Xcode Command Line Tools found: {result.stdout.strip()}", file=sys.stderr)
            else:
                print("✗ Xcode Command Line Tools may not be properly configured", file=sys.stderr)
        except FileNotFoundError:
            print("✗ Xcode Command Line Tools NOT FOUND", file=sys.stderr)
            print("  Install with: xcode-select --install", file=sys.stderr)
        
        # Check Python and pip versions
        print(f"✓ Python version: {sys.version}", file=sys.stderr)
        try:
            result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ pip version: {result.stdout.strip()}", file=sys.stderr)
        except Exception as e:
            print(f"✗ pip check failed: {e}", file=sys.stderr)
        
        print("=== END DIAGNOSTIC ===", file=sys.stderr)
        
        # Check if critical dependencies are missing
        pkg_config_missing = False
        try:
            subprocess.run(["pkg-config", "--version"], capture_output=True, check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            pkg_config_missing = True
        
        if pkg_config_missing:
            print("ERROR: pkg-config is required but not found.", file=sys.stderr)
            print("Please install it first: brew install pkg-config", file=sys.stderr)
            print("You may also need: brew install ffmpeg", file=sys.stderr)
            sys.exit(1)
        
        # Install both faster-whisper and huggingface_hub with hf_xet
        subprocess.check_call([sys.executable, "-m", "pip", "install", "faster-whisper", "huggingface_hub[hf_xet]", "--trusted-host", "pypi.org", "--trusted-host", "files.pythonhosted.org"])
        from faster_whisper import WhisperModel

    print("Initializing Whisper model...", flush=True)
    try:
        print(f"Initializing Whisper model ({model_size})...", flush=True) # Use model_size in log
        # Use the specified model size
        # Specify compute_type as float32 explicitly to avoid warnings
        model = WhisperModel(model_size, # Use model_size variable
                           device="cpu",
                           compute_type="float32",
                           cpu_threads=4,  # Adjust based on available CPU cores
                           num_workers=2)  # Reduce worker threads for stability
        print("Model initialized successfully", flush=True)
    except Exception as e:
        print(f"Error initializing model ({model_size}): {str(e)}", file=sys.stderr) # Use model_size in log
        sys.exit(1)  # Exit cleanly instead of raising

    # Initialize segments list
    transcript_segments = []

    print("Transcribing audio...", flush=True)
    try:
        import signal
        import threading
        import time

        # Start progress reporting in a separate thread
        progress_stop = threading.Event()
        def progress_reporter():
            progress = 0
            while not progress_stop.is_set() and progress < 95:
                time.sleep(5)  # Update every 5 seconds
                progress += 5
                print(f"PROGRESS {progress}", flush=True)

        progress_thread = threading.Thread(target=progress_reporter)
        progress_thread.daemon = True
        progress_thread.start()

        try:
            try:
                # Handle language detection or use specified language
                if target_language is None:
                    # Auto-detect language
                    segments_detect, info = model.transcribe(
                        input_audio,
                        language=None,
                        beam_size=1,
                        condition_on_previous_text=False
                    )
                    detected_lang = info.language
                    print(f"Detected language: {detected_lang} with probability {info.language_probability:.2f}", flush=True)
                else:
                    detected_lang = target_language
                    print(f"Using specified language: {detected_lang}", flush=True)

                # Then transcribe with the detected language
                segments, info = model.transcribe(
                    input_audio,
                    language=detected_lang,  # Use detected language
                    beam_size=1,  # Reduce beam size for faster processing
                    word_timestamps=True,
                    initial_prompt="The following is a transcription of a conversation.",
                    vad_filter=True,  # Enable voice activity detection
                    vad_parameters={
                        "min_silence_duration_ms": max(100, int(500 * (2 - args.speaker_sensitivity))),  # Ensure minimum silence duration
                        "speech_pad_ms": max(50, int(1000 * (1 - args.speaker_sensitivity)))  # Ensure minimum padding
                    },
                    temperature=0.0,  # Reduce randomness
                    best_of=1,  # Use only top result
                    repetition_penalty=1.1,  # Add repetition penalty to reduce repeated segments
                    no_repeat_ngram_size=2  # Prevent repeating n-grams
                )
            except Exception as e:
                print(f"Transcription error details: {str(e)}", file=sys.stderr)
                if hasattr(e, '__traceback__'):
                    import traceback
                    traceback.print_exc(file=sys.stderr)
                sys.exit(1)
        finally:
            # Stop progress reporting
            progress_stop.set()
            progress_thread.join(timeout=1)
    except Exception as e:
        print(f"Error during transcription: {str(e)}", file=sys.stderr)
        sys.exit(1)
    
    # Convert segments to our format and filter duplicates
    seen_segments = set()
    for segment in segments:
        # Create a unique identifier for the segment based on timing and text
        segment_id = (round(segment.start, 2), round(segment.end, 2), segment.text.strip())
        
        # Skip if we've already seen this exact segment
        if segment_id not in seen_segments:
            seen_segments.add(segment_id)
            transcript_segments.append({
                "start": segment.start,
                "end": segment.end,
                "speaker": "Speaker",
                "text": segment.text.strip()
            })
        else:
            print(f"[Filter] Skipping duplicate segment: {segment.text[:50]}...", file=sys.stderr)

    try:
        import tempfile
        import shutil

        # Write to a temporary file first
        temp_file = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.json', delete=False) as temp:
                temp_file = temp.name
                json.dump(transcript_segments, temp, ensure_ascii=False, indent=2)
            
            # Move the temp file to the final destination
            shutil.move(temp_file, output_json)
            print(f"Wrote {len(transcript_segments)} segments to {output_json}", flush=True)
            print("DONE", flush=True)
        except Exception as e:
            print(f"Error writing output file: {str(e)}", file=sys.stderr)
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass  # Ignore cleanup errors
            sys.exit(1)
    except Exception as e:
        print(f"Error during file operations: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

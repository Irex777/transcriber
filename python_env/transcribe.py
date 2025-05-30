import sys
import json
import subprocess
import argparse # Import argparse

def main():
    print(f"Using Python interpreter: {sys.executable}", flush=True)

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
        # Install both faster-whisper and huggingface_hub with hf_xet
        subprocess.check_call([sys.executable, "-m", "pip", "install", "faster-whisper", "huggingface_hub[hf_xet]"])
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
                        "min_silence_duration_ms": int(500 * (2 - args.speaker_sensitivity)),  # Adjust silence threshold based on sensitivity
                        "speech_pad_ms": int(1000 * (1 - args.speaker_sensitivity))  # Adjust padding based on sensitivity
                    },
                    temperature=0.0,  # Reduce randomness
                    best_of=1  # Use only top result
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
    
    # Convert segments to our format
    for segment in segments:
        transcript_segments.append({
            "start": segment.start,
            "end": segment.end,
            "speaker": "Speaker",
            "text": segment.text
        })

    try:
        import tempfile
        import os
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

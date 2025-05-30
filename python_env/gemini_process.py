import sys
import json
from google.ai import generativelanguage as glm
import google.generativeai as genai
import argparse
import os # Import os to potentially read API key from env as fallback if needed

# Define available models (Updated to include only 2.0 and above)
# IMPORTANT:  Consult the Gemini API documentation for a complete and up-to-date list of available models.
AVAILABLE_MODELS = ["gemini-2-pro-latest", "gemini-2-flash-latest"]

def process_transcript(transcript, gemini_api_key, model_name="gemini-2-flash-latest"): # Default to 2 flash for speed
    """Processes transcript segments using the specified Gemini model."""
    print(f"[Gemini Script] Using model: {model_name}")
    try:
        # Configure the Gemini API client
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel(model_name)
    except Exception as e:
        print(f"Error configuring Gemini client or model '{model_name}': {str(e)}", file=sys.stderr)
        # Return original transcript if model setup fails
        return transcript

    # Process each segment individually
    processed_segments = []
    
    for segment in transcript:
        # Construct the prompt
        prompt = f"""
        Please improve this transcript segment by:
        1. Fixing any grammar or spelling errors
        2. Maintaining natural speech patterns while removing filler words
        3. Preserving the core meaning and speaker's intent
        
        Original text: {segment['text']}
        """

        try:
            response = model.generate_content(prompt)
            # Get the improved text from the response
            improved_text = response.text.strip().strip('"\'')
            
            # Create new segment with improved text but keep original timing and speaker
            processed_segments.append({
                "start": segment["start"],
                "end": segment["end"],
                "speaker": segment["speaker"],
                "text": improved_text
            })
        except Exception as e:
            print(f"Error processing segment: {str(e)}", file=sys.stderr)
            # If there's an error, keep the original text
            processed_segments.append(segment)
            
    return processed_segments

def main():
    parser = argparse.ArgumentParser(description="Process transcript with Gemini.")
    parser.add_argument("input_json", help="Path to the input JSON transcript file")
    parser.add_argument("output_json", help="Path to the output JSON file for processed transcript")
    parser.add_argument("api_key", help="Gemini API key")
    # Updated choices and default to 2.5 models
    parser.add_argument("--model_name", help="Name of the Gemini model to use", default="gemini-2.5-flash-latest", choices=AVAILABLE_MODELS)

    args = parser.parse_args()

    try:
        # Read the original transcript
        with open(args.input_json, 'r', encoding='utf-8') as f:
            transcript = json.load(f)

        # Process the transcript using the specified model
        processed_transcript = process_transcript(transcript, args.api_key, args.model_name)

        # Write the processed transcript
        with open(args.output_json, 'w', encoding='utf-8') as f:
            json.dump(processed_transcript, f, ensure_ascii=False, indent=2)
            
        print("DONE", flush=True)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

import subprocess
import sys
import os

def is_sdk_installed():
    try:
        import nexaai
        return True
    except ImportError:
        return False

def install_requirements():
    print("Installing requirements...")
    env = os.environ.copy()
    env["CMAKE_ARGS"] = "-DGGML_METAL=ON"
    
    # Install NexaAI SDK
    print("Installing NexaAI SDK with Metal support...")
    cmd = [
        sys.executable, "-m", "pip", "install", "nexaai",
        "--prefer-binary",
        "--index-url", "https://nexaai.github.io/nexa-sdk/whl/metal",
        "--extra-index-url", "https://pypi.org/simple",
        "--no-cache-dir"
    ]
    subprocess.check_call(cmd, env=env)
    
    # Install additional dependencies
    print("Installing additional dependencies...")
    cmd = [
        sys.executable, "-m", "pip", "install", "diskcache"
    ]
    subprocess.check_call(cmd)

def setup_model():
    try:
        from nexaai.gguf.nexa_inference_voice import NexaVoiceInference
        import os
        
        # Setup model paths
        model_dir = os.path.expanduser("~/.cache/nexa/hub/official/OmniAudio-2.6B")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "model-q4_K_M.gguf")
        
        print(f"Initializing model at {model_path}...")
        # First try with repo format
        print("First checking model...")
        model = NexaVoiceInference(
            model_path="official/omniaudio",
            model_type="voice",
            repo_type="hub",
            model_size="large-v3"
        )
        print("Model initialization successful")
        return True
    except Exception as e:
        print(f"Error initializing model: {str(e)}", file=sys.stderr)
        return False

def main():
    if not is_sdk_installed():
        install_requirements()
    else:
        print("NexaAI SDK already installed, checking dependencies...")
        try:
            import diskcache
        except ImportError:
            print("Installing additional dependencies...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "diskcache"])

    # Setup the model
    if not setup_model():
        print("Failed to setup the model", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

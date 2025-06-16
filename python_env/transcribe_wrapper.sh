#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Activate the virtual environment
source "$DIR/venv/bin/activate"

# Run the transcribe.py script with all arguments passed to this wrapper
python "$DIR/transcribe.py" "$@"
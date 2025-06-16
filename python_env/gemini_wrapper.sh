#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Activate the virtual environment
source "$DIR/venv/bin/activate"

# Run the gemini_process.py script with all arguments passed to this wrapper
python "$DIR/gemini_process.py" "$@"
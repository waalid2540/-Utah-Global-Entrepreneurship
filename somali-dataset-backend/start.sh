#!/bin/bash

echo "🚀 Starting Somali AI Dataset Backend..."

# Install requirements
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Start the API server
echo "🌐 Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API documentation: http://localhost:8000/docs"

python3 main.py
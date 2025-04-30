#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Update package list and install dependencies
echo ">>> Installing system dependencies..."
apt-get update -y && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libpixman-1-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev

# Install Node.js dependencies
echo ">>> Installing Node.js dependencies..."
npm install

# Run the build command
echo ">>> Running build command..."
npm run build

# Generate sitemap
echo ">>> Generating sitemap..."
npm run sitemap

echo ">>> Build script finished."
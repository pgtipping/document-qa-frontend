#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Update package list and install dependencies using yum
echo ">>> Installing system dependencies using yum..."
if yum update -y && yum install -y \
  gcc \
  gcc-c++ \
  make \
  cairo-devel \
  pango-devel \
  pixman-devel \
  libjpeg-turbo-devel \
  giflib-devel \
  librsvg2-devel; then
  echo ">>> System dependencies installed successfully."
else
  echo ">>> Failed to install system dependencies using yum."
  exit 1 # Exit script if dependencies fail
fi

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
FROM node:22-slim

# Install system dependencies (Python3, FFmpeg, and curl)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python-is-python3 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install Node modules
RUN npm ci

# Copy application files
COPY . .

# Build Next.js application
RUN npm run build

# Expose production port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start production server
CMD ["npm", "start"]

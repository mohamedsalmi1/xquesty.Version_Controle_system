FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY . .

# Set development mode initially
ENV NODE_ENV=development

# Set host to listen on all interfaces
ENV HOST=0.0.0.0

# Default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:3000/api/health || exit 

# Start server
CMD ["node", "index.js"]

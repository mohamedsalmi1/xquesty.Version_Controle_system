FROM node:18-alpine

WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./
RUN npm install --production

# Copy backend source
COPY . .

# Expose backend port
EXPOSE 3000

# Run backend
CMD ["node", "index.js"]

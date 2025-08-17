# StageQuest

## Docker Deployment Instructions

### Prerequisites
- Node.js (v14 or later)
- Docker and Docker Compose

### Building and Deploying the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the frontend**:
   ```bash
   node build-script.js
   ```
   Or directly:
   ```bash
   npm run build
   ```

3. **Start the Docker containers**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   Open your browser and go to http://localhost

### Troubleshooting

If you see an error page saying "Missing frontend build files!", follow these steps:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose up -d --build
   ```

### Development Mode

For local development without Docker:
```bash
npm run dev
```

For development with Docker:
```bash
docker-compose -f docker-compose.local.yml up -d
```

### Environment Variables

Create a `.env` file in the project root with these variables:
```
VITE_STUDENT_SUPABASE_URL=your_supabase_url
VITE_STUDENT_SUPABASE_ANON_KEY=your_supabase_key
REACT_APP_AZURE_CLIENT_ID=your_azure_client_id
REACT_APP_AZURE_TENANT_ID=your_azure_tenant_id
```

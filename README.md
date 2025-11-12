<!-- AI Assistance Disclosure:
# Tool: GitHub Copilot (model: claude-sonnet-4.5), date: 2025-11-12
# Scope: Generated the deployment instructions based on docker compose file.
# Author review: I edited the generated outputs and checked them for accuracy -->

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)

# CS3219 Project (PeerPrep) - AY2526S1

## Group: G07

### Note

- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

---

## Deployment Guide

### Prerequisites

- [Docker](https://www.docker.com/get-started) (or [Docker Engine](https://docs.docker.com/engine/install/) if deploying on a VM in production)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A PostgreSQL database (can be hosted on GCP Cloud SQL/AWS RDS/[Neon](https://neon.com/))
- A GitHub personal access token with `read:packages` permission to pull Docker images
- Gemini API key from <https://aistudio.google.com/api-keys> for AI service

### Step 1: Configure Access to GitHub Container Registry (GHCR)

Refer to the GHCR documentation here: <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry>

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Gemini API Key (required for AI service)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (required for user service)
JWT_SECRET=your_jwt_secret_here

# Better Auth Secret (required for user service)
BETTER_AUTH_SECRET=your_better_auth_secret_here

# Database URL (required for user and question services)
# Format: postgres://username:password@host:port/database
DATABASE_URL=postgres://username:password@host:port/database

# Kafka Brokers (default configuration)
# Point to the kafka container
KAFKA_BROKERS=kafka:9092

# Password to access Kafka UI
KAFKA_UI_PASSWORD=your_password
```

### Step 3: Initialize the Database

Before starting the services, you need to initialize your PostgreSQL database:

1. Connect to your PostgreSQL instance
2. Create a database for the application, or use the default `postgres` database
3. Run the initialization scripts:

```bash
# Run the database initialization script
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f db/init.sql

# Seed the questions
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f db/seed-questions.sql
```

### Step 4: Deploy the Application

```bash
# Pull the latest images
docker-compose -f docker-compose.prod.yml pull

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

### Step 5: Verify Deployment

Check that all services are running:

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs for any errors
docker-compose -f docker-compose.prod.yml logs
```

The application should now be accessible at:

- **Frontend**: `http://localhost` (port 80)
- **Kafka UI**: `http://localhost:8080/kafkaui`
- **User Service**: `http://localhost:5002`
- **Question Service**: `http://localhost:5001`
- **Matching Service**: `http://localhost:5003`
- **Collab Service**: `http://localhost:5004`
- **AI Service**: `http://localhost:5005`

### Step 6: Access the Application

Open your web browser and navigate to `http://localhost` to access PeerPrep.

You can also access the Kafka UI at `http://localhost/kafkaui`.

### Stopping the Application

To stop all services:

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## AI Use Summary

AI tools (GitHub Copilot) are used in this project.

The interactions with the AI tools (prompts and outputs) are recorded in /ai/usage-log.md.

All AI outputs have been reviewed, tested, and verified by the authors.

- [x] Requirements and architecture created without AI.
- [x] AI used only for implementation/debugging/refactoring/docs.
- [x] All AI-influenced files have header attributions.
- [x] README/report includes the project-level AI use summary.
- [x] Prompts and key outputs archived in /ai/usage-log.md.
- [x] All AI outputs reviewed, tested, and verified by the authors.

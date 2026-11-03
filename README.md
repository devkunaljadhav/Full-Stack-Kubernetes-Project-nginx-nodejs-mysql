# Full-Stack Kubernetes Project on AWS

A production-style three-tier Kubernetes application deployed on AWS, built around a React frontend, Node.js backend, and MySQL database. The project demonstrates containerization, service discovery, ingress routing, secrets management, and persistent storage in a Kubernetes environment.

## Architecture Overview

The solution follows a three-tier architecture:

- Frontend layer: React + Vite, served by NGINX
- Backend layer: Node.js + Express API
- Data layer: MySQL running as a StatefulSet with persistent storage

Traffic flow:

```text
User Browser
   ↓
Ingress Controller
   ↓
Frontend Service
   ↓
NGINX Frontend Pod
   ↓
Backend Service
   ↓
Node.js Backend Pod
   ↓
MySQL StatefulSet
   ↓
PVC → PV
```

## Tech Stack

- Kubernetes
- Docker
- AWS
- React
- Vite
- NGINX
- Node.js
- Express.js
- MySQL 8.0
- kubectl

## Repository Structure

```text
Full-Stack-Kubernetes-Project-nginx-nodejs-mysql/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend-react/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── frontend/                  # Original static HTML prototype; not used by React deployment
├── k8s/
│   ├── backend-deployment.yml
│   ├── backend-service.yml
│   ├── configmap.yml
│   ├── frontend-deployment.yml
│   ├── frontend-service.yml
│   ├── ingress.yml
│   ├── mysql-headless.yml
│   ├── mysql-statefulset.yml
│   ├── namespace.yml
│   └── secret.yml
├── Database/
│   └── database-create.txt
├── Doc
├── Kubernetes AWS Complete Architecture Flow.png
├── README.md
└── .gitignore
```

## Features

- Containerized frontend and backend deployment
- MySQL persistence with StatefulSet + PVC
- Secrets and ConfigMaps for configuration
- Internal Kubernetes service communication
- External routing using NGINX Ingress
- AWS-based Kubernetes deployment model
- Simple employee dashboard application

## Prerequisites

Before starting, install:

- Docker
- Node.js and npm
- kubectl
- Access to a Kubernetes cluster on AWS

## Quick Start

### 1. Create namespace

```bash
kubectl apply -f k8s/namespace.yml
```

### 2. Apply ConfigMap and Secret

```bash
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml
```

### 3. Deploy MySQL database

```bash
kubectl apply -f k8s/mysql-headless.yml
kubectl apply -f k8s/mysql-statefulset.yml
```

### 4. Initialize the database

```bash
kubectl exec -it mysql-0 -n production -- bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE company;
USE company;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

INSERT INTO employees(name)
VALUES ('Reyaz'), ('Suman');

INSERT INTO employees(name)
VALUES ('Jack'), ('Mike');
```

### 5. Build and push Docker images

```bash
cd backend
docker build -t backend:v1 .
docker tag backend:v1 trainerreyaz/backend:v1
docker push trainerreyaz/backend:v1

cd ../frontend-react
npm install
npm run build
docker build -t frontend:v1 .
docker tag frontend:v1 trainerreyaz/frontend:v1
docker push trainerreyaz/frontend:v1
```

### 6. Deploy backend and frontend

```bash
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/backend-service.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/frontend-service.yml
```

### 7. Install ingress controller and route traffic

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f k8s/ingress.yml
```

### 8. Verify application status

```bash
kubectl get pods -n production
kubectl get svc -n ingress-nginx
```

## Backend API

The backend exposes a simple REST endpoint:

- GET `/api/employees`

This endpoint returns all employee rows from the MySQL database.

## Frontend

The React + Vite frontend is a responsive employee directory dashboard. It supports live employee search, refresh, loading and error states, and fetches employee data from `/api/employees`. Vite proxies `/api` to `http://localhost:3000` during local development. The production Docker image builds the React app and serves its static output through NGINX.

The original `frontend/` directory is retained as a static HTML prototype. Build and deploy the React application from `frontend-react/`.

To run the frontend in development mode, start the backend on port `3000`, then run:

```bash
cd frontend-react
npm install
npm run dev
```

## Security

This project uses Kubernetes Secrets for sensitive values, including the MySQL root password. In production-grade environments, it is recommended to use stronger secret management tools and restrict network access with policies and role-based controls.

## Notes

- This project is a learning-focused implementation and can be extended with Helm, CI/CD, and production monitoring.
- The database is intentionally deployed as a StatefulSet to demonstrate persistence behavior and stable network identity.

## License

This project is intended for educational and demonstration purposes.

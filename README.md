# Workforce Directory on Kubernetes

A three-tier employee directory deployed to Kubernetes on AWS. The application combines a React dashboard, a Node.js API, and a MySQL database, with Kubernetes services and an NGINX Ingress controller connecting the components.

> This repository is a learning project and deployment reference. Review the security and operational guidance before using it in a production environment.

## Architecture

```text
Browser
  │
  ▼
NGINX Ingress
  ├── /       → frontend-service → React app served by NGINX
  └── /api    → backend-service  → Node.js API
                                      │
                                      ▼
                               MySQL StatefulSet
                                      │
                                      ▼
                                PersistentVolume
```

The MySQL pod uses a persistent volume claim. The frontend and backend deployments each run two replicas.

![Kubernetes deployment architecture](Kubernetes%20AWS%20Complete%20Architecture%20Flow.png)

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, NGINX |
| API | Node.js, Express, mysql2 |
| Database | MySQL 8.0 |
| Containers and orchestration | Docker, Kubernetes, kubectl |
| Routing | NGINX Ingress |
| Cloud target | AWS Kubernetes cluster |

## Features

- Employee directory with search, refresh, loading, and error states
- REST API backed by MySQL
- Kubernetes Deployments and Services for the frontend and API
- MySQL StatefulSet with persistent storage
- ConfigMap-based application configuration and Secret-based database credentials
- Path-based ingress routing for the UI and API

## Repository layout

```text
.
├── backend/                  # Node.js API and Dockerfile
├── frontend-react/           # React + Vite application and Dockerfile
├── frontend/                 # Original static HTML prototype
├── Database/                 # Database setup notes
├── k8s/                      # Kubernetes manifests
├── screenshoots/             # Application screenshots
├── Kubernetes AWS Complete Architecture Flow.png
└── README.md
```

The deployed frontend is `frontend-react/`. The `frontend/` directory is an earlier static prototype and is not used by the Kubernetes deployment.

## Prerequisites

- An AWS Kubernetes cluster and a working `kubectl` context
- Docker
- A container registry accessible to the cluster
- An NGINX Ingress controller installed in the cluster

Check that `kubectl` is connected to the intended cluster before applying manifests:

```bash
kubectl config current-context
kubectl get nodes
```

## Deploy to Kubernetes

Run the following commands from the repository root. The manifests create resources in the `production` namespace.

### 1. Create the namespace and application configuration

```bash
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml
```

### 2. Create the database Secret

Create the Secret directly in the cluster with a strong password:

```bash
kubectl create secret generic mysql-secret --namespace production --from-literal=MYSQL_ROOT_PASSWORD='<your-strong-password>'
```

The manifests expect the Secret to be named `mysql-secret` and the key to be `MYSQL_ROOT_PASSWORD`. Do not commit real credentials. Kubernetes Secret values stored as Base64 in YAML are encoded, not encrypted. Avoid applying the checked-in `k8s/secret.yml`; it contains a demo credential and is not suitable for production.

### 3. Start MySQL and create the schema

```bash
kubectl apply -f k8s/mysql-headless.yml
kubectl apply -f k8s/mysql-statefulset.yml
kubectl rollout status statefulset/mysql --namespace production
kubectl exec -it mysql-0 --namespace production -- mysql -u root -p
```

Enter the password used when creating the Secret. At the MySQL prompt, initialize the database and sample employee records:

```sql
CREATE DATABASE company;
USE company;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

INSERT INTO employees (name)
VALUES ('Reyaz'), ('Suman'), ('Jack'), ('Mike');
```

### 4. Build and push the application images

The deployment manifests currently reference `trainerreyaz/backend:v1` and `trainerreyaz/frontend:v1`. Build and push images with those names, or update the `image` fields in `k8s/backend-deployment.yml` and `k8s/frontend-deployment.yml` to match your registry.

```bash
docker build -t trainerreyaz/backend:v1 ./backend
docker push trainerreyaz/backend:v1

docker build -t trainerreyaz/frontend:v1 ./frontend-react
docker push trainerreyaz/frontend:v1
```

### 5. Deploy the application

```bash
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/backend-service.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/frontend-service.yml
```

### 6. Install ingress and apply the route

If the cluster does not already have an NGINX Ingress controller, install one using the [official ingress-nginx installation guidance](https://kubernetes.github.io/ingress-nginx/deploy/). For production, follow the versioned instructions appropriate for your cluster.

Then apply this project's ingress:

```bash
kubectl apply -f k8s/ingress.yml
```

The ingress has no host restriction: it routes `/` to the frontend and `/api` to the backend. On AWS, the ingress controller's Service must be reachable through a provisioned load balancer.

### 7. Check the deployment

```bash
kubectl get pods --namespace production
kubectl get services --namespace production
kubectl get ingress --namespace production
kubectl get services --namespace ingress-nginx
```

Open the external address of the ingress controller's load balancer in a browser. The employee API is available at `/api/employees` on the same address.

## Local development

The Vite development server proxies requests under `/api` to `http://localhost:3000`. To run the frontend locally, first make the API available at that address and configure its `DB_HOST`, `DB_NAME`, and `DB_PASSWORD` environment variables for a reachable MySQL database.

In PowerShell, start the backend in one terminal. First, make sure your local MySQL instance has the `company` database and `employees` table (see the SQL above), then set the connection values:

```powershell
cd backend
npm install
$env:DB_HOST = "127.0.0.1"
$env:DB_NAME = "company"
$env:DB_PASSWORD = "<your-mysql-password>"
node server.js
```

In another terminal, start the frontend:

```powershell
cd frontend-react
npm ci
npm run dev
```

The Vite server prints the local URL when it starts.

## API

### `GET /api/employees`

Returns all rows in the MySQL `employees` table as a JSON array. Each row includes the `id` and `name` fields. The endpoint requires the database and table to be initialized.

## Configuration and security notes

- `k8s/configmap.yml` sets the database host (`mysql-0.mysql`) and database name (`company`).
- The backend reads `DB_HOST`, `DB_NAME`, and `DB_PASSWORD` from its environment.
- The database root password is supplied through the `mysql-secret` Kubernetes Secret.
- For a production deployment, use an external secret manager, a least-privilege database account, TLS, restricted network access, and appropriate backups and monitoring.
- Review the manifests and container image sources before deploying them to a cluster.

## Project status

This project is intended for educational and demonstration purposes. It can be extended with infrastructure automation, CI/CD, database migrations, monitoring, and production-grade secret management.

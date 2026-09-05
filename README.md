# 🏥 Hospital Appointment Booking System

A full-stack hospital appointment booking system with a complete DevOps pipeline.

![Architecture](docs/architecture.png)

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Frontend | React + Vite |
| Containerization | Docker + Docker Compose |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security Scan | Trivy |
| Infrastructure | Terraform (AWS) |
| Storage | Amazon S3 |
| Monitoring | Amazon CloudWatch |

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+
- AWS CLI configured
- Terraform 1.5+
- Jenkins (for CI/CD)

## 🏁 Quick Start (Local with Docker)

```bash
# Clone the repository
git clone https://github.com/<your-username>/hospital-appointment-system.git
cd hospital-appointment-system

# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
# API Health: http://localhost:5000/api/health
```

## 🌿 Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `hotfix/*` | Urgent production fixes |

```
main
 └── develop
      ├── feature/patient-registration
      ├── feature/doctor-search
      └── feature/appointment-booking
```

## 📁 Project Structure

```
hospital-appointment-system/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/          # DB, S3 configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── models/          # MongoDB schemas
│   │   └── routes/          # API routes
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service layer
│   │   └── context/         # React context (Auth)
│   ├── Dockerfile
│   └── package.json
├── terraform/               # AWS Infrastructure as Code
├── jenkins/                 # Jenkinsfile CI/CD pipeline
├── monitoring/              # CloudWatch configuration
├── scripts/                 # Deployment scripts
├── docs/                    # Documentation
└── docker-compose.yml
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Patient registration |
| POST | `/api/auth/login` | Patient login |
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/:id` | Doctor details |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/my` | Patient's appointments |
| POST | `/api/upload` | Upload document to S3 |
| GET | `/api/health` | Health check |

## 🐳 Docker Images

- Backend: `docker.io/yourdockerhubusername/hospital-backend:latest`
- Frontend: `docker.io/yourdockerhubusername/hospital-frontend:latest`

## ☁️ Infrastructure

Terraform provisions on AWS:
- VPC + Public Subnet
- Internet Gateway + Route Table
- Security Group (ports 22, 80, 5000)
- EC2 Instance (Ubuntu 22.04, t2.micro)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 📊 Monitoring

CloudWatch monitors:
- EC2 CPU utilization (alarm > 80%)
- Memory usage (alarm > 85%)
- Application logs (`/hospital-app/backend`)
- 5xx error rate

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

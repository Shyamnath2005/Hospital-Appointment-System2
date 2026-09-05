#!/bin/bash
# Hospital App – Manual Deployment Script (Day 7)
# Run this on EC2 after Terraform provisions the instance

set -e

DOCKER_USERNAME="yourdockerhubusername"
APP_DIR="/opt/hospital-app"

echo "🚀 Deploying Hospital Appointment System..."

# Pull latest images
echo "⬇️  Pulling latest Docker images..."
docker pull ${DOCKER_USERNAME}/hospital-backend:latest
docker pull ${DOCKER_USERNAME}/hospital-frontend:latest

# Navigate to app directory
cd ${APP_DIR}

# Stop existing containers
echo "⏹  Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Start fresh
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for health checks
echo "⏳ Waiting for application to be healthy..."
sleep 15

# Show status
echo "📊 Container Status:"
docker-compose ps

# Show logs
echo "📜 Recent Logs:"
docker-compose logs --tail=20

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "your-ec2-ip")
echo ""
echo "✅ Deployment successful!"
echo "🌐 Application URL: http://${PUBLIC_IP}"
echo "🔌 API URL: http://${PUBLIC_IP}:5000/api/health"

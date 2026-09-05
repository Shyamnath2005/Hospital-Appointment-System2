#!/bin/bash
# Hospital App – EC2 User Data Script
# Runs automatically on first boot of the EC2 instance

set -e
exec > >(tee /var/log/user-data.log) 2>&1

echo "🚀 Starting Hospital App setup at $(date)"

# ── Update system ──────────────────────────────────────────
apt-get update -y
apt-get upgrade -y

# ── Install Docker ─────────────────────────────────────────
echo "🐳 Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# ── Install Docker Compose (standalone) ───────────────────
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── Install AWS CloudWatch Agent ──────────────────────────
echo "📊 Installing CloudWatch Agent..."
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb || apt-get -f install -y

# ── Create application directory ──────────────────────────
echo "📁 Setting up application directory..."
mkdir -p /opt/hospital-app
chown ubuntu:ubuntu /opt/hospital-app

# ── Create docker-compose.yml on EC2 ─────────────────────
cat > /opt/hospital-app/docker-compose.yml << 'COMPOSE'
version: '3.9'

services:
  mongo:
    image: mongo:7.0
    container_name: hospital-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - hospital-net
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  backend:
    image: yourdockerhubusername/hospital-backend:latest
    container_name: hospital-backend
    restart: unless-stopped
    environment:
      PORT: 5000
      NODE_ENV: production
      MONGODB_URI: mongodb://mongo:27017/hospital_db
      JWT_SECRET: ${JWT_SECRET}
      AWS_REGION: ${AWS_REGION:-us-east-1}
      S3_BUCKET_NAME: ${S3_BUCKET_NAME}
    ports:
      - "5000:5000"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - hospital-net

  frontend:
    image: yourdockerhubusername/hospital-frontend:latest
    container_name: hospital-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - hospital-net

volumes:
  mongo_data:

networks:
  hospital-net:
    driver: bridge
COMPOSE

# ── Pull and start application ────────────────────────────
echo "🚢 Pulling Docker images..."
cd /opt/hospital-app
sudo -u ubuntu docker-compose pull

echo "▶️  Starting application..."
sudo -u ubuntu docker-compose up -d

# ── Configure CloudWatch Agent ────────────────────────────
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'CW_CONFIG'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/**/**-json.log",
            "log_group_name": "/hospital-app/docker",
            "log_stream_name": "{instance_id}",
            "auto_removal": true
          }
        ]
      }
    }
  },
  "metrics": {
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}"
    },
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/"],
        "metrics_collection_interval": 60
      }
    }
  }
}
CW_CONFIG

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

echo "✅ Hospital App setup complete at $(date)!"
echo "🌐 Application is available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

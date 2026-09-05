variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "hospital-app"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "Name of existing AWS EC2 Key Pair for SSH access"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of S3 bucket for patient documents (must be globally unique)"
  type        = string
  default     = "hospital-patient-documents-unique"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed for SSH access (use your IP for security: 'X.X.X.X/32')"
  type        = string
  default     = "0.0.0.0/0"
}

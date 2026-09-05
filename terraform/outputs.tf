output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.hospital_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS hostname of the EC2 instance"
  value       = aws_instance.hospital_server.public_dns
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_instance.hospital_server.public_ip}"
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.hospital_server.public_ip}:5000/api"
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.hospital_vpc.id
}

output "subnet_id" {
  description = "Public Subnet ID"
  value       = aws_subnet.hospital_public_subnet.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.hospital_sg.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for patient documents"
  value       = aws_s3_bucket.patient_documents.bucket
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.hospital_server.public_ip}"
}

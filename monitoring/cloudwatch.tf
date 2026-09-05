terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ── CloudWatch Log Group ──────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "hospital_app" {
  name              = "/hospital-app/backend"
  retention_in_days = 30

  tags = { Project = "hospital-app" }
}

resource "aws_cloudwatch_log_group" "hospital_docker" {
  name              = "/hospital-app/docker"
  retention_in_days = 14

  tags = { Project = "hospital-app" }
}

# ── SNS Topic for Alerts ──────────────────────────────────────────────────────

resource "aws_sns_topic" "hospital_alerts" {
  name = "hospital-app-alerts"
}

resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.hospital_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ── CloudWatch Alarms ──────────────────────────────────────────────────────────

# CPU Utilization > 80%
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "hospital-app-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU utilization exceeds 80% for 4 minutes"
  alarm_actions       = [aws_sns_topic.hospital_alerts.arn]
  ok_actions          = [aws_sns_topic.hospital_alerts.arn]
  treat_missing_data  = "breaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }

  tags = { Project = "hospital-app" }
}

# Memory Utilization > 85%
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "hospital-app-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 120
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Memory usage exceeds 85% for 4 minutes"
  alarm_actions       = [aws_sns_topic.hospital_alerts.arn]
  treat_missing_data  = "breaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }
}

# Disk Utilization > 80%
resource "aws_cloudwatch_metric_alarm" "high_disk" {
  alarm_name          = "hospital-app-high-disk"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Disk usage exceeds 80%"
  alarm_actions       = [aws_sns_topic.hospital_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
    path       = "/"
    device     = "nvme0n1p1"
    fstype     = "ext4"
  }
}

# ── CloudWatch Dashboard ──────────────────────────────────────────────────────

resource "aws_cloudwatch_dashboard" "hospital_dashboard" {
  dashboard_name = "HospitalAppDashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [["AWS/EC2", "CPUUtilization", "InstanceId", var.ec2_instance_id]]
          period  = 300
          stat    = "Average"
          title   = "EC2 CPU Utilization (%)"
          view    = "timeSeries"
          region  = "us-east-1"
          yAxis   = { left = { min = 0, max = 100 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [["CWAgent", "mem_used_percent", "InstanceId", var.ec2_instance_id]]
          period  = 300
          stat    = "Average"
          title   = "Memory Utilization (%)"
          view    = "timeSeries"
          region  = "us-east-1"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "NetworkIn", "InstanceId", var.ec2_instance_id],
            ["AWS/EC2", "NetworkOut", "InstanceId", var.ec2_instance_id]
          ]
          period = 300
          stat   = "Sum"
          title  = "Network Traffic (bytes)"
          view   = "timeSeries"
          region = "us-east-1"
        }
      },
      {
        type   = "log"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/hospital-app/backend' | fields @timestamp, @message | sort @timestamp desc | limit 50"
          region  = "us-east-1"
          title   = "Application Logs"
          view    = "table"
        }
      }
    ]
  })
}

variable "ec2_instance_id" {
  description = "EC2 instance ID (from terraform output of main module)"
  type        = string
}

variable "alert_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = "admin@hospital.com"
}

output "cloudwatch_dashboard_url" {
  value = "https://console.aws.amazon.com/cloudwatch/home#dashboards:name=HospitalAppDashboard"
}

output "sns_topic_arn" {
  value = aws_sns_topic.hospital_alerts.arn
}

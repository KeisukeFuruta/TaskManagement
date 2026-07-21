output "ec2_public_ip" {
  description = "EC2のパブリックIPアドレス"
  value       = aws_instance.main.public_ip
}

output "app_url" {
  description = "アプリのURL（Nginx経由）"
  value       = "http://${aws_instance.main.public_ip}"
}

output "api_url" {
  description = "APIの直接確認URL（動作確認用）"
  value       = "http://${aws_instance.main.public_ip}:8080/boards"
}

output "ssh_command" {
  description = "SSH接続コマンド"
  value       = "ssh -i terraform/taskmanagement-key.pem ec2-user@${aws_instance.main.public_ip}"
}

output "rds_endpoint" {
  description = "RDSのエンドポイント（Spring Bootの接続先として使用）"
  value       = aws_db_instance.postgres.address
}

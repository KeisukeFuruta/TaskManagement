resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-sg"
  description = "TaskManagement EC2 security group"

  # SSH接続（自分のPCからEC2にログインするため）
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  # HTTP（ブラウザからNginx経由でアクセスするため）
  # ポート80だけ開ければOK。Nginxが /api/** をEC2内部でSpring Bootに転送する
  ingress {
    description = "HTTP (Nginx)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  # アウトバウンド（EC2からインターネットへの通信を全許可）
  # パッケージのインストールやAPIコールに必要
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg" }
}

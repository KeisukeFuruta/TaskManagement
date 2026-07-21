# 最新のAmazon Linux 2023 AMIを自動取得
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# SSH接続用のキーペアを自動生成
resource "tls_private_key" "main" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# 生成した秘密鍵をローカルファイルに保存（SSH接続時に使用）
resource "local_file" "private_key" {
  content         = tls_private_key.main.private_key_pem
  filename        = "${path.module}/taskmanagement-key.pem"
  file_permission = "0600"
}

# 公開鍵をAWSに登録
resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.main.public_key_openssh
}

# EC2インスタンス本体
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.main.key_name
  vpc_security_group_ids = [aws_security_group.ec2.id]

  root_block_device {
    volume_size = 30  # GB（無料枠: 30GBまで、このAMIは最低30GB必要）
  }

  # EC2起動時に自動実行されるセットアップスクリプト
  # ※ heredoc内のインデントはシェルスクリプトに含まれるため、左端に揃える
  user_data = <<-EOF
#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

echo "=== Java 21 インストール ==="
dnf install -y java-21-amazon-corretto

echo "=== PostgreSQL 15 インストール ==="
dnf install -y postgresql15-server
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql

echo "=== PostgreSQL 認証設定（パスワード認証に変更）==="
sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sed -i 's/peer/md5/g' /var/lib/pgsql/data/pg_hba.conf
systemctl restart postgresql

echo "=== DB・ユーザー設定 ==="
sudo -u postgres psql -c "CREATE DATABASE taskmanagement;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${var.db_password}';"

echo "=== Nginx インストール ==="
dnf install -y nginx
systemctl enable nginx

echo "=== Nginx 設定（/api → Spring Boot、それ以外 → 静的ファイル）==="
cat > /etc/nginx/conf.d/taskmanagement.conf << 'NGINXCONF'
server {
    listen 80;

    root /var/www/taskmanagement;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF

echo "=== フロントエンド配置ディレクトリ作成 ==="
mkdir -p /var/www/taskmanagement
chown -R nginx:nginx /var/www/taskmanagement
chmod -R 755 /var/www/taskmanagement

systemctl start nginx

echo "=== セットアップ完了 ==="
  EOF

  tags = { Name = "${var.project_name}-server" }
}

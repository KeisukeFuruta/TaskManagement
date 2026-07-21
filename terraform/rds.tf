# デフォルトVPCとサブネットを参照（カスタムVPCを作らずに済む）
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

# RDS用セキュリティグループ（EC2からのポート5432のみ許可）
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "TaskManagement RDS security group"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# RDSを配置するサブネットグループ（複数AZにまたがる必要がある）
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

# RDSインスタンス（PostgreSQL 15）
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-postgres"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"  # 無料枠対象
  allocated_storage = 20             # GB（無料枠: 20GBまで）

  db_name  = "taskmanagement"
  username = "postgres"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # 個人利用向け設定（コスト削減）
  skip_final_snapshot     = true   # terraform destroy時にスナップショット不要
  deletion_protection     = false  # terraform destroyで削除できるように
  backup_retention_period = 0      # 自動バックアップなし
  publicly_accessible     = false  # インターネットから直接アクセス不可（EC2経由のみ）

  tags = { Name = "${var.project_name}-postgres" }
}

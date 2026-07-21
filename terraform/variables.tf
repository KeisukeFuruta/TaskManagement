variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名（リソース名のプレフィックスに使用）"
  type        = string
  default     = "taskmanagement"
}

variable "db_password" {
  description = "PostgreSQLのパスワード（terraform.tfvarsで設定）"
  type        = string
  sensitive   = true
}

variable "allowed_cidr_blocks" {
  description = "アクセスを許可するIPアドレスのリスト（/32 = 1台のIP）"
  type        = list(string)
}

# デプロイ手順書

| 項目 | 内容 |
|---|---|
| 作成日 | 2026-07-21 |
| 対象環境 | AWS（ap-northeast-1 東京） |
| 構成 | EC2 + RDS（[インフラ構成書](./infra-design.md) 参照） |

---

## 1. 前提条件・ツール

以下がインストール済みであること。

| ツール | バージョン | インストール方法 |
|---|---|---|
| Docker Desktop | 28.0.4+ | 公式サイト |
| AWS CLI | 2.x | `brew install awscli` |
| Terraform | 1.10.5+ | 公式バイナリを `/usr/local/bin/` に配置 |
| jq | 1.7+ | インストール済み（`jq --version` で確認） |
| Java | 21 | ローカルビルド用 |
| Node.js / npm | 18+ | フロントエンドビルド用 |

また以下が準備済みであること。

- AWSアカウント登録済み
- IAMユーザー（AdministratorAccess 権限）のアクセスキー発行済み

---

## 2. AWS認証設定

```bash
# アクセスキーを設定する
aws configure

# 対話形式で入力
# AWS Access Key ID     : AKIA...
# AWS Secret Access Key : ...
# Default region name   : ap-northeast-1
# Default output format : json

# 認証が通っているか確認
aws sts get-caller-identity
# 正常時: Account・UserId・Arn が JSON で返る
```

---

## 3. インフラ構築（Terraform）

### 3-1. terraform.tfvars を作成する

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` を編集して以下を設定する。

```hcl
db_password  = "任意の安全なパスワード"
project_name = "taskmanagement"
aws_region   = "ap-northeast-1"

# アクセスを許可するIPアドレス（/32 = 1台のIPのみ）
allowed_cidr_blocks = [
  "xxx.xxx.xxx.xxx/32",  # 自宅Wi-Fi
  "yyy.yyy.yyy.yyy/32",  # テザリング など
]
```

> **現在のIPを確認するコマンド:** `curl https://checkip.amazonaws.com`

### 3-2. 初期化・確認・適用

```bash
# プロバイダーをダウンロード（初回のみ）
terraform init

# 作成されるリソースを事前確認（何も変わらない）
terraform plan

# 実際にAWSに構築（10〜15分かかる）
terraform apply
```

### 3-3. 作成されたリソースを確認する

```bash
terraform output

# 出力例
# ec2_public_ip = "52.69.76.107"
# app_url       = "http://52.69.76.107"
# rds_endpoint  = "taskmanagement-postgres.xxx.ap-northeast-1.rds.amazonaws.com"
# ssh_command   = "ssh -i terraform/taskmanagement-key.pem ec2-user@52.69.76.107"
```

### 3-4. SSH で接続確認する

```bash
ssh -i terraform/taskmanagement-key.pem ec2-user@<EC2のIP>

# EC2内で確認
java -version   # openjdk 21
nginx -v        # nginx/1.30.x
psql --version  # PostgreSQL 15.x
```

> **RDS だけを先に作成したい場合（AMI更新によるEC2再作成を防ぐため）:**
> ```bash
> terraform apply \
>   -target=aws_security_group.rds \
>   -target=aws_db_subnet_group.main \
>   -target=aws_db_instance.postgres
> ```

---

## 4. バックエンドデプロイ

### 4-1. JAR をビルドする

```bash
cd backend
./gradlew bootJar
# 生成先: backend/build/libs/backend-0.0.1-SNAPSHOT.jar（約52MB）
```

### 4-2. JAR を EC2 に転送する

```bash
scp -i terraform/taskmanagement-key.pem \
  backend/build/libs/backend-0.0.1-SNAPSHOT.jar \
  ec2-user@<EC2のIP>:~/app.jar
```

### 4-3. EC2 上で Spring Boot を起動する

```bash
# SSH 接続した状態で実行

# 既存プロセスを停止（再デプロイ時）
pkill -f 'app.jar' 2>/dev/null || true

# バックグラウンド起動（ログは ~/app.log に保存）
nohup java -jar ~/app.jar \
  --spring.datasource.url=jdbc:postgresql://<RDSエンドポイント>:5432/taskmanagement \
  --spring.datasource.username=postgres \
  --spring.datasource.password=<DBパスワード> \
  > ~/app.log 2>&1 &
```

### 4-4. API の動作を確認する

```bash
# EC2の外から確認（Nginx経由）
curl http://<EC2のIP>/api/boards

# 正常時: JSONレスポンスが返る
# [{"id":"a0000000-...","title":"開発プロジェクト",...}]
```

---

## 5. フロントエンドデプロイ

> **ポートについて:** ローカル開発では Vite（ポート5173）が動くが、本番では `npm run build` で生成した静的ファイルを Nginx（ポート80）が配信する。Vite は起動しない。

### 5-1. フロントエンドをビルドする

```bash
cd frontend
npm run build
# 生成先: frontend/dist/（index.html・assets/*.js・assets/*.css）
```

### 5-2. dist フォルダを EC2 に転送する

```bash
# 一時ディレクトリに転送
ssh -i terraform/taskmanagement-key.pem ec2-user@<IP> "mkdir -p /tmp/frontend"
scp -r -i terraform/taskmanagement-key.pem \
  frontend/dist/* \
  ec2-user@<IP>:/tmp/frontend/

# Nginx の配信ディレクトリに移動
ssh -i terraform/taskmanagement-key.pem ec2-user@<IP> \
  "sudo cp -r /tmp/frontend/* /var/www/taskmanagement/ \
   && sudo chown -R nginx:nginx /var/www/taskmanagement/"
```

### 5-3. ブラウザで確認する

ブラウザで `http://<EC2のIP>` を開き、カンバンボードが表示されれば完了。

---

## 6. 運用コマンド集

### EC2 の起動・停止

```bash
# 停止（外出・作業終了時）
aws ec2 stop-instances \
  --instance-ids i-028f1b990c1447514 \
  --region ap-northeast-1

# 起動（作業再開時）
aws ec2 start-instances \
  --instance-ids i-028f1b990c1447514 \
  --region ap-northeast-1

# 起動後の新しいIPを確認する
aws ec2 describe-instances \
  --instance-ids i-028f1b990c1447514 \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region ap-northeast-1
```

> **注意:** EC2 を停止・起動するたびにパブリック IP が変わる。固定したい場合は Elastic IP の割り当てを検討（停止中は課金あり）。

### Spring Boot の操作

```bash
# ログを確認する
ssh -i terraform/taskmanagement-key.pem ec2-user@<IP> "tail -50 ~/app.log"

# 再起動する
ssh -i terraform/taskmanagement-key.pem ec2-user@<IP> \
  "pkill -f 'app.jar'; nohup java -jar ~/app.jar \
   --spring.datasource.url=jdbc:postgresql://<RDSエンドポイント>:5432/taskmanagement \
   --spring.datasource.username=postgres \
   --spring.datasource.password=<DBパスワード> \
   > ~/app.log 2>&1 &"
```

### アクセス許可IPの追加・変更

```bash
# terraform.tfvars の allowed_cidr_blocks を編集してから
terraform apply
```

### 全リソースを削除する（完全撤去・課金停止）

```bash
# ※ データも全て削除されるため注意
terraform destroy
```

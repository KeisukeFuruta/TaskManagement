# インフラ構成書

| 項目 | 内容 |
|---|---|
| 作成日 | 2026-07-21 |
| 対象リージョン | ap-northeast-1（東京） |
| インスタンスID | i-028f1b990c1447514 |
| 利用目的 | 個人利用（シングルユーザー） |

---

## 1. システム概要

TaskManagement（Trello風カンバンボード）を AWS 上で稼働させるための最小構成。
個人利用を前提とし、無料枠を最大限に活用するシンプルな EC2 + RDS 構成を採用。

- フロントエンド（React）とバックエンド（Spring Boot）を EC2 1台に同居
- データベースは RDS（PostgreSQL 15）に切り出し、EC2 と分離
- Nginx がリクエストを振り分け。`/api/**` → Spring Boot、それ以外 → React 静的ファイル
- 認証なし・シングルユーザー前提のため、ALB / ECS / CloudFront は使用しない

---

## 2. アーキテクチャ構成図

```
ブラウザ（許可されたIPのみ）
     │
     │ HTTP  ポート 80
     ▼
┌──────────────────────────────────────────────┐
│           EC2 t3.micro                       │
│           Amazon Linux 2023                  │
│                                              │
│   ┌──────────────────────────────────────┐  │
│   │  Nginx  （ポート 80）                 │  │
│   │                                      │  │
│   │  /         → 静的ファイル配信         │  │
│   │  /api/**   → Spring Boot に転送       │  │
│   └─────────────────┬────────────────────┘  │
│                     │ localhost:8080          │
│   ┌─────────────────▼────────────────────┐  │
│   │  Spring Boot   （ポート 8080）        │  │
│   │  Java 21 / Spring Boot 3.5.3         │  │
│   │  JAR 直接起動（nohup）               │  │
│   └──────────────────────────────────────┘  │
│                                              │
│   /var/www/taskmanagement/                   │
│   （React ビルド済みファイル）               │
│                                              │
│   ポート 22（SSH）← 許可IPのみ              │
└──────────────────────┬───────────────────────┘
                       │ ポート 5432（内部通信）
                       ▼
┌──────────────────────────────────────────────┐
│           RDS  db.t3.micro                   │
│           PostgreSQL 15                      │
│           taskmanagement DB                  │
│           （publicly_accessible = false）    │
└──────────────────────────────────────────────┘
```

### ローカル開発環境との対応

| ローカル | AWS 本番 |
|---|---|
| `localhost:5173`（Vite dev server） | `http://<EC2-IP>:80` |
| `localhost:8080`（Spring Boot） | EC2 内 Spring Boot |
| `localhost:5432`（Docker PostgreSQL） | RDS PostgreSQL |
| Vite の `/api` プロキシ | Nginx の `/api/` 転送 |

---

## 3. 使用AWSサービス一覧

| サービス | スペック | 用途 | 無料枠 |
|---|---|---|---|
| EC2 | t3.micro | Nginx・Spring Boot・フロントエンド配信 | 750時間/月 × 12ヶ月 |
| EBS | 30 GB | EC2 のディスク（OS・JAR・静的ファイル） | 30 GB × 12ヶ月 |
| RDS | db.t3.micro | PostgreSQL 15 データベース | 750時間/月 × 12ヶ月 |
| セキュリティグループ | 2つ（EC2用・RDS用） | ファイアウォールルール管理 | 無料 |

**未使用サービスと理由:**

| サービス | 不使用の理由 |
|---|---|
| ALB | EC2 が1台のため振り分け不要 |
| NAT Gateway | プライベートサブネット不使用 |
| ECS | JAR 直接起動で十分 |
| CloudFront | 個人利用のためCDN不要 |

---

## 4. セキュリティ設定

### EC2 セキュリティグループ

| 方向 | ポート | プロトコル | 許可元 | 用途 |
|---|---|---|---|---|
| インバウンド | 22 | TCP | 許可IP（/32 指定） | SSH 接続 |
| インバウンド | 80 | TCP | 許可IP（/32 指定） | HTTP（Nginx） |
| アウトバウンド | 全て | 全て | 0.0.0.0/0 | パッケージ取得・外部通信 |

### RDS セキュリティグループ

| 方向 | ポート | プロトコル | 許可元 | 用途 |
|---|---|---|---|---|
| インバウンド | 5432 | TCP | EC2 セキュリティグループのみ | PostgreSQL 接続 |

> **IPアドレスが変わったとき:** `terraform.tfvars` の `allowed_cidr_blocks` を更新して `terraform apply` を再実行する。

---

## 5. Terraform ファイル構成

```
terraform/
├── main.tf                   # AWSプロバイダー・バージョン設定
├── variables.tf              # 変数定義（リージョン・プロジェクト名・DBパスワード・許可IP）
├── ec2.tf                    # EC2インスタンス・SSH鍵ペア・初期セットアップスクリプト
├── security_groups.tf        # EC2用セキュリティグループ
├── rds.tf                    # RDSインスタンス・DBサブネットグループ・RDS用SG
├── outputs.tf                # EC2 IP・RDS エンドポイント・SSH コマンド出力
├── terraform.tfvars          # 実際の値（パスワード・IP）← Git管理外
├── terraform.tfvars.example  # tfvars のサンプル
├── taskmanagement-key.pem    # SSH秘密鍵 ← Git管理外
└── .gitignore                # tfvars・pem・.terraform/ を除外
```

---

## 6. コスト概算

| サービス | 無料枠期間（12ヶ月） | 無料枠終了後（月額） |
|---|---|---|
| EC2 t3.micro | ほぼ $0 | 常時起動: ~$12 / 都度起動: ~$1 |
| RDS db.t3.micro | ほぼ $0 | 常時起動: ~$15 / 都度起動: ~$1 |
| EBS 30GB | $0 | ~$3 |
| **合計** | **ほぼ $0** | 都度起動: ~$5 / 常時起動: ~$30 |

> 個人利用では「使うときだけ EC2・RDS を起動」が最もコスト効率が良い。停止中は EBS の保存料のみ（約 $3/月）。

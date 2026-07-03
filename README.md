# タスク管理アプリ

Trello風のカンバンボード形式で、リストとカードを管理するシングルユーザー向けタスク管理アプリです。

## 機能

- ボード・リスト・カードの作成・編集・削除（CRUD）
- カードへの優先度（緊急 / 高 / 中 / 低）と期限日の設定
- タイトル・優先度・期限日によるカード検索
- ログイン機能なし（自分一人で使う用途）
- ドラッグ＆ドロップによるカード移動（今後実装予定）

## 技術スタック

| レイヤー | 技術 | バージョン |
|---|---|---|
| フロントエンド | React | 19.2.7 |
| 言語 | TypeScript | 6.0.2 |
| ビルドツール | Vite | 8.1.1 |
| API クライアント | TanStack Query | 5.101.2 |
| バックエンド | Spring Boot | 3.5.3 |
| 言語 | Java | 21.0.3 (LTS) |
| O/R マッパー | Spring Data JPA (Hibernate) | Spring Boot 管理 |
| データベース | PostgreSQL | 17 |
| コンテナ | Docker | — |
| ランタイム (Node) | Node.js | 22.15.0 |

## 起動手順

### 前提条件

- Docker Desktop が起動していること
- Java 21 以上がインストールされていること
- Node.js 18 以上がインストールされていること

### 1. データベース起動

```bash
docker compose up -d
```

### 2. バックエンド起動（ポート 8080）

```bash
cd backend
./gradlew bootRun
```

### 3. フロントエンド起動（ポート 5173）

別ターミナルで実行：

```bash
cd frontend
npm install   # 初回のみ
npm run dev
```

### 4. ブラウザで開く

```
http://localhost:5173
```

> **注意**: ポートは変更しないこと。Vite のプロキシ設定（5173 → 8080）と CORS 設定が固定されているため、別ポートで起動すると通信できなくなります。

## API エンドポイント一覧

バックエンドは `http://localhost:8080` で動作します。

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/boards` | ボード一覧 |
| GET | `/boards/{id}` | ボード詳細 |
| POST | `/boards` | ボード作成 |
| PUT | `/boards/{id}` | ボード更新 |
| DELETE | `/boards/{id}` | ボード削除 |
| GET | `/boards/{boardId}/lists` | リスト一覧 |
| POST | `/boards/{boardId}/lists` | リスト作成 |
| PUT | `/lists/{id}` | リスト更新 |
| DELETE | `/lists/{id}` | リスト削除 |
| GET | `/lists/{listId}/cards` | カード一覧 |
| GET | `/cards/search` | カード検索（`?title=&priority=&dueDate=`） |
| POST | `/lists/{listId}/cards` | カード作成 |
| PUT | `/cards/{id}` | カード更新 |
| DELETE | `/cards/{id}` | カード削除 |

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義](docs/requirements.md) | MVP範囲・対象ユーザー・システム構成 |
| [機能仕様](docs/functional-spec.md) | 機能一覧・画面構成の詳細 |
| [非機能要件](docs/non-functional-spec.md) | パフォーマンス・対応ブラウザ等 |
| [データモデル](docs/data-model.md) | エンティティ定義 |
| [ER図](docs/er-diagram.md) | テーブル構成・カラム定義 |
| [画面ワイヤーフレーム](docs/wireframes.md) | 各画面のレイアウトイメージ |
| [技術スタック](docs/tech-stack.md) | 使用技術・バージョン詳細 |

## 開発メモ

このアプリは **Cursor + Claude Code** を活用して開発しています。
フロントエンド（React）とバックエンド（Java / Spring Boot）を組み合わせたWebアプリ開発の初挑戦として、
要件定義・設計・実装の各フェーズをAI支援ツールとともに進めながら学ぶことを目的としています。

## 将来拡張（MVP外）

- ドラッグ＆ドロップによるカード移動
- ユーザー登録・ログイン
- コメント・添付ファイル
- マルチユーザー対応

# 技術スタック

## フロントエンド

| 項目 | 技術 | バージョン |
|---|---|---|
| フレームワーク | React | 19.2.7 |
| 言語 | TypeScript | 6.0.2 |
| ビルドツール | Vite | 8.1.1 |
| API クライアント | TanStack Query (React Query) | 5.101.2 |
| スタイリング | CSS（グローバル） | — |

### Vite プロキシ設定

開発時の CORS を回避するため、Vite の dev server が `/api/*` へのリクエストをバックエンドに転送する。

```
ブラウザ → http://localhost:5173/api/... → http://localhost:8080/...
```

設定ファイル: `frontend/vite.config.ts`

## バックエンド

| 項目 | 技術 | バージョン |
|---|---|---|
| 言語 | Java | 21.0.3 (LTS) |
| フレームワーク | Spring Boot | 3.5.3 |
| API スタイル | REST API | — |
| O/R マッパー | Spring Data JPA (Hibernate) | Spring Boot 管理 |
| ビルドツール | Gradle (Groovy DSL) | Spring Boot 管理 |

## データベース

| 項目 | 技術 | バージョン |
|---|---|---|
| DB | PostgreSQL | 17 |
| 実行環境 | Docker | — |

設定ファイル: `docker-compose.yml`

## ポート定義（変更禁止）

| サービス | ポート |
|---|---|
| フロントエンド (Vite) | 5173 |
| バックエンド (Spring Boot) | 8080 |
| PostgreSQL | 5432 |

ポートを変更すると Vite プロキシ設定と Spring Boot の CORS 設定がずれるため、必ずこのポートで起動すること。

## ランタイム

| 項目 | バージョン |
|---|---|
| Node.js | 22.15.0 |
| Java | 21.0.3 (LTS) |

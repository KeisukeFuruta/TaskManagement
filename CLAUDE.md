# TaskManagement — Claude Code ガイド

## プロジェクト概要

Trello風カンバンボード型タスク管理アプリ（シングルユーザー・ログイン不要）。

- **フロントエンド**: React + TypeScript (Vite)、@dnd-kit/core
- **バックエンド**: Java 21、Spring Boot 3.5.3、Spring Data JPA
- **DB**: PostgreSQL 17（Docker）

---

## Git / GitHub ワークフロールール

> これらのルールは Claude Code として作業する際に**必ず**守ること。

### ブランチ命名規則

**形式: `<type>/<issue-number>-<short-description>`**

| type | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能追加 | `feature/42-add-board-api` |
| `fix/` | バグ修正 | `fix/57-null-pointer-on-login` |
| `chore/` | リファクタ・依存更新・設定変更 | `chore/15-upgrade-spring-boot` |
| `docs/` | ドキュメントのみの変更 | `docs/8-update-readme` |

- `<type>` は上記4種類のみ使用する
- `<issue-number>` は対応するGitHubイシューの番号（**必須**）
- `<short-description>` は英小文字・ハイフン区切り・簡潔に

### イシュー作成ルール

- コードを書き始める前に**必ずGitHubイシューを作成する**
- イシュータイトルのプレフィックス: `[Feature]`、`[Bug]`、`[Chore]`、`[Docs]`
- `.github/ISSUE_TEMPLATE/` のテンプレートを使用する
- 作業開始時にブランチをイシューに紐づける

### PR・マージルール

- **`main` への直接プッシュは禁止**（GitHub側でブロック済み）
- 作業は必ず feature/fix/chore/docs ブランチで行い、PR経由でマージする
- PRタイトル形式: `[Feature] #42 ボードAPI追加`（種別・イシュー番号・内容）
- PRテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）のチェックリストをすべて満たしてからマージする
- PRの説明には `Closes #<issue-number>` を含めてイシューを自動クローズする

### Claude Code への指示

1. 新しい作業を始める前に、対応するGitHubイシューを `gh issue list` で確認するか、`gh issue create` で作成する
2. ブランチを切る際は上記の命名規則に従う（例: `git checkout -b feature/42-add-board-api`）
3. `main` ブランチに直接コミット・プッシュしない
4. コミットメッセージは日本語で簡潔に（例: `ボードリストAPIエンドポイントを追加`）

---

## サーバー起動ルール

> **ポートは絶対に変更しない。** 競合したら既存プロセスを停止して、必ず同じポートで起動する。

| サービス | ポート | 設定ファイル |
|---|---|---|
| フロントエンド (Vite) | **5173** | `frontend/vite.config.ts` |
| バックエンド (Spring Boot) | **8080** | `backend/src/main/resources/application.properties` |
| PostgreSQL (Docker) | **5432** | `docker-compose.yml` |

### ポート競合時の手順（必ず守ること）

1. `lsof -ti :<PORT>` で競合プロセスのPIDを確認する
2. `kill <PID>` で停止する（終了しない場合のみ `kill -9`）
3. **同じポートで**再起動する

```bash
# 例: 8080 が競合している場合
kill $(lsof -ti :8080) 2>/dev/null || true
sleep 1
cd backend && ./gradlew bootRun

# 例: 5173 が競合している場合
kill $(lsof -ti :5173) 2>/dev/null || true
sleep 1
cd frontend && npm run dev
```

**別ポートでの起動は禁止。**
Vite の `/api` プロキシ設定（5173 → 8080）とバックエンドの CORS 設定（localhost:5173 を許可）が固定されているため、どちらかのポートを変えると通信が壊れる。

### Claude Code への起動指示

`/start-servers` スキルを使うか、以下の順序で起動すること：

1. `docker compose up -d`（DB）
2. ポート 8080 を解放してからバックエンド起動
3. ポート 5173 を解放してからフロントエンド起動
4. `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/api/boards` で疎通確認

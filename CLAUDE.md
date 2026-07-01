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
4. コミットメッセージは英語で簡潔に（例: `Add board list API endpoint`）

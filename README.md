# タスク管理アプリ

Trello風のカンバンボード形式で、リストとカードを管理するシングルユーザー向けタスク管理アプリです。

## 概要

- リスト・カードの作成・編集・削除（CRUD）
- カードのドラッグ＆ドロップによるリスト間移動
- ラベル（固定カラーセット）・期限日の設定
- ログイン機能なし（自分一人で使う用途）

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + TypeScript（Vite）|
| スタイリング | CSS Modules |
| D&D | @dnd-kit/core |
| バックエンド | Java / Spring Boot（REST API）|
| DB | PostgreSQL |
| O/Rマッパー | Spring Data JPA（Hibernate）|

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義](docs/requirements.md) | MVP範囲・対象ユーザー・システム構成 |
| [機能仕様](docs/functional-spec.md) | 機能一覧・画面構成の詳細 |
| [非機能要件](docs/non-functional-spec.md) | パフォーマンス・対応ブラウザ等 |
| [データモデル](docs/data-model.md) | エンティティ定義・固定カラーセット |
| [ER図](docs/er-diagram.md) | テーブル構成・カラム定義 |
| [画面ワイヤーフレーム](docs/wireframes.md) | 各画面のレイアウトイメージ |
| [技術スタック](docs/tech-stack.md) | 使用技術・フレームワーク一覧 |

## 開発メモ

このアプリは **Cursor + Claude Code** を活用して開発しています。
フロントエンド（React）とバックエンド（Java / Spring Boot）を組み合わせたWebアプリ開発の初挑戦として、
要件定義・設計・実装の各フェーズをAI支援ツールとともに進めながら学ぶことを目的としています。

## MVP外（将来拡張）

- ユーザー登録・ログイン
- 複数ボード管理
- 検索・フィルタ
- コメント・添付ファイル
- マルチユーザー対応

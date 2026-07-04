-- Board (position を明示的に付与。DO UPDATE で再起動時も position を正しく保つ)
INSERT INTO boards (id, title, position, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', '開発プロジェクト', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET position = EXCLUDED.position;

INSERT INTO boards (id, title, position, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000002', 'AI学習', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- TaskList
INSERT INTO lists (id, board_id, title, position, created_at, updated_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TODO',  0, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '進行中', 1, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '完了',  2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Card (TODO)
INSERT INTO cards (id, list_id, title, memo, priority, due_date, position, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'ログインページのバグ修正', 'パスワードリセットフローでエラーが発生する', 'high', '2026-07-10', 0, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
     'ユニットテスト追加', 'CardController のテストカバレッジが低い', 'medium', '2026-07-15', 1, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
     'READMEを更新', NULL, 'low', '2026-07-20', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Card (進行中)
INSERT INTO cards (id, list_id, title, memo, priority, due_date, position, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
     'カード検索API実装', 'タイトル・優先度・期日でフィルタリング', 'high', '2026-07-05', 0, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002',
     'PostgreSQLデータ投入', 'テストデータのシードスクリプト作成', 'medium', '2026-07-03', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Card (完了)
INSERT INTO cards (id, list_id, title, memo, priority, due_date, position, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003',
     'Spring Boot プロジェクト初期設定', 'Gradle・JPA・PostgreSQL の設定完了', 'high', '2026-06-20', 0, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003',
     'エンティティ設計', 'Board / TaskList / Card の JPA エンティティを定義', 'medium', '2026-06-25', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI学習ボード: リスト
INSERT INTO lists (id, board_id, title, position, created_at, updated_at)
VALUES
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '学習中',   0, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '演習',     1, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', '振り返り', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI学習ボード: カード（学習中リスト — 優先度・日付にバリエーション）
INSERT INTO cards (id, list_id, title, memo, priority, due_date, position, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004',
     'Transformerアーキテクチャを理解する', 'Attention Is All You Needを読む', 'urgent', '2026-07-08', 0, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000004',
     'PyTorch基礎を復習', 'テンソル操作と自動微分', 'high', '2026-07-12', 1, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000004',
     'ファインチューニング実装', 'HuggingFace Trainerを使う', 'medium', '2026-07-20', 2, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004',
     'RAGパターンを調査', NULL, 'low', '2026-07-31', 3, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000004',
     '論文まとめノート作成', NULL, NULL, NULL, 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI学習ボード: カード（演習リスト）
INSERT INTO cards (id, list_id, title, memo, priority, due_date, position, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000005',
     'GPT APIでチャットボット実装', 'Claude SDK を使う', 'high', '2026-07-10', 0, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000005',
     'プロンプトエンジニアリング練習', 'few-shot / chain-of-thought', 'medium', '2026-07-15', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

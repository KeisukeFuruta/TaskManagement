# ER図

```mermaid
erDiagram
    BOARD {
        uuid id PK
        varchar title
        timestamp created_at
        timestamp updated_at
    }

    LIST {
        uuid id PK
        uuid board_id FK
        varchar title
        int position
        timestamp created_at
        timestamp updated_at
    }

    CARD {
        uuid id PK
        uuid list_id FK
        varchar title
        text memo
        varchar priority
        date due_date
        int position
        timestamp created_at
        timestamp updated_at
    }

    BOARD ||--o{ LIST : "has"
    LIST ||--o{ CARD : "has"
```

## テーブル定義

### BOARD（ボード）
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | ボードの一意識別子 |
| title | VARCHAR(255) | NOT NULL | ボード名 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

### LIST（リスト）
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | リストの一意識別子 |
| board_id | UUID | FK → BOARD.id | 所属するボード |
| title | VARCHAR(255) | NOT NULL | リスト名（例: TODO / 進行中 / 完了） |
| position | INT | NOT NULL | 表示順（小さいほど左） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

### CARD（カード）
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | カードの一意識別子 |
| list_id | UUID | FK → LIST.id | 所属するリスト |
| title | VARCHAR(255) | NOT NULL | カードのタイトル |
| memo | TEXT | NULL可 | 詳細メモ |
| priority | VARCHAR(20) | NULL可 | 優先度（urgent / high / medium / low / null） |
| due_date | DATE | NULL可 | 期限日 |
| position | INT | NOT NULL | リスト内の表示順（小さいほど上） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

## 補足
- IDはすべてUUID（バックエンドで生成）
- `position` フィールドにより、リスト・カードの並び順を管理する
- D&Dで移動した際は、影響するレコードの `position` を更新する
- `priority` は urgent / high / medium / low の固定値、または NULL（なし）
- ラベル機能は優先度に統合したため、CARD_LABELテーブルは不要

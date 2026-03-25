---
name: commit-helper
description: サンドボックスモードで複数行のコミットメッセージを使用して Git コミットを作成します。HEREDOCが使えない環境で一時ファイルを活用します。
---

# 複数行コミットメッセージの作成

適切にフォーマットされた複数行のコミットメッセージで Git コミットを作成

## このスキルを使用するタイミング

以下の内容を含む詳細な複数行のコミットメッセージでコミットを作成する必要がある場合に使用：
- 明確で簡潔な件名
- 本文での追加の文脈や説明
- 課題や関連作業への参照
- 共同作成者の帰属

## 動作の仕組み

サンドボックスモードでの HEREDOC の制限を回避するため、`/tmp/claude/` に一時ファイルを作成

## Instructions

以下の手順に従ってコミットを作成：

### 1. 変更内容の確認

まず、git status でコミットされる変更を確認：

```bash
git status
```

git diff で変更内容の詳細を確認：

```bash
git diff
```

### 2. ファイルのステージング

まだステージされていない場合は、ファイルをステージング：

```bash
git add <files>
```

### 3. コミットメッセージファイルの作成

まず、古いファイルが残っている場合に備えて削除（`-f`オプションでファイルが存在しなくてもエラーにならない）：

```bash
rm -f /tmp/claude/commit-message.txt
```

その後、Write ツールを使用して `/tmp/claude/commit-message.txt` にコミットメッセージファイルを作成

**フォーマット**：

```
件名（50文字以内）

より詳細な説明文（必要に応じて）。約72文字程度で
折り返し。件名と本文を分ける空行は重要。

- 箇条書きも可能
- ハイフンやアスタリスクを使用

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### 4. コミットの実行

一時ファイルを使用してコミットを実行し、その後削除：

```bash
git commit -F /tmp/claude/commit-message.txt && rm /tmp/claude/commit-message.txt
```

### 5. コミットの確認

コミットが正常に作成されたことを確認：

```bash
git log -1 --format='%h %s'
```

または、詳細を確認する場合：

```bash
git log -1
```

## 重要な注意事項

- 一時ファイルは必ず `/tmp/claude/` に作成すること（サンドボックスで書き込み可能なディレクトリ）
- 使用後は必ず一時ファイルを削除すること（`&& rm /tmp/claude/commit-message.txt`）
- コミットメッセージを含むファイルを指定するには `-F` オプション（大文字の F）を使用すること
- `-f` オプションは別の意味なので注意
- コミットメッセージはプロジェクトの規約に従うこと

## Examples

### 基本的な使用例

```bash
# 1. 変更を確認
git status
git diff

# 2. ファイルをステージング
git add src/main.py README.md

# 3. 古い一時ファイルを削除してから、Write ツールでコミットメッセージを作成
rm -f /tmp/claude/commit-message.txt
# Write ツールで /tmp/claude/commit-message.txt を作成
# 内容:
# """
# ユーザー認証機能を追加
#
# - JWT トークンベースの認証を実装
# - ログイン/ログアウト API を追加
# - セッション管理を改善
#
# 🤖 Generated with [Claude Code](https://claude.com/claude-code)
#
# Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
# """

# 4. コミット実行と一時ファイル削除
git commit -F /tmp/claude/commit-message.txt && rm /tmp/claude/commit-message.txt

# 5. 確認
git log -1 --format='%h %s'
```

### バグ修正の例

```bash
# 古い一時ファイルを削除してから、Write ツールでコミットメッセージを作成
rm -f /tmp/claude/commit-message.txt
# Write ツールで /tmp/claude/commit-message.txt を作成
# 内容:
# """
# ログイン時のエラーハンドリングを修正
#
# 無効な認証情報が送信された場合に、サーバーがクラッシュ
# する問題を修正
#
# Fixes #123
#
# 🤖 Generated with [Claude Code](https://claude.com/claude-code)
#
# Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
# """

git commit -F /tmp/claude/commit-message.txt && rm /tmp/claude/commit-message.txt
```
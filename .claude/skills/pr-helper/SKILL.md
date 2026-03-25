---
name: pr-helper
description: サンドボックスモードで複数行の説明文を使用して GitHub プルリクエストを作成します。HEREDOCが使えない環境で一時ファイルを活用します。
---

# 複数行説明文でプルリクエストを作成

適切にフォーマットされた複数行の説明文で GitHub プルリクエストを作成

## このスキルを使用するタイミング

以下の内容を含む詳細な説明文でプルリクエストを作成する必要がある場合に使用：
- 変更内容の概要
- 変更の背景や理由
- テスト手順
- 関連する Issue への参照
- スクリーンショットやコード例

## 動作の仕組み

サンドボックスモードでの HEREDOC の制限を回避するため、`/tmp/claude/` に一時ファイルを作成

## Instructions

以下の手順に従ってプルリクエストを作成：

### 1. 現在のブランチと変更内容を確認

git status で現在のブランチを確認：

```bash
git status
```

git log でコミット履歴を確認：

```bash
git log origin/main..HEAD --oneline
```

### 2. 変更内容の差分を確認

メインブランチとの差分を確認：

```bash
git diff origin/main...HEAD
```

### 3. リモートに push

まだ push していない場合は、リモートに push（dangerouslyDisableSandbox: true で実行）：

```bash
git push -u origin <branch-name>
```

**注意**: git push はリモートリポジトリへの接続が必要なため、`dangerouslyDisableSandbox: true` を指定する必要があります。このパラメータはコマンド単位で指定され、次のコマンドには影響しません。

### 4. プルリクエスト説明文ファイルの作成

まず、古いファイルが残っている場合に備えて削除（`-f`オプションでファイルが存在しなくてもエラーにならない）：

```bash
rm -f /tmp/claude/pr-body.txt
```

その後、Write ツールを使用して `/tmp/claude/pr-body.txt` にプルリクエスト説明文を作成

**推奨フォーマット**：

```markdown
## 概要

この PR の目的を 1-2 文で簡潔に説明

## 変更内容

- 変更点1の説明
- 変更点2の説明
- 変更点3の説明

## 背景・理由

なぜこの変更が必要なのかを説明

## テスト手順

1. 手順1
2. 手順2
3. 期待される結果

## 関連 Issue

Closes #123

## スクリーンショット（必要に応じて）

![説明](画像URL)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. プルリクエストの作成

GitHub CLI (gh) を使用して PR を作成：

一時ファイルを使用して PR を作成し、その後削除：

```bash
gh pr create --title "PR タイトル" --body-file /tmp/claude/pr-body.txt && rm /tmp/claude/pr-body.txt
```

ベースブランチを指定する場合：

```bash
gh pr create --title "PR タイトル" --base main --body-file /tmp/claude/pr-body.txt && rm /tmp/claude/pr-body.txt
```

**注意**: gh コマンドもリモートリポジトリへの接続が必要なため、`dangerouslyDisableSandbox: true` を指定する必要があります。

### 6. プルリクエストの確認

PR が正常に作成されたことを確認：

```bash
gh pr view --web
```

または：

```bash
gh pr view
```

## 重要な注意事項

- 一時ファイルは必ず `/tmp/claude/` に作成すること（サンドボックスで書き込み可能なディレクトリ）
- 使用後は必ず一時ファイルを削除すること（`&& rm /tmp/claude/pr-body.txt`）
- `--body-file` オプションを使用してファイルから本文を読み込むこと
- PR タイトルは `--title` オプションで指定すること
- プロジェクトに PR テンプレートがある場合は、それに従うこと

## Examples

### 基本的な使用例

```bash
# 1. ブランチと変更を確認
git status
git log origin/main..HEAD --oneline
git diff origin/main...HEAD

# 2. リモートに push（dangerouslyDisableSandbox: true）
git push -u origin feature/user-auth

# 3. 古い一時ファイルを削除してから、Write ツールでPR説明文を作成
rm -f /tmp/claude/pr-body.txt
# Write ツールで /tmp/claude/pr-body.txt を作成
# 内容:
# """
# ## 概要
#
# ユーザー認証機能を実装
#
# ## 変更内容
#
# - JWT トークンベースの認証を実装
# - ログイン/ログアウト API を追加
# - セッション管理を改善
#
# ## テスト手順
#
# 1. アプリケーションを起動
# 2. `/api/login` にPOSTリクエストを送信
# 3. トークンが返されることを確認
#
# 🤖 Generated with [Claude Code](https://claude.com/claude-code)
# """

# 4. PR作成と一時ファイル削除（dangerouslyDisableSandbox: true）
gh pr create --title "ユーザー認証機能を追加" --base main --body-file /tmp/claude/pr-body.txt && rm /tmp/claude/pr-body.txt

# 5. 確認
gh pr view --web
```

### バグ修正の例

```bash
# 1. ブランチと変更を確認
git status
git log origin/main..HEAD --oneline

# 2. リモートに push（dangerouslyDisableSandbox: true）
git push -u origin fix/login-error

# 3. 古い一時ファイルを削除してから、Write ツールでPR説明文を作成
rm -f /tmp/claude/pr-body.txt
# Write ツールで /tmp/claude/pr-body.txt を作成
# 内容:
# """
# ## 概要
#
# ログイン時のエラーハンドリングを修正
#
# ## 変更内容
#
# - 無効な認証情報のバリデーションを追加
# - エラーレスポンスの形式を統一
# - 適切なHTTPステータスコードを返すように修正
#
# ## 背景・理由
#
# 無効な認証情報が送信された場合に、サーバーがクラッシュする
# 問題を修正
#
# ## 関連 Issue
#
# Fixes #123
#
# 🤖 Generated with [Claude Code](https://claude.com/claude-code)
# """

# 4. PR作成と一時ファイル削除（dangerouslyDisableSandbox: true）
gh pr create --title "ログイン時のエラーハンドリングを修正" --body-file /tmp/claude/pr-body.txt && rm /tmp/claude/pr-body.txt

# 5. 確認
gh pr view
```
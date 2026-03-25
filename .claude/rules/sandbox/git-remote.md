---
paths: ["**/*"]
---

# Git リモート操作

**git コマンドに限定**して、以下のリモート操作では `dangerouslyDisableSandbox: true` で実行すること：

- `git push`
- `git pull`
- `git fetch`
- `git clone`

理由：サンドボックスモードではDNS解決ができないため。

## ⚠️ 重要な注意事項

**この指示は git コマンドのみに適用されます。**

以下のような一般的なネットワークコマンドには適用しないこと：
- `curl`
- `wget`
- `nc` (netcat)
- その他のHTTPクライアント

これらのコマンドでネットワークアクセスが必要な場合は、`settings.json` の `sandbox.network.allowedDomains` にドメインを追加してください。

**誤った適用例：**
```bash
# ❌ 間違い：curlにdangerouslyDisableSandboxを適用してはいけない
curl https://www.google.com  # サンドボックス内で実行し、必要に応じて許可を求める
```

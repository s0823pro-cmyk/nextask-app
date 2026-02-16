# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信手順（最重要）

「Repository not found」というエラーが出る場合、登録したURLが間違っています。以下の手順でやり直してください。

### 1. GitHub リポジトリのURLをコピー
- GitHub で作成したリポジトリのページを開きます。
- 緑色の「<> Code」ボタンを押し、`https://github.com/.../nextask-app.git` というURLをコピーします。

### 2. ターミナルで設定をやり直す
画面下部の「Terminal」タブを開き、以下のコマンドを一行ずつ実行してください。

```bash
# 一度設定をリセット
git remote remove origin

# 正しいURLを登録（[コピーしたURL] の部分を自分のURLに書き換えてください）
git remote add origin [コピーしたURL]

# 送信を実行
git push -u origin main
```

**【注意】Username/Passwordを求められたら**
- `Username`: GitHubのユーザー名。
- `Password`: GitHubで発行した「パーソナルアクセストークン」。

---

## 🛠 トラブルシューティング

1.  **URLの貼り付け**: `[コピーしたURL]` という文字ごと貼り付けないように注意してください。`https://` で始まる自分のURLだけを貼り付けます。
2.  **ブラウザで確認**: 自分のリポジトリページを更新して、ファイルが表示されていれば成功です。

---

## 🚀 デプロイ手順（Firebase App Hosting）

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリを選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄（または `/`）
   - **リージョン**: `asia-east1` (台湾)
4. 「デプロイ」を実行。完了すると本番用URL（`.web.app`）が発行されます。

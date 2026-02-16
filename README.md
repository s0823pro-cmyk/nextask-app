# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信手順（最重要）

「ブランチ名が存在しない」というエラーが出る場合、GitHubへの送信がまだ完了していません。以下の手順を**一行ずつ**、ゆっくり実行してください。

### 1. GitHub リポジトリの準備
- GitHub で「空のリポジトリ」を作成します。
- **重要**: README、.gitignore、License の追加には**絶対チェックを入れない**でください。
- リポジトリの URL（`https://github.com/.../nextask-app.git`）をコピーします。

### 2. 開発環境のターミナルで実行
画面下部の「Terminal」タブを開き、以下のコマンドを一行ずつコピー＆ペーストして、毎回 **Enterキー** を押してください。

```bash
git init
git add .
git commit -m "initial version"
git branch -M main
git remote add origin [コピーしたURL]
git push -u origin main
```

**【注意】Username/Passwordを求められたら**
- `Username`: GitHubのユーザー名を入力してEnter。
- `Password`: パスワードではなく、GitHubで発行した「アクセストークン」を入力する必要があります。

---

## 🛠 トラブルシューティング：エラーが出る場合

1.  **ブラウザでGitHubを確認**: 自分のリポジトリページを開き、ファイルが表示されているか確認してください。
2.  **ファイルがない場合**: ターミナルで止まっていませんか？エラーが出ていたら教えてください。
3.  **再試行**: 以下の3行を順番に実行してください。
    ```bash
    git add .
    git commit -m "retry"
    git push -u origin main
    ```

---

## 🚀 デプロイ手順（Firebase App Hosting）

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリを選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄（または `/`）
   - **リージョン**: `asia-east1` (台湾)
4. 「デプロイ」を実行。完了すると本番用URL（`.web.app`）が発行されます。
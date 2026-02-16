# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信手順

### 1. GitHub リポジトリの準備
- GitHub で「空のリポジトリ」を作成します。
- **重要**: README、.gitignore、License の追加には**チェックを入れない**でください。
- リポジトリの URL（`https://github.com/.../nextask-app.git`）をコピーします。

### 2. 開発環境のターミナルで実行
画面下部の「Terminal」タブを開き、以下のコマンドを一行ずつ実行してください。

```bash
git init
git add .
git commit -m "initial version"
git branch -M main
git remote add origin [コピーしたURL]
git push -u origin main
```

---

## 🛠 トラブルシューティング：ブランチ名エラーが出る場合

「ブランチ名は、選択したリポジトリ内に存在している有効なブランチの名前である必要があります」と出る場合、**GitHubへの送信（Push）が完了していません。**

1.  **GitHubを確認**: ブラウザでリポジトリを開き、ファイルが表示されているか確認してください。
2.  **ターミナルを確認**: ユーザー名やパスワードを求められて止まっていませんか？
3.  **再試行**: ターミナルで以下を一行ずつ実行してください。
    ```bash
    git add .
    git commit -m "retry push"
    git push -u origin main
    ```

---

## 🚀 デプロイ手順（Firebase App Hosting）

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリを選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄（または `/`）
   - **リージョン**: `asia-east1` (台湾) または `asia-northeast1` (東京)
4. 「デプロイ」を実行。完了すると本番用URL（`.web.app`）が発行されます。

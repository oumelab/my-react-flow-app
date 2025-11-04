# Simple Mind-Map

React Flow と Jotai を使用したシンプルなマインドマップアプリケーションです。<br />
[React Road](https://react-road.b13o.com) の学習課題 [マインドマップアプリ](https://react-road.b13o.com/challenges/orange-mimdmap)に挑戦させていただいたものに独自機能を追加しました。

> [!NOTE]
> このリポジトリは、個人的な学習およびデモンストレーションの目的のみに使用されます。<br />
> This repository is for personal learning and demonstration purposes only.

## 機能

- ノードの追加・編集・削除
- ノード間の接続
- ドラッグ&ドロップで自由に配置
- ローカルストレージに自動保存
- Undo/Redo機能（最大50回）[#1](https://github.com/oumelab/my-react-flow-app/issues/1)

## 技術スタック

- React 19.1.1
- TypeScript 5.9.3
- Vite 7.1.7
- React Flow 12.9.2
- Jotai (状態管理)
- Tailwind CSS 4.1.16
- shadcn/ui

## セットアップ

このプロジェクトは [pnpm](https://pnpm.io/) を使用しています。

```bash
npm install -g pnpm

# リポジトリをクローン
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

## 使い方

1. **ノードを選択** - ノードをクリックして選択
2. **子ノードを追加** - 選択後、ヘッダーの「子要素の追加」ボタン
3. **ノードを編集** - 「編集」ボタンでラベルを変更
4. **ノードを削除** - 「削除」ボタンで削除
5. **Undo/Redo** - `Ctrl+Z` / `Ctrl+Shift+Z` (Mac: `Cmd+Z` / `Cmd+Shift+Z`)

## ビルド
```bash
pnpm build
```

## 追加予定の機能
- [x] Undo/Redo 機能 [#1](https://github.com/oumelab/my-react-flow-app/issues/1)
- [ ] インポート/エクスポート機能 [#2](https://github.com/oumelab/my-react-flow-app/issues/2)

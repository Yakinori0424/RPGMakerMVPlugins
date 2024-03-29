# YKNR_SnapshotExporter.js [Ver.1.0.1]
スクリーンショット機能の他、ウィンドウのみ/スプライトのみを  
画像ファイルとしてダウンロードできる関数を追加します。  
開発用に作ったこともあり、スクリーンショット以外に関してはJavaScriptの知識が多少必要になります。  
  
このプラグインで保存する画像の拡張子は jpg/png のみ対応しています。  
また、ブラウザ経由でダウンロードするため、ゲームがローカル上でなくても保存できます。  
(Safari/IE/Edge は未検証です)  
  
また、保存先がブラウザの設定依存になります。  
(ツクールからのテスト実行では、毎回保存場所を聞かれます。)

---
# YKNR_MZ_SnapshotExporter.js [Ver.1.0.0]

MZ版は、MV版の移植に加えて内部の処理も修正を加えています。  
以下はMV版との違いです。  

- 画面の撮影に限り、画像の左下に署名を記載する機能を追加

MZ版の実行には共通プラグインが必要になります。  
リンクは [ダウンロード](#ダウンロード) の項目からお願いします。  

---
---

<!-- ここからURL一覧 -->
[LICENSE]: ./LICENSE
[【Download for MV】]: https://raw.githubusercontent.com/Yakinori0424/RPGMakerMVPlugins/master/plugins/YKNR_SaveThumbnail/YKNR_SnapshotExporter.js
[【Download for MZ】]: https://raw.githubusercontent.com/Yakinori0424/RPGMakerMVPlugins/master/plugins/YKNR_SaveThumbnail/YKNR_MZ_SnapshotExporter.js
[共通プラグイン]: ../YKNR_Core
<!-- ここまでURL一覧 -->

## ダウンロード
*右クリック → 名前を付けて保存* でプラグインをダウンロードできます。  
[【Download for MV】][]  
[【Download for MZ】][]  

**MZ版の実行には、 [共通プラグイン][] が必要です！**  
**未導入の方はリンク先からダウンロードしてください。**

---
## 使用方法
* スクリーンショット機能を有効にする場合は、  
プラグインパラメータの **"スクリーンショットキー"** や **"装飾キー"** を設定してください。  
* ウィンドウ or スプライト を画像として保存する場合、いくつか関数を用意しているので  
それぞれを呼び出すだけで簡単に行えます。以下、用意している関数です。  

|関数|説明|
|:--|:--|
|Sprite.prototype.exportPNG()|このスプライトを png でダウンロードします。|
|Sprite.prototype.exportJPG(quality)|このスプライトを jpg でダウンロードします。引数で品質を*0-100*で指定できます。<br>未指定の場合は、プラグインパラメータの **"JPGの品質のデフォルト値"**  の値になります。|
|Window.prototype.exportPNG()|このウィンドウを png でダウンロードします。|
|Window.prototype.exportJPG(quality)|このウィンドウを jpg でダウンロードします。引数で品質を*0-100*で指定できます。<br>未指定の場合は、プラグインパラメータの **"JPGの品質のデフォルト値"**  の値になります。|

---
## License
ライセンスは MIT License です。  
[LICENSE][]

---
## Author
焼きノリ
[[Github](https://github.com/Yakinori0424/RPGMakerMVPlugins)]
[[Twitter](https://twitter.com/Noritake0424)]
[[欲しいもの](https://www.amazon.jp/hz/wishlist/ls/3HAY7QN91DUF2?ref_=wl_share)]

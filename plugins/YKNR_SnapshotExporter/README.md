# YKNR_SnapshotExporter.js [Ver.1.0.0]
スクリーンショット機能の他、ウィンドウのみ/スプライトのみを  
画像ファイルとしてダウンロードできる関数を追加します。  
開発用に作ったこともあり、スクリーンショット以外に関してはJavaScriptの知識が多少必要になります。  
  
このプラグインで保存する画像の拡張子は jpg/png のみ対応しています。  
また、ブラウザ経由でダウンロードするため、ゲームがローカル上でなくても保存できます。  
(Safari/IE/Edge は未検証です)  
  
また、保存先がブラウザの設定依存になります。  
(ツクールからのテスト実行では、毎回保存場所を聞かれます。)

---

<!-- ここからURL一覧 -->
[LICENSE]: ./LICENSE
[【Download】]: https://raw.githubusercontent.com/Yakinori0424/RPGMakerMVPlugins/master/plugins/YKNR_SnapshotExporter/YKNR_SnapshotExporter.js
<!-- ここまでURL一覧 -->

## ダウンロード
*右クリック → 名前を付けて保存* でプラグインをダウンロードできます。  
[【Download】][]

---
## 使用方法
* スクリーンショット機能を有効にする場合は、  
プラグインパラメータの **"スクリーンショットキー"** や **"装飾キー"** を設定してください。  
* ウィンドウ or スプライト を画像として保存する場合、いくつか関数を用意しているので  
それぞれを呼び出すだけで簡単に行えます。以下、用意している関数です。  

|関数|説明|
|:--|:--|
|Sprite.prototype.exportPNG()|このスプライトを png でダウンロードします。|
|Sprite.prototype.exportJPG(quality)|このスプライトを jpg でダウンロードします。<br>品質を0-100で指定することもできます。|
|Window.prototype.exportPNG()|このウィンドウを png でダウンロードします。|
|Window.prototype.exportJPG(quality)|このウィンドウを jpg でダウンロードします。<br>品質を0-100で指定することもできます。|

---
## License
ライセンスは MIT License です。  
[LICENSE][]

---
## Author
焼きノリ
[[Twitter](https://twitter.com/Noritake0424)]
[[Blog](http://mata-tuku.ldblog.jp/)]

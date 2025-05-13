# YKNR_MZ_Core.js [Ver.1.3.2]
焼きノリ作のプラグインのパラメータの解析/展開や、汎用性のある機能を纏めている共通プラグインです。  
このプラグインが無いと、他のプラグインは動作できません。  
  
**※本プラグインはMZ専用です。MVでの動作は想定していません。**
  
---

<!-- ここからURL一覧 -->
[LICENSE]: ./LICENSE
[【Download for MZ】]: https://raw.githubusercontent.com/Yakinori0424/RPGMakerMVPlugins/master/plugins/YKNR_Core/YKNR_MZ_Core.js
<!-- ここまでURL一覧 -->

## ダウンロード
*右クリック → 名前を付けて保存* でプラグインをダウンロードできます。  
[【Download for MZ】][]

---
## 使用方法
設定項目などは無く導入するだけでよいですが、  
おまけでいくつかのスクリプト機能を利用することができるようになります。  
以下に、一部を記載します。  
  
### 焼きノリ作のプラグインがインポート済みかどうか判定
~~~
YKNR.Core.isImported("HogeFuga");
~~~
### seed値を設定可能な擬似乱数生成クラス
~~~
 * const rI = new YKNR.Random.Uint(1); // seed値 1, 整数の乱数
 * console.log(rI.get()); // => 270369
~~~
~~~
 * const rF = new YKNR.Random.Float(1); // seed値 1, 小数の乱数
 * console.log(rF.get()); // => 0.00006295018829405308
~~~

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

# YKNR_StringInterpolation.js [Ver.1.0.0]
String クラスに、式展開した文字列を返す関数を追加します。  
  
バッククオート(``)を用いても式展開可能ですが、  
ツクールMV内の文字列は('' or "")がメインなため、  
文字列からそれっぽく展開できるようにしました。  

---

<!-- ここからURL一覧 -->
[LICENSE]: ./LICENSE
[【Download】]: https://raw.githubusercontent.com/Yakinori0424/RPGMakerMVPlugins/master/plugins/YKNR_StringInterpolation/YKNR_StringInterpolation.js
<!-- ここまでURL一覧 -->

## ダウンロード
*右クリック → 名前を付けて保存* でプラグインをダウンロードできます。  
[【Download】][]

---
## 使用方法
文字列中の *${(Javascript Code)}*  が式展開を行うコードとして認識できます。  
*(Javascript Code)* には、任意のJavascriptを記述します。  
このJavascriptの返り値が実際の文字列となります。  

以下のイベントコマンドのテキストは、本プラグインの機能により式展開が可能になっています。
* 「メッセージの表示」のテキスト
* 「選択肢の表示」の各選択肢のテキスト
* 「プラグインコマンド」のテキスト

<br>

以下のテキストは、本プラグインの機能により式展開が可能になっています。
* 各データベースのヘルプのテキスト
* バトルログのテキスト
* その他、convertEscapeCharacters を通したテキスト全て

<br>

---

通常は、上記の式展開用のフォーマットを記述しても普通の文字列として評価されますが、  
本プラグインで追加した式展開を行った結果を返す関数 String.prototype.interpolation で  
式展開後の文字列を返します。  


*(Javascript Code)* 部分をkeyとして扱い、  
別オブジェクトのkeyから値を取得する関数 String.prototype.template もおまけで実装しています。  
こちらも同様に、式展開後の文字列を返します。  



---
## スクリーンショット
![](./res/YKNR_StringInterpolation_01.jpg)<br><br>
![](./res/YKNR_StringInterpolation_02.jpg)<br><br>
![](./res/YKNR_StringInterpolation_03.jpg)<br><br>
![](./res/YKNR_StringInterpolation_04.jpg)<br><br>

---
## License
ライセンスは MIT License です。  
[LICENSE][]

---
## Author
焼きノリ
[[Twitter](https://twitter.com/Noritake0424)]
[[Blog](http://mata-tuku.ldblog.jp/)]

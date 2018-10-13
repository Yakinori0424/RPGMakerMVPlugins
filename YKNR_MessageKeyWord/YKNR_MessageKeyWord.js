//============================================================================
// YKNR_MessageKeyWord.js - ver.2.0.1
// ---------------------------------------------------------------------------
// Copyright (c) 2017 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc ゲームでよく使うキーワードを登録し、
 * 制御文字（\KW[***]）で呼び出せるようになります。
 * @author 焼きノリ
 * ===========================================================================
 * @param KeyWordList
 * @text キーワードの登録
 * @desc キーワードの一覧です。ここから登録を行います。
 * リストの空行を選択し、KeyとWordを入力してください。
 * @type struct<StructKeyWord>[]
 * @default ["{\"Key\":\"アクター1\",\"Word\":\"\\\\C[1]\\\\N[1]\\\\C[0]\"}","{\"Key\":\"アクター2\",\"Word\":\"\\\\C[1]\\\\N[2]\\\\C[0]\"}","{\"Key\":\"アクター3\",\"Word\":\"\\\\C[1]\\\\N[3]\\\\C[0]\"}","{\"Key\":\"アクター4\",\"Word\":\"\\\\C[1]\\\\N[4]\\\\C[0]\"}","{\"Key\":\"リーダー\",\"Word\":\"\\\\C[1]\\\\P[1]\\\\C[0]\"}"]
 *
 * @help
 * ===========================================================================
 *【！注意！】
 * ※ツクールMV本体のバージョンが 1.4.X 以前の場合、動作保証できません。
 * ===========================================================================
 *【機能紹介】
 * ゲーム中によく出る単語を本プラグインで纏めて管理できます。
 * RPGツクールアドバンスにあったキーワード機能を
 * 制御文字を用いて再現してみました。
 *
 * 重要な単語をここに登録して管理しておくことで、
 * 製作途中で名称変更することになった場合に編集がとても楽になります。
 * あちこちのマップで頻繁に出現する、
 * アクターではないキャラクターの名前なども管理することをお勧めします。
 *
 * 制御文字も登録できるので、
 * 特定の名詞や単語には毎回色を付けて強調表示させたいけど
 * その都度 /C[1]キーワード\C[0] とか書くのが面倒、
 * という場合にも本プラグインが機能してくれます。
 *
 * 制御文字は、他の方のプラグインによって追加された制御文字も
 * そのまま使用可能です。
 *
 * ---------------------------------------------------------------------------
 *【登録方法】
 * キーワードを登録するには、パラメータから Key と Word を設定します。
 *
 * Key には、Word を呼び出すのに必要な任意の文字列です。
 * 英数字、日本語で設定できます。記号はサポートしていません。
 *
 * Word には、表示する文字列を記入します。制御文字もサポートしています。
 *
 * ---------------------------------------------------------------------------
 *【利用方法】
 * 登録したキーワードを使用するには制御文字を活用します。
 * キーワード呼び出しの制御文字は \KW[***] です。
 * ※ *** には、キーワード登録時の Key の値を指定します。
 *
 * ---------------------------------------------------------------------------
 * サンプルとしてキーワードをいくつか登録していますので、
 * まずは、イベントコマンドの「メッセージ」から以下の制御文字を入力し、
 * ゲームを実行させて動作を確認してみてください。
 *
 * ・\KW[アクター1]  => アクターID1の名前をカラー番号1で表示
 * ・\KW[リーダー]   => パーティ1番目の名前をカラー番号1で表示
 *
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2018/10/14] [2.0.1] ・ただのソースコードの改修。実装内容に変更は無し。
 * [2017/10/15] [2.0.0] ・1.5.0 以降の仕様に合わせてパラメータの作り直し。
 *                        パラメータ名が変更になったため、再度設定が必要です。
 * [2017/02/11] [1.0.0] 公開
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * ---------------------------------------------------------------------------
 * 本プラグインは MITライセンス のもとで配布されています。
 * 利用はどうぞご自由に。
 * http://opensource.org/licenses/mit-license.php
*/
/*~struct~StructKeyWord:
 * @param Key
 * @desc キーワードを呼び出すための名前を登録します。
 * \KW[***] の *** にあたる部分です。
 * @default ここに新しいキー名
 *
 * @param Word
 * @desc 設定したKeyに対応した文字列を登録します。
 * 制御文字の使用も可能です。
 * @default ここに新しい単語
 */

(function() {
    'use strict';

    //------------------------------------------------------------------------
    /**
     * 対象のオブジェクト上の関数を別の関数に差し替えます.
     *
     * @method monkeyPatch
     * @param {Object} target 対象のオブジェクト
     * @param {String} methodName オーバーライドする関数名
     * @param {Function} newMethod 新しい関数を返す関数
     */
    function monkeyPatch(target, methodName, newMethod) {
        target[methodName] = newMethod(target[methodName]);
    };

    //------------------------------------------------------------------------
    /**
     * Jsonをパースし, プロパティの値を変換して返す
     *
     * @method jsonParamsParse
     * @param {String} json JSON文字列
     * @return {Object} パース後のオブジェクト
     */
    function jsonParamsParse(json) {
        return JSON.parse(json, parseRevive);
    };

    function parseRevive(key, value) {
        if (key === '') { return value; }
        try {
            return JSON.parse(value, parseRevive);
        } catch (e) {
            return value;
        }
    };

    /**
     * Jsonをパースして変換後, 配列ならば連想配列に変換して返す
     *
     * @method jsonParamsParse
     * @param {String} json JSON文字列
     * @param {String} keyName 連想配列のキーとする要素のあるプロパティ名
     * @param {String} valueName 連想配列の値とする要素のあるプロパティ名
     * @return {Object} パース後の連想配列
     */
    function parseArrayToHash(json, keyName, valueName) {
        let hash = {};
        const array = jsonParamsParse(json);
        if (Array.isArray(array)) {
            for (let i = 0, l = array.length; i < l; i++) {
                const key = array[i][keyName];
                if (key && key !== '') {
                    hash[key] = array[i][valueName] || null;
                }
            }
        }
        return hash;
    };

    //------------------------------------------------------------------------
    // パラメータを受け取る.
    var parameters = PluginManager.parameters('YKNR_MessageKeyWord');
    var keyWordTable = parseArrayToHash(parameters['KeyWordList'], 'Key', 'Word');

    //------------------------------------------------------------------------

    monkeyPatch(Window_Base.prototype, 'convertEscapeCharacters', function($) {
        return function(text) {
            let keyWord = null;
            text = text.replace(/\\KW\[(.+?)\]/gi, function() {
                keyWord = keyWordTable[arguments[1]];
                return keyWord !== undefined ? keyWord : '\\' + arguments[0];
            }.bind(this));
            return $.call(this, text);
        };
    });
})();

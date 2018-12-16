//============================================================================
// YKNR_StringInterpolation.js - ver.1.0.1
// ---------------------------------------------------------------------------
// Copyright (c) 2016 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc String クラスに、式展開した文字列を返す
 * interpolation関数, template関数 を追加します。
 * @author 焼きノリ
 * ===========================================================================
 *
 * @help
 * ===========================================================================
 * String クラスに以下の関数を追加します。
 * ・式展開した文字列を返す interpolation 関数
 * ・タグから展開した文字列を返す template 関数
 * ===========================================================================
 *【機能紹介】
 * Rubyの文字列中に #{...} と書くと
 * 中括弧の中身がRubyとして評価されるものと同じように、
 * 今回追加した関数を通せば、文字列から式の評価ができるようになります。
 *
 * また、ツクール内の以下のテキストを 式展開 に対応させます。
 * テキスト内に ${...} を書き、中括弧内にJavaScriptを書くだけで反映されます。
 * ・全ウィンドウのヘルプなどのテキスト
 *   (this : 各 Windowクラス)
 *
 * ・イベントコマンドのメッセージのテキスト
 * ・イベントコマンドの選択肢の文字列
 * ・イベントコマンドのプラグインコマンド
 *   (this : 実行している Game_Interpreterクラス)
 *
 * ---------------------------------------------------------------------------
 * サンプルコード：プラグインコマンド
 * ---------------------------------------------------------------------------
 * PluginCommandName ${10 * 10}
 * // => PluginCommandName 100
 * // PluginCommandName の引数を 100 として実行します。
 * ---------------------------------------------------------------------------
 * PluginCommandName ${$gameVariables.value(4)}
 * // => PluginCommandName (変数4の値)
 * // PluginCommandName の引数を 変数4番の値 として実行します。
 * ---------------------------------------------------------------------------
 * PluginCommandName ${$gameSwitches.value(2)?'OK':'CANCEL'}
 * // => PluginCommandName OK
 * // => スイッチ2がONなら、PluginCommandName の引数が OK になります。
 * // => PluginCommandName CANCEL
 * // => スイッチ2がOFFなら、PluginCommandName の引数が CANCEL になります。
 * ---------------------------------------------------------------------------
 *
 * 各プラグインやイベントコマンドのスクリプトからの利用方法は、
 * 文字列中に ${...} と中括弧内にJavaScriptを書いて、
 * その文字列から interpolation 関数を呼び出すと、
 * 展開後の文字列が返ってきます。
 * ---------------------------------------------------------------------------
 * サンプルコード：スクリプト interpolation
 * ---------------------------------------------------------------------------
 * var message = '';
 * message += '現在のマップのIDは ${$gameMap.mapId()}\n';
 * message += '現在のマップの表示名は ${$gameMap.displayName()} です。';
 *
 * console.log(message);
 * // => 現在のマップのIDは ${$gameMap.mapId()}
 * //    現在のマップの表示名は ${$gameMap.displayName()} です。
 *
 * console.log(message.interpolation(this));
 * // => 現在のマップのIDは 1
 * //    現在のマップの表示名は ダミーマップ です。
 * ---------------------------------------------------------------------------
 *
 * また、以下のサンプルのように ${...} ではタグを指定して
 * タグに対応する値を返すオブジェクトを用意して tag 関数を呼び出すことでも
 * 展開後の文字列が返ってきます。
 * こちらの方が interpolation より実行速度は早い(筈)です。
 * ---------------------------------------------------------------------------
 * サンプルコード：スクリプト template
 * ---------------------------------------------------------------------------
 * var message = '';
 * message += '現在のマップのIDは ${mapId}\n';
 * message += '現在のマップの表示名は ${abcdefg} です。';
 *
 * var values = {};
 * values['mapId'] = $gameMap.mapId();
 * values['abcdefg'] = $gameMap.displayName();
 *
 * console.log(message);
 * // => 現在のマップのIDは ${mapId}
 * //    現在のマップの表示名は ${abcdefg} です。
 *
 * console.log(message.template(values));
 * // => 現在のマップのIDは 1
 * //    現在のマップの表示名は ダミーマップ です。
 * ---------------------------------------------------------------------------
 *
 * バッククオート(``)を用いても式展開可能ですが、
 * ツクールMV内の文字列は('' or "")がメインであることと
 * テンプレート文字列が未対応のブラウザがあったりするようなので、
 * 今回自前で実装して、通常の文字列からそれっぽく展開できるようにしました。
 *
 * ---------------------------------------------------------------------------
 *【その他】
 * <!> Game_Interpreter.prototype.command356 を再定義しています。
 *
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2016/12/31] [1.0.0] 公開
 * [2018/12/17] [1.0.1] ヘルプの誤字だけ修正
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * ---------------------------------------------------------------------------
 * 本プラグインは MITライセンス のもとで配布されています。
 * 利用はどうぞご自由に。
 * http://opensource.org/licenses/mit-license.php
*/

(function() {
    'use strict';

    //------------------------------------------------------------------------
    var _interpolationFormat = /\${(.+?)}/g;

    //------------------------------------------------------------------------
    /**
     * Template literal を使用せずに 式展開 を実現.
     * eval を利用しているので実行速度は遅いです.
     * @method String.prototype.interpolation
     * @param {Object} thisArg : 置換時のthisのオブジェクト
     * @param {Boolean} requireExeption : 例外が起きた場合はそれをスローさせる
     * @return {String} 変換後の文字列
     */
    String.prototype.interpolation = function(thisArg, requireExeption) {
        if (this.search(_interpolationFormat) !== -1) {
            // マッチする文字列が見つかった時だけ変換.
            thisArg = thisArg || this;
            requireExeption = requireExeption === undefined ? true : requireExeption;
            return this.replace(_interpolationFormat, (function() {
                try {
                    return '' + eval(arguments[1]);
                } catch (e) {
                    if (requireExeption) {
                        throw e;
                    } else {
                        return '';
                    }
                }
            }).bind(thisArg));
        } else {
            return this.toString();
        }
    };

    /**
     * Template literal を使用せずに タグ付けされた式内挿法 を実現.
     * @method String.prototype.template
     * @param {Object} replaceObject : 変換するキーと値の連想配列
     * @param {Boolean} requireReceiver : レシーバーが無ければ例外をスローさせる
     * @return {String} 変換後の文字列
     */
    String.prototype.template = function(replaceObject, requireReceiver) {
        if (this.search(_interpolationFormat) !== -1) {
            // マッチする文字列が見つかった時だけ変換.
            requireReceiver = requireReceiver === undefined ? true : requireReceiver;
            return this.replace(_interpolationFormat, (function(all, key) {
                try {
                    return '' + replaceObject[key];
                } catch (e) {
                    if (requireReceiver) {
                        throw e;
                    } else {
                        return '';
                    }
                }
            }).bind(this));
        } else {
            return this.toString();
        }
    };

    //------------------------------------------------------------------------
    var _Window_Base_prototype_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function(text) {
        text = _Window_Base_prototype_convertEscapeCharacters.call(this, text);
        return text.interpolation(this);
    };

    //------------------------------------------------------------------------
    // Show Text
    var _Game_Interpreter_prototype_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function() {
        var commandResult = _Game_Interpreter_prototype_command101.call(this);
        // thisArg を Game_Interpreter に設定させるためここで式展開.
        for (var i = 0; i < $gameMessage._texts.length; i++) {
            $gameMessage._texts[i] = $gameMessage._texts[i].interpolation(this);
        }
        return commandResult;
    };

    var _Game_Interpreter_prototype_setupChoices = Game_Interpreter.prototype.setupChoices;
    Game_Interpreter.prototype.setupChoices = function(params) {
        _Game_Interpreter_prototype_setupChoices.call(this, params);
        // thisArg を Game_Interpreter に設定させるためここで式展開.
        for (var i = 0; i < $gameMessage.choices.length; i++) {
            $gameMessage.choices[i] = $gameMessage.choices[i].interpolation(this);
        }
    };

    // Plugin Command
    Game_Interpreter.prototype.command356 = function() {
        // thisArg を Game_Interpreter に設定させるためここで式展開.
        var args = ('' + this._params[0]).interpolation(this).split(" ");
        var command = args.shift();

        this.pluginCommand(command, args);
        return true;
    };
})();

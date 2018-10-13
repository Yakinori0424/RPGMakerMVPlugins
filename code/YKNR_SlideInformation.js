//============================================================================
// YKNR_SlideInformation.js - ver.2.0.0
// ---------------------------------------------------------------------------
// Copyright (c) 2017 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc テキストを右からスライドインさせるお知らせウィンドウ
 * @author 焼きノリ
 * ===========================================================================
 *
 * @param InfomationData
 * @text 表示するテキストの設定
 * @desc お知らせウィンドウに表示するテキストを登録します。
 * リストの空行を選択し、KeyとWordを入力してください。
 * @type struct<StructInfoData>[]
 * @default ["{\"Key\":\"test\",\"Word\":\"\\\\C[1]お知らせ\\\\C[0]の外部メッセージ呼び出しテストです。\"}"]
 *
 * @param WindowData
 * @text お知らせウィンドウの設定
 * @type struct<StructInfoWindow>
 * @desc ウィンドウの位置、サイズ、見た目を設定します。
 * @default {"posX":"340","posY":"0","width":"0","visibleLine":"1","lineHeight":"30","padding":"10","opacity":"-1","backOpacity":"-1","fontFace":"GameFont","fontSize":"22","skin":"Window"}
 *
 * @param SoundData
 * @text 再生するSEの設定
 * @desc お知らせウィンドウが開かれたときに再生する
 * SEを設定します。SE名を「なし」にすると再生しません。
 * @type struct<StructSoundEffect>
 * @default {"name":"Item1","volume":"90","pitch":"100","pan":"0"}
 *
 * @param SlideData
 * @text スライドイン/アウトの設定
 * @desc お知らせウィンドウ内のテキストの動作を設定します。
 * @type struct<StructSlideParams>
 * @default {"inDur":"60","inSpd":"0","enableEaseCubicOut":"true","outDur":"0","outSpd":"2.5","interval":"120"}
 *
 * @help
 * ===========================================================================
 *【！注意！】
 * ※ツクールMV本体のバージョンが 1.4.X 以前の場合、動作保証できません。
 * ===========================================================================
 * テキストを右からスライドインさせるお知らせウィンドウを提供します。
 * デフォルトでは画面上部に、マップ表示と被らないように表示しています。
 * ===========================================================================
 *【機能紹介】
 * 次の目的地や何かお知らせを画面に簡易的に表示するとき、
 * イベントのメッセージを出すことでユーザーに親切な設計にすることができますが
 * それだと、メッセージが終わるまでプレイヤーを動かすことができません。
 *
 * 本プラグインでは、そのような簡易なお知らせに
 * ぴったりなウィンドウを表示できるようになります。
 *
 * ---------------------------------------------------------------------------
 *【基本仕様】
 * ・プラグインパラメータにより、画面の好きな位置、幅で、
 * 　右から左へテキストをスライドさせて表示できる
 * ・マップ上でもバトル中でも表示可能
 *
 * ---------------------------------------------------------------------------
 *【ゲーム中の仕様】
 * ・プレイヤーの進行を妨げず、お知らせ表示中でもキャラを動かすことができる
 * ・お知らせウィンドウが機能するシーンは、マップ、バトルです
 * ・お知らせウィンドウ動作中に以下の状態になると、
 * 　テキストが全部表示されていなくても強制的に閉じます
 * 　・イベントの実行
 * 　・バトルが始まる
 * 　・バトルから戻る
 * ・お知らせウィンドウ動作中に以下の状態になると、
 * 　テキストをもう一度表示させます
 * 　・別のマップへ移動
 * 　・メニューを開く
 * ・マップ名が表示されている最中にお知らせを表示すると、
 * 　表示位置によってはマップ名に重なって表示されます。
 *
 * ---------------------------------------------------------------------------
 *【プラグインコマンド】
 * 2種類のコマンドを用意しています。
 *
 * --------------------------------------
 * お知らせの表示 王が呼んでる
 * --------------------------------------
 * プラグインパラメータで登録したKeyを使用してテキストを表示します。
 *
 * --------------------------------------
 * お知らせ再表示
 * --------------------------------------
 * 前回表示したお知らせをもう一度表示します。
 *
 * ---------------------------------------------------------------------------
 *
 *【スライドパラメータ設定例】
 *
 * ■デフォルトで設定している値
 * 　　スライドイン_時間：60
 * 　　スライドイン_速度：0
 * 　　スライドイン_等速：OFF
 * 　　スライドアウト_時間：0
 * 　　スライドアウト_速度：2.5
 * 　　スライドインターバル：120
 *
 * ■右から左へ等速で移動、途中は停止せずに最後まで等速。
 * 　全部表示したら閉じる
 * 　　スライドイン_時間：0
 * 　　スライドイン_速度：3
 * 　　スライドイン_等速：ON
 * 　　スライドアウト_時間：0
 * 　　スライドアウト_速度：3
 * 　　スライドインターバル：0
 *
 * ■スライドせずにパッと表示、150F停止後、スライドせずに閉じる。
 * 　ウィンドウより長いテキストは見切れる
 * 　　スライドイン_時間：0
 * 　　スライドイン_速度：0
 * 　　スライドイン_等速：ON
 * 　　スライドアウト_時間：0
 * 　　スライドアウト_速度：0
 * 　　スライドインターバル：150
 *
 *
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2017/10/15] [2.0.0] ・1.5.0 以降の仕様に合わせてパラメータの作り直し。
 *                        パラメータ名が変更になったため、再度設定が必要です。
 *                      ・お知らせのテキストを、外部データを用いずに
 *                        パラメータから設定する方式に変更。
 * [2017/03/05] [1.0.0] 公開
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * ---------------------------------------------------------------------------
 * 本プラグインは MITライセンス のもとで配布されています。
 * 利用はどうぞご自由に。
 * http://opensource.org/licenses/mit-license.php
*/
/*~struct~StructInfoData:
 * @param Key
 * @desc テキストを呼び出すための名前を登録します。
 * 他と被らないユニークな名前になるようにしてください。
 * @default ここに新しいキー名
 *
 * @param Word
 * @desc 設定したKeyに対応したテキストを登録します。
 * 制御文字の使用も可能です。
 * @default ここに新しいテキスト
 */
/*~struct~StructInfoWindow:
 * @param posX
 * @text X座標
 * @desc 表示するウィンドウのX座標を設定します。
 * ウィンドウの左上を原点としています。
 * @type number
 * @default 340
 *
 * @param posY
 * @text Y座標
 * @desc 表示するウィンドウのY座標を設定します。
 * ウィンドウの左上を原点としています。
 * @type number
 * @default 0
 *
 * @param width
 * @text ウィンドウ幅
 * @desc 表示するウィンドウの幅を設定します。
 * 0 の場合は、X座標から画面端までのサイズが設定されます。
 * @type number
 * @min 0
 * @default 0
 *
 * @param visibleLine
 * @text 表示行数
 * @desc 表示するウィンドウの行数を設定します。
 * 指定した行数分、ウィンドウの高さが調整されます。
 * @type number
 * @min 1
 * @default 1
 *
 * @param lineHeight
 * @text 一行辺りの高さ
 * @desc ウィンドウの高さを変更する場合はここで設定します。
 * 0 なら、Window_Base の lineHeight を参照します。
 * @type number
 * @min 0
 * @default 30
 *
 * @param padding
 * @text パディング
 * @desc ウィンドウのパディングを変更する場合はここで設定します。
 * -1 なら、Window_Base の standardPadding を参照します。
 * @type number
 * @min -1
 * @default 10
 *
 * @param opacity
 * @text ウィンドウ透明度
 * @desc テキスト以外の透明度を変更する場合はここで設定します。
 * -1 なら、デフォルトの 255 になります。
 * @type number
 * @min -1
 * @max 255
 * @default -1
 *
 * @param backOpacity
 * @text ウィンドウ背景透明度
 * @desc ウィンドウの背景の透明度を変更する場合はここで設定します。
 * -1 なら、Window_Base の standardBackOpacity を参照します。
 * @type number
 * @min -1
 * @max 255
 * @default -1
 *
 * @param fontFace
 * @text FontFace
 * @desc 使用するフォントを変更する場合はここで設定します。
 * 未指定なら、Window_Base の standardFontFace を参照します。
 * @type string
 * @default GameFont
 *
 * @param fontSize
 * @text フォントサイズ
 * @desc フォントサイズを変更する場合はここで設定します。
 * 0 なら、Window_Base の standardFontSize を参照します。
 * @type number
 * @min 0
 * @default 22
 *
 * @param skin
 * @text ウィンドウスキン
 * @desc 別のスキン使用する場合はここでファイル名を設定します。
 * 未指定なら、デフォルトの Window が設定されます。
 * @type file
 * @require 1
 * @dir img/system/
 * @default Window
 */
/*~struct~StructSoundEffect:
 * @param name
 * @text SE名
 * @desc ウィンドウが開かれたときに再生するSEの名前を設定します。
 * 未指定にすると再生を行いません。
 * @type file
 * @require 1
 * @dir audio/se/
 * @default Item1
 *
 * @param volume
 * @text 音量
 * @desc ウィンドウが開かれたときに再生するSEの音量を設定します。
 * 未指定だと、デフォルトの 90 になります。
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param pitch
 * @text ピッチ
 * @desc ウィンドウが開かれたときに再生するSEのピッチを設定します。
 * 未指定だと、デフォルトの 100 になります。
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param pan
 * @text 位相
 * @desc ウィンドウが開かれたときに再生するSEの位相を設定します。
 * 未指定だと、デフォルトの 0 になります。
 * @type number
 * @min -100
 * @max 100
 * @default 0
 */
/*~struct~StructSlideParams:
 * @param inDur
 * @text スライドイン_時間
 * @desc スライドインする時間をフレーム単位で設定します。
 * 時間を指定する場合、速度は0に設定しないと動作しません。
 * @type number
 * @min 0
 * @default 60
 *
 * @param inSpd
 * @text スライドイン_速度
 * @desc スライドインする速度を設定します。
 * 速度を指定する場合、時間は0に設定しないと動作しません。
 * @type number
 * @min 0
 * @decimals 2
 * @default 0
 *
 * @param enableEaseCubicOut
 * @text Easingの適用
 * @desc スライドインする動作をカーブか等速かを選択できます。
 * カーブは「Cubic Out」を採用しています。
 * @type boolean
 * @on カーブ
 * @off 等速
 * @default true
 *
 * @param outDur
 * @text スライドアウト_時間
 * @desc スライドアウトする時間をフレーム単位で設定します。
 * 時間を指定する場合、速度は0に設定しないと動作しません。
 * @type number
 * @min 0
 * @default 0
 *
 * @param outSpd
 * @text スライドアウト_速度
 * @desc スライドアウトする速度を設定します。
 * 速度を指定する場合、時間は0に設定しないと動作しません。
 * @type number
 * @min 0
 * @decimals 2
 * @default 2.5
 *
 * @param interval
 * @text スライドインターバル
 * @desc スライドインとスライドアウトの間の一時停止する時間を
 * フレーム単位で指定します。
 * @type number
 * @min 0
 * @default 150
 */

(function() {
    'use strict';

    //------------------------------------------------------------------------
    /**
     * Jsonをパースし, プロパティの値を変換して返す
     *
     * @method jsonParamsParse
     * @param {String} json JSON文字列
     * @return {Object} パース後のオブジェクト
     */
    var jsonParamsParse = function(json) {
        return JSON.parse(json, parseRevive);
    };

    var parseRevive = function(key, value) {
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
     * @method parseArrayToHash
     * @param {String} json JSON文字列
     * @param {String} keyName 連想配列のキーとする要素のあるプロパティ名
     * @param {String} valueName 連想配列の値とする要素のあるプロパティ名
     * @return {Object} パース後の連想配列
     */
    var parseArrayToHash = function(json, keyName, valueName) {
        var hash = {};
        var array = jsonParamsParse(json);
        if (Array.isArray(array)) {
            for (var i = 0; i < array.length; i++) {
                var key = array[i][keyName];
                if (key && key !== '') {
                    hash[key] = array[i][valueName] || null;
                }
            }
        }
        return hash;
    };


    //------------------------------------------------------------------------
    // パラメータを受け取る.
    var parameters = PluginManager.parameters('YKNR_SlideInformation');

    var infomationTable = parameters['InfomationData'];
    var infomationData = parseArrayToHash(infomationTable, 'Key', 'Word');
    var windowData = jsonParamsParse(parameters['WindowData']);
    var seData = jsonParamsParse(parameters['SoundData']);
    var slideData = jsonParamsParse(parameters['SlideData']);

    //------------------------------------------------------------------------
    var _informationMessage = '';
    var _openInformation = false;

    //------------------------------------------------------------------------
    // 拡張プラグインコマンドの任意の引数判定用文字列.
    var VAR = '%$';
    var pluginCommands = [
        ['お知らせの表示', VAR, function(args) { setInformationMessage(args[0]); openInformation(); }],
        ['お知らせ再表示', function(args) { openInformation(); }],
    ];

    /**
     * リストから一致する拡張プラグインコマンドの走査と実行
     *
     * @method executeExtendPluginCommand
     * @param {Game_Interpreter} thisArg インスタンス
     * @param {Array<Array>} list [コマンド名, 各引数名, 実行関数] からなる2次元配列
     * @param {String} command コマンド名
     * @param {Array<String>} args コマンドの引数
     * @return {Boolean} 実行されたら true を返します
     */
    var executeExtendPluginCommand = function(thisArg, list, command, args) {
        for (var i = 0; i < list.length; i++) {
            var extData = list[i];
            var extCommand = extData[0];
            var extArgs = extData.slice(1, -1);
            if (!checkExtendPluginCommand(extCommand, extArgs, command, args)) {
                continue;
            }

            // 実行.
            var method = extData[extData.length - 1];
            if (typeof method === "string") {
                thisArg[method](args);
            } else {
                method.call(thisArg, args);
            }
            return true;
        }
        return false;
    };

    /**
     * 対象の拡張プラグインコマンドか判定
     *
     * @method checkExtendPluginCommand
     * @param {String} extCommand 拡張プラグインコマンド名
     * @param {Array<String>} extArgs 拡張プラグインコマンド引数
     * @param {String} command コマンド名
     * @param {Array<String>} args コマンドの引数
     * @return {Boolean} 実行可能なら true を返します
    */
    var checkExtendPluginCommand = function(extCommand, extArgs, command, args) {
        // コマンド名が一致しているか判定.
        if (extCommand !== command) {
            return false;
        }

        // 引数が一致しているか判定.
        for (var i = 0; i < extArgs.length; i++) {
            var extArg = extArgs[i];

            // 任意の引数ではないなら次の判定へ.
            if (extArg !== VAR) {
                // 引数が一致していないなら実行できない.
                if (extArg !== args[i]) {
                    return false;
                }
            }
        }

        return true;
    };

    //------------------------------------------------------------------------
    var _Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        if (!executeExtendPluginCommand(this, pluginCommands, command, args)) {
            _Game_Interpreter_prototype_pluginCommand.call(this, command, args);
        }
    };

    //------------------------------------------------------------------------
    /**
     * お知らせのテキストを設定.
     *
     * @method setInformationMessage
     * @param {String} key 表示するお知らせのKey.
    */
    var setInformationMessage = function(key) {
        if (key) {
            _informationMessage = infomationData[key] || '';
        } else {
            _informationMessage = '';
        }
    };

    /**
     * お知らせの表示開始. 事前にテキスト設定済みであれば有効化される.
     *
     * @method openInformation
    */
    var openInformation = function() {
        _openInformation = !!_informationMessage;
    };

    /**
     * お知らせを閉じる.
     *
     * @method closeInformation
    */
    var closeInformation = function() {
        _openInformation = false;
    };

    //------------------------------------------------------------------------
    /**
     * お知らせ一覧を取得する.
     *
     * @method getInfomationTable
    */
    Game_System.prototype.getInfomationTable = function() {
        return infomationTable;
    };

    /**
     * -----------------------------------------------------------------------
     * Window_Information
     *
     * お知らせ表示用のウィンドウ. テキストのスライド処理も含まれている.
     * @constructor
     */
    function Window_Information() {
        this.initialize.apply(this, arguments);
    }

    Window_Information.prototype = Object.create(Window_Base.prototype);
    Window_Information.prototype.constructor = Window_Information;

    /**
     * 初期化処理
     *
     * @method Window_Information.prototype.initialize
    */
    Window_Information.prototype.initialize = function() {
        var x = windowData.posX;
        var y = windowData.posY;
        var w = windowData.width;
        w = (w > 0) ? w : Graphics.boxWidth - x;
        var num = windowData.visibleLine;
        var h = this.fittingHeight(num);
        Window_Base.prototype.initialize.call(this, x, y, w, h);
        this.hide();
        this.openness = 0;

        if (windowData.opacity >= 0) {
            this.opacity = windowData.opacity;
        }
        this.initMembers();
    };

    /**
     * メンバー変数の初期化処理
     *
     * @method Window_Information.prototype.initMembers
    */
    Window_Information.prototype.initMembers = function() {
        this._text = '';
        this._textState = null;
        this._endClose = false;
        this._isRunningCurrentEvent = false;
        this._isObserveEvent = false;
    };

    Window_Information.prototype.lineHeight = function() {
        if (windowData.lineHeight > 0) {
            return windowData.lineHeight;
        } else {
            return Window_Base.prototype.lineHeight.call(this);
        }
    };

    Window_Information.prototype.standardFontFace = function() {
        if (windowData.fontFace) {
            return windowData.fontFace;
        } else {
            return Window_Base.prototype.standardFontFace.call(this);
        }
    };

    Window_Information.prototype.standardFontSize = function() {
        if (windowData.fontSize > 0) {
            return windowData.fontSize;
        } else {
            return Window_Base.prototype.standardFontSize.call(this);
        }
    };

    Window_Information.prototype.standardPadding = function() {
        if (windowData.padding >= 0) {
            return windowData.padding;
        } else {
            return Window_Base.prototype.standardPadding.call(this);
        }
    };

    Window_Information.prototype.standardBackOpacity = function() {
        if (windowData.backOpacity >= 0) {
            return windowData.backOpacity;
        } else {
            return Window_Base.prototype.standardBackOpacity.call(this);
        }
    };

    Window_Information.prototype.loadWindowskin = function() {
        var skin = windowData.skin;
        if (skin) {
            this.windowskin = ImageManager.loadSystem(skin);
        } else {
            Window_Base.prototype.loadWindowskin.call(this);
        }
    };

    Window_Information.prototype.close = function() {
        Window_Base.prototype.close.call(this);
        this.terminateMessage();
    };

    /**
     * テキスト表示関連のメンバー変数を削除します.
     *
     * @method Window_Information.prototype.terminateMessage
    */
    Window_Information.prototype.terminateMessage = function() {
        if (this._endClose) {
            closeInformation();
        }
        this._textState = null;
        this._isRunningCurrentEvent = false;
        this._isObserveEvent = false;
    };

    Window_Information.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateInformation();
    };

    /**
     * 閉じるときに更新する処理. 閉じ終えたら非表示にします.
     *
     * @method Window_Information.prototype.updateClose
    */
    Window_Information.prototype.updateClose = function() {
        if (this.isClosing()) {
            Window_Base.prototype.updateClose.call(this);
            if (this.isClosed()) {
                this.hide();
            }
        }
    };

    /**
    * お知らせ全体の更新処理. パラメーターを監視して自動で開閉処理を行います.
    *
    * @method Window_Information.prototype.updateInformation
   */
    Window_Information.prototype.updateInformation = function() {
        while (!this.isOpening() && !this.isClosing()) {
            this.updateObserveEventRunning();

            if (this.updateMessage()) {
                return;
            } else if (this.canStart()) {
                this.startMessage();
            } else if (this.isAutoEndMessage()) {
                this._endClose = false;
                this.endMessage();
                return;
            } else {
                return;
            }
        }
    };

    /**
    * お知らせを設定したイベントの終了を監視する処理.
    *
    * @method Window_Information.prototype.updateObserveEventRunning
   */
    Window_Information.prototype.updateObserveEventRunning = function() {
        if (this._isObserveEvent) {
            if ($gameMap.isEventRunning() || $gameTroop.isEventRunning()) {
                this._isRunningCurrentEvent = true;
            } else {
                this._isRunningCurrentEvent = false;
                this._isObserveEvent = false;
            }
        }
    };

    /**
     * お知らせ表示処理の開始が可能か判定.
     *
     * @method Window_Information.prototype.canStart
     * @return {Boolean} 開始可能なら true を返します
    */
    Window_Information.prototype.canStart = function() {
        if (!$gameMap.isEventRunning() && !$gameTroop.isEventRunning()) {
            return !!_openInformation && !!_informationMessage;
        }
        return false;
    };

    /**
     * お知らせ表示開始処理.
     *
     * @method Window_Information.prototype.startMessage
    */
    Window_Information.prototype.startMessage = function() {
        this._isObserveEvent = true;
        this._text = _informationMessage;
        var convert_text = this.convertEscapeCharacters(this._text);
        this._textState = {};
        this._textState.phese = 0;
        this._textState.phese1_counter = 0;
        this._textState.width = this.textWidth(convert_text);
        this._textState.width += this.standardFontSize();
        this._textState.slidein = this.createTweenObject();
        this._textState.slidein.from = -this.contentsWidth();
        this._textState.slidein.to = 0;
        this._textState.slidein.speed = slideData.inSpd;
        this._textState.slidein.duration = slideData.inDur;
        if (slideData.enableEaseCubicOut) {
            this._textState.slidein.easing = this.updateSlideCurve;
        }
        this._textState.slideout = this.createTweenObject();
        this._textState.slideout.from = 0;
        this._textState.slideout.to = this._textState.width;
        this._textState.slideout.speed = slideData.outSpd;
        this._textState.slideout.duration = slideData.outDur;

        this.origin.x = this._textState.slidein.calc();

        if (seData.name) {
            AudioManager.playSe(seData);
        }

        this.refresh();
        this.show();
        this.open();
    };

    /**
     * お知らせ表示終了処理.
     *
     * @method Window_Information.prototype.endMessage
    */
    Window_Information.prototype.endMessage = function() {
        this.close();
        this._endClose = false;
    };

    /**
     * お知らせのスライドイン/アウトの更新処理. 
     *
     * @method Window_Information.prototype.updateMessage
     * @return {Boolean} 更新中なら true を返します
    */
    Window_Information.prototype.updateMessage = function() {
        if (this.isRunningMessage()) {
            switch (this._textState.phese) {
                case 0:
                    this.origin.x = this._textState.slidein.calc();
                    if (this._textState.slidein.progress < 1) {
                        return true;
                    }
                    this._textState.phese++;
                case 1:
                    if (++this._textState.phese1_counter < slideData.interval) {
                        return true;
                    }
                    this._textState.phese++;
                case 2:
                    this.origin.x = this._textState.slideout.calc();
                    if (this._textState.slideout.progress < 1) {
                        return true;
                    }
                    this._textState.phese++;
            }
            this._endClose = true;
            this.endMessage();
            return true;
        } else {
            return false;
        }
    };

    /**
     * Tween処理に使用するオブジェクトを取得します.
     *
     * @method Window_Information.prototype.createTweenObject
     * @return {Object} 基本処理やプロパティのオブジェクト を返します
    */
    Window_Information.prototype.createTweenObject = function() {
        return {
            _rate: function(current) {
                var rate = 1;
                if (this.duration > 0 && this.speed === 0) {
                    rate = current / this.duration;
                } else if (this.duration === 0 && this.speed > 0) {
                    var total = (this.to - this.from) / this.speed;
                    rate = current / total;
                }
                return rate.clamp(0, 1);
            },
            calc: function() {
                this.progress = this._rate(this._current++);
                var easing_rate = this.easing(this.progress);
                return this.from + (this.to - this.from) * easing_rate;
            },
            easing: function(rate) { return rate; },
            _current: 0,
            progress: 0,
            from: 0,
            to: 0,
            duration: 0,
            speed: 0,
        };
    };

    /**
     * Tweenのカーブ処理を返します.
     *
     * @method Window_Information.prototype.createTweenObject
     * @param {Number} k : 進行率
     * @return {Number} 進行率からの現在の割合を返します
    */
    Window_Information.prototype.updateSlideCurve = function(k) {
        // Tween Cubic Out.
        return --k * k * k + 1;
    };

    /**
     * お知らせのテキスト処理実行中か判定.
     *
     * @method Window_Information.prototype.isRunningMessage
     * @return {Boolean} 実行中なら true を返します
    */
    Window_Information.prototype.isRunningMessage = function() {
        if (this._textState) {
            return !this.isAutoEndMessage();
        }
        return false;
    };

    /**
     * お知らせのテキスト処理の自動終了判定.
     *
     * @method Window_Information.prototype.isAutoEndMessage
     * @return {Boolean} 自動終了できるなら true を返します
    */
    Window_Information.prototype.isAutoEndMessage = function() {
        if (this.isOpen() && !this._isRunningCurrentEvent) {
            // 新たにイベントが実行されたなら強制終了.
            if ($gameMap.isEventRunning() || $gameTroop.isEventRunning()) {
                return true;
            }
            // 現在と違うテキストが設定されているならば終了.
            return this._text != _informationMessage;
        }
        return false;
    };

    /**
     * ウィンドウの内容の短形のサイズを更新します.
     *
     * @method Window_Information.prototype.resizeContents
    */
    Window_Information.prototype.resizeContents = function(width, height) {
        this.contents.resize(width, height);
        this._windowContentsSprite._refresh();
    };

    /**
     * ウィンドウの内容を更新します.
     *
     * @method Window_Information.prototype.refresh
    */
    Window_Information.prototype.refresh = function() {
        var w = this._textState ? this._textState.width : this.contents.width;
        var h = this.contents.height;
        this.contents.clear();
        this.resizeContents(w, h);
        this.drawTextEx(this._text, this.textPadding(), 0);
    };

    //------------------------------------------------------------------------
    /**
     * お知らせのテキストを返します.
     *
     * @method Game_System.prototype.getInfomation
     * @return {String} 
    */
    Game_System.prototype.getInfomation = function() {
        return this._information |= '';
    };

    /**
     * お知らせのテキストを設定します.
     *
     * @method Game_System.prototype.setInfomation
     * @param {String} new_info 設定するテキスト
    */
    Game_System.prototype.setInfomation = function(new_info) {
        this._information = new_info;
    };

    //------------------------------------------------------------------------
    var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createInformationWindow();
    };

    /**
     * お知らせウィンドウの作成.
     *
     * @method Scene_Map.prototype.createInformationWindow
    */
    Scene_Map.prototype.createInformationWindow = function() {
        this._informationWindow = new Window_Information();
        this.addChild(this._informationWindow);

        // マップ & メニュー以外のシーンから来た場合はメッセージをリセット.
        if (!SceneManager.isPreviousScene(Scene_Map)) {
            if (!SceneManager.isPreviousScene(Scene_Menu)) {
                setInformationMessage('');
            }
        }
    };

    //------------------------------------------------------------------------
    var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        _Scene_Battle_terminate.call(this);
        // バトル終了時はメッセージをリセット.
        setInformationMessage('');
    };

    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createInformationWindow();
    };

    /**
     * お知らせウィンドウの作成.
     *
     * @method Scene_Battle.prototype.createInformationWindow
    */
    Scene_Battle.prototype.createInformationWindow = function() {
        this._informationWindow = new Window_Information();
        this.addWindow(this._informationWindow);
        setInformationMessage('');
    };

})();

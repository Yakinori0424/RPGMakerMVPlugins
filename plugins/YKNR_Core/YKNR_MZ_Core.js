//============================================================================
// YKNR_MZ_Core.js
// ---------------------------------------------------------------------------
// (c) 2022 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 1.0.0 (2022/05/06) 公開
//            : 1.1.0 (2022/05/26) Coreにプラグインコマンド登録関数の追加
//            : 1.1.1 (2022/06/02) データURL読み込み処理を本体v.1.5.0に合わせる
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @plugindesc 焼きノリ作のプラグインのパラメータの解析/展開や
 * 汎用性のある機能を纏めている共通プラグインです。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_Core
 *
 * 
 * @help YKNR_MZ_Core.js
 * ----------------------------------------------------------------------------
 *  *【！注意！】
 * ※ツクールMZのバージョンが 1.3.2 未満の場合、動作できません。
 * ----------------------------------------------------------------------------
 * 【クラス別機能解説】
 * 
 * ■ YKNR.Core
 * 焼きノリが製作及び公開しているプラグインの実行に必要なクラスです。
 * プラグインパラメータの解析や変換、再定義関数などを持っています。
 * 基本的には、ユーザーがこれを利用することは想定していませんが、
 * プラグインがインポート済みかどうか判定する関数は利用可能です。
 * プラグインの名前(サブフォルダは不要)を引数に判定できます。
 * ○ YKNR.Core.isImported("HogeFuga");
 * × YKNR.Core.isImported("SubFolder/HogeFuga");
 * 
 * 
 * ■ YKNR.Extension
 * 既存処理を再定義して拡張した新たな関数を
 * 別の複数のプラグインで再定義して利用できるよう纏めたクラス。
 * ユーザーがこれを利用することは想定していません。
 * 
 * 
 * ■ YKNR.TweenManager
 * イージング機能を使ってオブジェクトのプロパティを操作する機能のクラスです。
 * このプラグインでは、イージング関数は Liner のみ用意しています。
 * 
 * 
 * ■ YKNR.Random.Uint or YKNR.Random.Float
 * XorShiftを使用した擬似乱数生成クラス。
 * シード値による再現性のある乱数の出力が可能です。
 * const rI = new YKNR.Random.Uint(1); // seed値 1, 整数の乱数
 * console.log(rI.get()); // => 270369
 * 
 * const rF = new YKNR.Random.Float(1); // seed値 1, 小数の乱数
 * console.log(rF.get()); // => 0.00006295018829405308
 * 
 * 
 * ■ YKNR.UtilObject
 * オブジェクトに対し何らかの操作を行う関数を纏めてあります。
 * 便利そうだなと思ったものが時々追加されるかもしれません。
 * こちらは、ユーザーが利用しても構わんよ、という緩いスタンスです。
 * 
 * ■ YKNR.UtilCalculation
 * 数値の計算などの関数を纏めてあります。
 * 便利そうだなと思ったものが時々追加されるかもしれません。
 * こちらは、ユーザーが利用しても構わんよ、という緩いスタンスです。
 * 
 * 
 * ■ YKNR.UtilDataUrl
 * 画像のデータURLを展開する機能を纏めたクラスです。
 * ユーザーがこれを利用することは想定していません。
 * 
 * 
 * ■ ImageManager.clearAt
 * 任意のキャッシュキーの画像を削除する関数。
 * これいる？
 * 
 * 
 * ■ Bitmap.snapExt
 * Bitmap.snap のサイズ指定版。
 * 
*/

/**
 * プラグインコマンド登録の構造体
 * @typedef PulginCommandData
 * @property {string} k コマンド名
 * @property {Function} f 実行関数
 */


(() => {
    "use strict";
    const YKNR = window.YKNR ||= {};

    // =======================================================================
    // プラグインを作成するために用いる関数たち
    YKNR.Core = (() => {
        const _imported = {};

        class YKNR_Core {
            /**
             * 読み込み済みのプラグインか判定
             *
             * @param {string} pluginName プラグインのファイル名(サブフォルダは不要)
             * @return {boolean} 読み込み済みであれば true を返す
             */
            static isImported(pluginName) {
                return _imported[pluginName] !== undefined;
            }

            /**
             * 実行中のプラグインを _imported へ追加し, そのプラグインパラメータを返します.\
             * ゲーム中に取得することはできません.\
             * 以降, isImported(pluginName) で判定できます.
             *
             * @return {Object} パースしたプラグインパラメータ
             */
            static importCurrentPlugin() {
                const pluginName = this.pluginName();
                _imported[pluginName] = true;
                return this.pluginParams(pluginName);
            }

            /**
             * 実行中のプラグインの名前を取得します.\
             * ゲーム中に取得することはできません.\
             *
             * @return {string} 実行中プラグインのファイル名
             */
            static pluginName() {
                const currentScript = document.currentScript;
                const pulginPath = currentScript?.src.replace(/^.*\/plugins\/(.*).js$/,
                    (match, p1) => decodeURIComponent(p1));
                return Utils.extractFileName(pulginPath);
            }

            /**
             * プラグインのパラメータをパースして返します.
             *
             * @param {string} pluginName プラグインのファイル名
             * @return {Object} パースしたプラグインパラメータ
             */
            static pluginParams(pluginName) {
                const parameters = PluginManager.parameters(pluginName);
                const jsonStrings = JSON.stringify(parameters, this.paramReplacer);
                const parsedParams = JSON.parse(jsonStrings, this.paramReviver);
                return parsedParams;
            }

            /**
             * プラグインパラメータのJson文字列変換への置き換え関数
             *
             * @param {string} key
             * @param {Object} value
             * @return {Object}
             */
            static paramReplacer(key, value) {
                // Boolean
                if (value === "true" || value === "false") {
                    return value === "true";
                }

                // Number
                if (Number(value).toString() === value) {
                    return Number(value);
                }

                // Array or Object
                if (value[0] === "[" && value[value.length - 1] === "]"
                    || value[0] === "{" && value[value.length - 1] === "}") {
                    return JSON.parse(value);
                }

                // String or AnyType
                return value;
            }

            /**
             * プラグインパラメータのJsonからオブジェクトへの変換関数
             *
             * @param {string} key
             * @param {string} value
             * @return {Object}
             */
            static paramReviver(key, value) {
                // パラメータ名を元に変換
                if ([/^.+?Map$/, /^.+?Dictionary$/].some((reg) => reg.test(key))) {
                    // value to Map
                    return YKNR_Core.convertArrayToMap(value);
                } else if ([/^.+?Function$/, /^.+?Callback$/, /^On[A-Z].+$/].some((reg) => reg.test(key))) {
                    // value to Function
                    return YKNR_Core.convertValuetoFunction(value);
                }

                // Raw
                return value;
            }

            /**
             * 配列内のオブジェクトのプロパティを利用して, 配列をMapオブジェクトに変換します.\
             * プロパティには key, value が必須です.
             *
             * @param {Array<Object>} array 基とする配列
             * @return {Map<string,Object>} 変換後のMapオブジェクト
             */
            static convertArrayToMap(array) {
                const map = new Map();
                if (Array.isArray(array)) {
                    // Mapオブジェクト変換可否チェック
                    const k = "key", v = "value";
                    console.assert(array.every((a) => a.hasOwnProperty(k) && a.hasOwnProperty(v)));
                    for (let i = 0, l = array.length; i < l; i++) {
                        const keyName = array[i][k];
                        if (map.has(keyName)) {
                            console.error("key名が重複しています! : %1\n\o".format(keyName), array);
                        }
                        map.set(keyName, array[i][v]);
                    }
                }
                return map;
            }

            /**
             * 渡された引数から無名関数に変換します.\
             * オブジェクトの場合, プロパティには jsCode が必須, さらに引数が必要な場合は argFormat です.
             *
             * @param {string|Object} value 引数 or スクリプトコード
             * @return {Function} 無名関数
             */
            static convertValuetoFunction(value) {
                // 関数変換可否チェック
                if (typeof (value) === "string") {
                    if (value[0] === "\"" && value[value.length - 1] === "\"") {
                        // String(Note) to Function(引数なし)
                        return this.toFunction(JSON.parse(value));
                    } else {
                        // String to Function(引数なし)
                        return this.toFunction(value);
                    }
                } else if (typeof (value) === "object") {
                    console.assert(value.hasOwnProperty("jsCode"));
                    /** @type {string} */
                    const code = value.jsCode;
                    if (code[0] === "\"" && code[code.length - 1] === "\"") {
                        // Object(Note jsCode) to Function(引数あり)
                        return this.toFunction(value.argFormat, JSON.parse(code));
                    } else {
                        // Object to Function(引数あり)
                        return this.toFunction(value.argFormat, code);
                    }
                }
                // empty function
                return (function() { });
            }

            /**
             * スクリプトを実行する関数を返します.\
             * JavaScriptとして実行する無名関数を返す即時関数を評価しています.
             *
             * @param {string} argsOrCode 引数 or スクリプトコード
             * @param {string} code 引数がある場合のスクリプトコード(引数なしの場合は省略可)
             * @return {Function} 渡されたコードを実行する無名関数
             *
             * @example
             * // 引数3つの合計値を返すコード
             * const xyzTotal = YKNR.Core.toFunction("x,y,z", "return x+y+z;");
             * console.log(xyzTotal(2, 3, 4));
             * // => 9
             *
             * // 0個以上の引数の合計値を返すコード
             * const total = YKNR.Core.toFunction("...a", "return a.reduce((b, c) => b + c, 0);");
             * console.log(total(2, 3, 4, 5, 6));
             * // => 20
             */
            static toFunction(argsOrCode, code = undefined) {
                argsOrCode = argsOrCode || '';
                const _args = code !== undefined ? argsOrCode : '';
                const _code = code !== undefined ? code : argsOrCode;
                return Function(`"use strict"; return (function(${_args}) { ${_code} });`)();
            }

            /**
             * 対象のオブジェクト上の関数を再定義します.
             *
             * @param {Object} target 対象のオブジェクト
             * @param {string} methodName 再定義する関数名
             * @param {Function} newMethod 新しい関数を返す関数
             *
             * @example
             * YKNR.Core.redefine(Game_Temp.prototype, "initialize", function($) {
             *     return function() {
             *         // 再定義前の旧関数の実行
             *         $.call(this);
             *
             *         // 追加したい処理
             *         this.newMemberValue = 0;
             *     };
             * });
             */
            static redefine(target, methodName, newMethod) {
                target[methodName] = newMethod(target[methodName]);
            }

            /**
             * プラグインコマンドの一括登録
             *
             * @param {Array<PulginCommandData>} commandDataList 拡張プラグインコマンド
            */
            static registerPluginCommands(commandDataList) {
                const pluginName = this.pluginName();
                for (const commandData of commandDataList) {
                    PluginManager.registerCommand(pluginName, commandData.k, commandData.f);
                }
            };

        };

        return YKNR_Core;
    })();
    /*
    // 第三者向けの使用例メモ
    if (YKNR.Core.isImported("otherPluginName")) {
    }
    */


    // =======================================================================
    // 既存処理を拡張した新たな関数を, 複数のプラグインで再定義できるよう纏めたクラス.
    // 該当の関数を拡張する場合は, ここで用意した関数を再定義する.
    YKNR.Extension = (() => {
        class YKNR_Extension {
            /**
             * DataManager.onLoad から呼び出される, 拡張用のコールバック関数.\
             * DataManager._databaseFiles 内の全データの読み込みが完了したタイミングで実行される
             *
             */
            static onCompleteLoadDatabase() {
            }

            /**
             * DataManager.onLoad から呼び出される, 拡張用のコールバック関数.\
             * DataManager._databaseFiles に無いデータの読み込みが完了したタイミングで実行される
             *
             * @param {Object} object Jsonから変換されたオブジェクトデータ
             */
            static onLoadOtherData(object) {
            }
        };

        // -------------------------------------------------------------------
        // ロード時の挙動調整
        let _isLoadDataCompleted = false;

        YKNR.Core.redefine(DataManager, "loadDatabase", function($) {
            return function() {
                _isLoadDataCompleted = false;
                $.call(this);
            };
        });

        YKNR.Core.redefine(DataManager, "onLoad", function($) {
            return function(object) {
                $.call(this, object);

                const databaseNames = this._databaseFiles.map(file => file.name);
                const isDatabaseObj = databaseNames.some(name => window[name] === object);

                // すべてのデータベースを読み込んだ時点で実行する
                if (!_isLoadDataCompleted && isDatabaseObj && DataManager.isDatabaseLoaded()) {
                    _isLoadDataCompleted = true;
                    YKNR_Extension.onCompleteLoadDatabase();
                }

                // データベース以外のものを読み込んだとき実行する
                if (!isDatabaseObj) {
                    YKNR_Extension.onLoadOtherData(object);
                }
            };
        });

        return YKNR_Extension;
    })();


    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    //console.log(parameters);


    // =======================================================================
    // Tween機能を持ったマネージャクラス
    YKNR.TweenManager = (() => {
        let _tweens = {};
        let _tweenId = 0;
        let _visibleLog = false;

        /**
         * -----------------------------------------------------------------------
         * Tweenを管理するマネージャ.
         */
        class TweenManager {
            /**
             * @throws インスタンスを作成すると, 例外をスロー
             */
            constructor() {
                throw new Error("This is a static class");
            }

            static get _id() {
                return _tweenId++;
            }

            /**
             * オブジェクトをTweenに登録します.
             *
             * @param {Object} target 任意のオブジェクト
             * @return {TweenEngine} TweenEngineオブジェクト
             */
            static setup(target) {
                return new TweenEngine(target);
            }

            /**
             * コンソールへログを出力するようにします.\
             * テストモード時のみ有効です.
             *
             * @param {boolean} visible 出力するなら true
             */
            static outputLog(visible) {
                _visibleLog = visible && ["test", "btest", "etest"].some((opt) => Utils.isOptionValid(opt));
            }

            static _add(tween) {
                _tweens[tween.id] = tween;
            }

            static _remove(tween) {
                delete _tweens[tween.id];
            }

            static _clear() {
                _tweens = {};
            }

            static _update() {
                const keys = Object.keys(_tweens);
                for (let i = 0, l = keys.length; i < l; i++) {
                    if (!_tweens[keys[i]]._update()) {
                        this._remove(_tweens[keys[i]]);
                    }
                }
            }

            static _addEasing(name, easeIn, isInOut) {
                if (isInOut) {
                    const easeStr = "\"use strict\"; return (function(p) { return %1} });";
                    const easeOutStr = easeStr.format("1 - In(1 - p);");
                    const easeInOutStr = easeStr.format("p < 0.5 ? In(p * 2) / 2 : 1 - In(p * -2 + 2) / 2;");
                    this.Easing[name + "In"] = easeIn;
                    this.Easing[name + "Out"] = Function("In", easeOutStr)(easeIn);
                    this.Easing[name + "InOut"] = Function("In", easeInOutStr)(easeIn);
                } else {
                    this.Easing[name] = easeIn;
                }
            }
        }

        /**
         * イージング関数
         * @enum {Function}
         */
        TweenManager.Easing = {
            Liner: function(p) { return p; },
        };

        YKNR.Core.redefine(SceneManager, "updateMain", function($) {
            return function() {
                $.call(this);
                TweenManager._update();
            };
        });

        /**
         * -----------------------------------------------------------------------
         * Tween処理を行うクラス.
         */
        class TweenEngine {
            constructor() {
                this._initialize.apply(this, arguments);
            }

            get id() {
                return this._id;
            }

            /**
             * 再生中判定
             * @return {boolean} 再生中なら true を返します
             */
            get isPlaying() {
                return this._playing;
            }

            /**
             * 一時停止中判定
             * @return {boolean} 一時停止中なら true を返します
             */
            get isPaused() {
                return this._pause;
            }

            _initialize(target) {
                this._target = target;
                this._id = TweenManager._id;
                this._playCount = 0;
                this._delayCount = 0;
                this._repeatCount = 0;
                this._playing = false;
                this._initTweenParams();
                this._initCallbackParams();
            }

            _initTweenParams() {
                this._toProps = {};
                this._fromProps = {};
                this._decDigits = 4;
                this._duration = 60;
                this._speed = 0;
                this._delay = 0;
                this._repeat = 0;
                this._repeatDelay = 0;
                this._pause = false;
                this._easing = TweenManager.Easing.Liner;
            }

            _initCallbackParams() {
                this._onStart = null;
                this._onUpdate = null;
                this._onComplete = null;
                this._onStop = null;
                this._onPause = null;
                this._onResume = null;
            }

            /**
             * プロパティ別に目的値を設定します
             *
             * @param {Object} toProps 変化させるプロパティを含んだ連想配列
             * @return {TweenEngine} 自身を返します
             *
             * @example
             * let sampleObj = {x:0, y:0, z:0};
             * const toProps = {x:100, z:250};
             * TweenManager.setup(sampleObj).to(toProps).duration(60).start();
             * // => 60フレームかけて, sampleObj のプロパティは {x:100, y:0, z:250} になる
             */
            to(toProps) {
                this._toProps = toProps;
                return this;
            }

            /**
             * プロパティ別に初期値を設定します。
             * 未設定の場合でも開始時の値を初期値とするので、この呼び出しは必須ではありません
             *
             * @param {Object} fromProps 変化させるプロパティの初期値を含んだ連想配列
             * @return {TweenEngine} 自身を返します
             *
             * @example
             * let sampleObj = {x:0, y:0, z:0};
             * const toProps = {x:100, z:250};
             * const fromProps = {x:50};
             * TweenManager.setup(sampleObj).to(toProps).from(fromProps).duration(60).start();
             * console.log(sampleObj);
             * // => 60フレームかけて, sampleObj のプロパティは
             * //   {x:50, y:0, z:0} から {x:100, y:0, z:250} になる
             */
            from(fromProps) {
                this._fromProps = fromProps;
                return this;
            }

            /**
             * 小数点以下の桁数を設定します。
             * 設定した桁数を超える場合は切り捨てます。初期値には 4 が設定されています
             *
             * @param {number} digits 小数点以下の桁数
             * @return {TweenEngine} 自身を返します
             *
             * @example
             * let sampleObj = {x:0, y:0, z:0};
             * const toProps = {x:100.9};
             * const dDigits = 0;
             * TweenManager.setup(sampleObj).to(toProps).decimalDigits(dDigits).start().end();
             * console.log(sampleObj);
             * // {x:100, y:0, z:0}
             */
            decimalDigits(digits) {
                this._decDigits = digits;
                return this;
            }

            /**
             * 変化する時間(フレーム)を設定します。
             * この関数で時間を設定すると、speed関数の設定は無効になります。
             * 初期値には 60 が設定されています
             *
             * @param {number} amount  変化させる時間(フレーム数)
             * @return {TweenEngine} 自身を返します
             */
            duration(amount) {
                this._duration = amount;
                this._speed = 0;
                return this;
            }

            /**
             * 1フレームごとの変化量を設定します。
             * この関数で時間を設定すると、duration関数の設定は無効になります
             *
             * @param {number} amount 変化量
             * @return {TweenEngine} 自身を返します
             */
            speed(amount) {
                this._speed = amount;
                this._duration = 0;
                return this;
            }

            /**
             * start関数が呼ばれてから実際に変化が開始するまでの遅延フレーム数を設定します
             *
             * @param {number} amount 遅延フレーム数
             * @return {TweenEngine} 自身を返します
             */
            delay(amount) {
                this._delay = amount;
                return this;
            }

            /**
             * 連続再生する回数を設定します
             *
             * @param {number} count 連続再生回数
             * @return {TweenEngine} 自身を返します
             */
            repeat(count) {
                this._repeat = Math.max(0, count);
                return this;
            }

            /**
             * 連続再生する場合、実際に変化が開始するまでの遅延フレーム数を設定します
             *
             * @param {number} amount 遅延フレーム数
             * @return {TweenEngine} 自身を返します
             */
            repeatDelay(amount) {
                this._repeatDelay = amount;
                return this;
            }

            /**
             * 再生回数を1回に設定します。repeat(0) と同じ挙動です
             * 初期値は 0 のため、この呼び出しは必須ではありません
             *
             * @return {TweenEngine} 自身を返します
             */
            once() {
                this._repeat = 0;
                return this;
            }

            /**
             * ユーザーが任意に停止させるまで無限に再生をし続けます。
             * repeat関数、once関数、pingpong関数でこの設定を変更できます。
             *
             * @return {TweenEngine} 自身を返します
             */
            loop() {
                this._repeat = -1;
                return this;
            }

            /**
             * ユーザーが任意に停止させるまで無限に再生をし続けます。
             * loop関数と違い、往復するように変化します。
             * repeat関数、once関数、loop関数でこの設定を変更できます。
             *
             * @return {TweenEngine} 自身を返します
             */
            pingpong() {
                this._repeat = -2;
                return this;
            }

            /**
             * 変化のカーブを設定します。
             * 初期値には TweenManager.Easing.Liner が設定されています
             *
             * @param {Function} easing イージング関数
             * @return {TweenEngine} 自身を返します
             *
             * @example
             * let sampleObj = {x:0, y:0, z:0};
             * const toProps = {x:100, z:250};
             * TweenManager.setup(sampleObj).to(toProps).easing(TweenManager.Easing.Liner).start();
             */
            easing(easing) {
                this._easing = easing;
                return this;
            }

            /**
             * start関数呼び出し時に実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onStart(callback) {
                this._onStart = callback;
                return this;
            }

            /**
             * 変化中の毎フレーム実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onUpdate(callback) {
                this._onUpdate = callback;
                return this;
            }

            /**
             * 変化完了時に実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onComplete(callback) {
                this._onComplete = callback;
                return this;
            }

            /**
             * 停止時に実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onStop(callback) {
                this._onStop = callback;
                return this;
            }

            /**
             * 一時停止時に実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onPause(callback) {
                this._onPause = callback;
                return this;
            }

            /**
             * 一時停止から再生時に実行する処理を設定します
             *
             * @param {Function} callback 関数
             * @return {TweenEngine} 自身を返します
             */
            onResume(callback) {
                this._onResume = callback;
                return this;
            }

            /**
             * 設定された項目を元に変化処理を開始します
             *
             * @return {TweenEngine} 自身を返します
             */
            start() {
                if (!this._target) {
                    console.error("【TweenEngine】対象のオブジェクトが消失したため実行を中止します!");
                    return;
                }

                if (this._playing) {
                    return;
                }

                TweenManager._add(this);
                this._playCount = 0;
                this._delayCount = this._delay;
                this._repeatCount = this._repeat;
                this._playing = true;
                this._pause = false;

                if (_visibleLog)
                    console.log("【TweenEngine】start. " + (typeof this._target));

                // プロパティの初期値設定.
                this._initProps();

                if (this._onStart) {
                    this._onStart(this._target);
                }
                return this;
            }

            /**
             * 再生中の動作を停止します
             *
             * @return {TweenEngine} 自身を返します
             */
            stop() {
                if (!this._playing) {
                    return;
                }

                TweenManager._remove(this);
                this._playing = false;

                if (this._onStop) {
                    this._onStop(this._target);
                }
                return this;
            }

            /**
             * 再生中の動作を停止させ、目的値まで変化させます
             *
             * @return {TweenEngine} 自身を返します
             */
            end() {
                this._updatePlay(1);

                TweenManager._remove(this);

                if (this._onComplete && !this._playing) {
                    this._onComplete(this._target);
                }
                return this;
            }

            /**
             * 再生中の動作を一時停止させます
             *
             * @return {TweenEngine} 自身を返します
             */
            pause() {
                if (!this._playing || this._pause) {
                    return;
                }

                TweenManager._remove(this);
                this._pause = true;

                if (this._onPause) {
                    this._onPause(this._target);
                }
                return this;
            }

            /**
             * 一時停止から再生させます
             *
             * @return {TweenEngine} 自身を返します
             */
            resume() {
                if (!this._playing || !this._pause) {
                    return;
                }

                TweenManager.add(this);
                this._pause = false;

                if (this._onResume) {
                    this._onResume(this._target);
                }
                return this;
            }

            /**
             * 再生中の動作を中断します.\
             * end との違いは, 目的値にセットせずコールバックを実行しません.
             *
             * @return {TweenEngine} 自身を返します
             */
            abort() {
                if (!this._playing) {
                    return;
                }

                TweenManager._remove(this);

                this._playing = false;

                return this;
            }

            _initProps() {
                // from が未設定の場合は現在値を適用する.
                for (let prop in this._toProps) {
                    if (this._fromProps[prop] === undefined) {
                        const now = this._target[prop];
                        this._fromProps[prop] = now || 0;
                    }
                }
            }

            _update() {
                if (!this._target) {
                    console.error("【TweenEngine】対象のオブジェクトが消失したため実行を中止します!");
                    return false;
                }

                if (!this._pause) {
                    if (this._delayCount > 0) {
                        this._delayCount--;

                        if (_visibleLog)
                            console.log("【TweenEngine】" + (typeof this._target) + " delay " + this._delayCount.padZero(3));

                    } else {
                        this._updatePlay();

                        if (this._onUpdate) {
                            this._onUpdate(this._target);
                        }
                    }
                }

                if (this._onComplete && !this._playing) {
                    this._onComplete(this._target);
                }

                return this._playing;
            }

            _updatePlay(forceProgress) {
                const current = this._playCount++;

                let continued = [];
                for (let prop in this._fromProps) {
                    continued.push(this._updateProp(prop, current, forceProgress));
                }

                const active = continued.some(function(v) { return v; });
                if (!active && this._repeatCount !== 0) {
                    switch (this._repeatCount) {
                        case -1: // loop
                            break;
                        case -2: // pingpong
                            this._toProps = [this._fromProps, this._fromProps = this._toProps][0];
                            break;
                        default: // repeat
                            this._repeatCount--;
                            break;
                    }

                    this._playCount = 0;
                    this._delayCount = this._repeatDelay || this._delay;
                    this._playing = true;
                } else {
                    this._playing = active;
                }
            }

            _updateProp(prop, current, forceProgress) {
                const to = this._toProps[prop];
                const from = this._fromProps[prop];
                const progress = forceProgress || this._getProgress(to, from, current);
                const continued = progress < 1;

                let result = 0;
                if (continued) {
                    const easing_rate = this._easing(progress);
                    result = from + (to - from) * easing_rate;

                    if (this._decDigits === 0) {
                        result = Math.floor(result);
                    } else {
                        result = Math.floor(result * Math.pow(10, this._decDigits)) / Math.pow(10, this._decDigits);
                    }
                } else {
                    result = to;
                }

                this._target[prop] = result;

                if (_visibleLog)
                    console.log("【TweenEngine】" + (typeof this._target) + " " + current.padZero(3) + " \"" + prop + "\" = " + this._target[prop]);

                return continued;
            }

            _getProgress(to, from, current) {
                let progress = 1;
                if (this._duration > 0 && this._speed === 0) {
                    progress = current / this._duration;
                } else if (this._duration === 0 && this._speed > 0) {
                    const total = (to - from) / this._speed;
                    progress = current / total;
                }
                return progress.clamp(0, 1);
            }
        }

        return TweenManager;
    })();
    /*
    YKNR.TweenManager.Easing.Liner = function(p) {
        return p;
    };
    */
    // =======================================================================
    // XorShift を用いたseed値指定が可能な符号なし32bitの乱数を生成するクラスのオブジェクト.
    YKNR.Random = (() => {
        const UINT32_MAX_NEXT = 2 ** 32;

        class XorShiftU32 {
            constructor(seed) {
                // 初期シード値の指定が無ければ現在日時を用いる
                this._s = (seed !== undefined ? seed : Date.now()) >>> 0;
            }

            /**
             * 乱数生成処理
             *
             * @return {number} 符号なし32bitのランダムな整数.
             */
            _next() {
                this._s = (this._s ^ (this._s << 13)) >>> 0;
                this._s = (this._s ^ (this._s >>> 17)) >>> 0;
                this._s = (this._s ^ (this._s << 5)) >>> 0;
                return this._s;
            }
        }

        class Uint extends XorShiftU32 {
            /**
             *  符号なし32bitのランダムな整数を取得する.
             *
             * @return {number}
             */
            get() {
                return this._next();
            }

            /**
             * 2つの間のランダムな整数を取得する.
             *
             * @param {number} min 最小値の整数(inclusive)
             * @param {number} max 最大値の整数(exclusive or inclusive)
             * @param {boolean} isInclusiveMaximum 最大値を含むなら true
             * @return {number}
             */
            range(min, max, isInclusiveMaximum = false) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor((this._next() / UINT32_MAX_NEXT) * (max - min + (isInclusiveMaximum ? 1 : 0)) + min);
            }
        }

        class Float extends XorShiftU32 {
            /**
             * 0以上1未満のランダムな浮動小数点数を取得する.
             *
             * @return {number}
             */
            get() {
                return this._next() / UINT32_MAX_NEXT;
            }


            /**
             * 2つの間のランダムな浮動小数点数を取得する.\
             * 最大値は含みません.
             *
             * @param {number} min 最小値の整数(inclusive)
             * @param {number} max 最大値の整数(exclusive)
             * @return {number}
             */
            range(min, max) {
                return (this._next() / UINT32_MAX_NEXT) * (max - min) + min;
            }
        }

        return { Uint, Float };
    })();


    // =======================================================================
    // オブジェクト処理の便利関数たち
    YKNR.UtilObject = (() => {
        class UtilObject {
            /**
             * 任意のオブジェクト以下にある全オブジェクトを凍結させる
             *
             * @param {Object} obj オブジェクト
             */
            static deepFreeze(obj) {
                if (obj) {
                    const names = Object.getOwnPropertyNames(obj);
                    for (let prop of names) {
                        if (typeof (obj[prop]) === "object") {
                            this.deepFreeze(obj[prop]);
                        }
                    }
                    return Object.freeze(obj);
                }
            }

            /**
             * 任意のプロパティを削除します. 存在しない場合は何もしません
             *
             * @param {Object} obj オブジェクト
             * @param {string} propName プロパティ名
             */
            static safeDelete(obj, propName) {
                if (obj && propName && obj[propName] !== undefined) {
                    delete obj[propName];
                }
            }
        }

        return UtilObject;
    })();


    // =======================================================================
    // 計算処理の便利関数たち
    YKNR.UtilCalculation = (() => {
        class UtilCalculation {
            /**
             * 累積確率を返す
             *
             * @param {number} prob 0-100の抽選確率. (N %)
             * @param {number} count 抽選回数
             * @return {number} 抽選される確率
             */
            static cumulativeProb(prob, count) {
                return 1.0 - Math.pow(1.0 - prob / 100, count);
            }

            /**
             * 累積確率を返す.\
             * ツクールのドロップアイテムの設定仕様に合わせて分母での計算に対応.
             *
             * @param {number} denominator 抽選確率の分母
             * @param {number} count 抽選回数
             * @return {number} 抽選される確率
             */
            static cumulativeProb2(denominator, count) {
                return 1.0 - Math.pow(1.0 - 1.0 / denominator, count);
            }
        }

        return UtilCalculation;
    })();


    // =======================================================================
    // データURLを扱う便利関数たち
    YKNR.UtilDataUrl = (() => {
        /** データURLのフォーマット */
        const regDataUrlFormat = /^data:(?<mine>[a-z\/]+);(?<params>(?:(?:.+?=.+?);)+)*?base64,[a-zA-Z0-9\+\/=]+$/;
        /** 文字列のエンコード/デコードの対象の文字の一覧 */
        const encodeMap = {
            "%": "%25",
            "=": "%3D",
            ";": "%3B",
            "+": "%2B",
            " ": "+",
            "　": "%E3%80%80",
        };

        class YKNR_UtilDataUrl {

            /**
             * データURLか判定
             *
             * @param {string} url URL
             * @return {boolean} データURLのフォーマットであれば true を返す
             */
            static test(url) {
                return regDataUrlFormat.test(url);
            }

            /**
             * 画像フォーマットのMINEタイプか判定
             *
             * @param {string} dataUrl データURL
             * @return {boolean} JPEG or PNG であれば true を返す
             */
            static isImageMineType(dataUrl) {
                const minetype = this.extractMimeType(dataUrl);
                return ["image/jpeg", "image/png"].some((e) => e === minetype);
            }

            /**
             * データURLのパラメータとして組み込めるよう, 文字列をエンコードする.
             *
             * @param {string} str エンコード前の文字列
             * @return {string} エンコード後の文字列
             */
            static encode(str) {
                Object.entries(encodeMap).forEach(([k, v]) => str = str.replace(k, v));
                return str;
            }

            /**
             * エンコードされたデータURLのパラメータの文字列をデコードする.
             *
             * @param {string} str エンコード前の文字列
             * @return {string} エンコード後の文字列
             */
            static decode(str) {
                Object.entries(encodeMap).reverse().forEach(([k, v]) => str = str.replace(v, k));
                return str;
            }

            /**
             * データURLに任意のパラメータを埋め込む.
             *
             * @param {string} dataUrl データURL
             * @param {string} key パラメータのキー
             * @param {number|string} value パラメータの値
             * @return {string} パラメータを埋め込んだ新しいデータURL
             */
            static _setParam(dataUrl, key, value) {
                key = this.encode(key);
                const newParamsetText = `${key}=${this.encode(value + '')}`;

                // key を探して既にあれば置換して返す.
                const paramset = (dataUrl.match(regDataUrlFormat).groups.params || "").split(";");
                for (const params of paramset) {
                    const param = params.split("=");
                    if (param[0] === key) {
                        return dataUrl.replace(params, newParamsetText);
                    }
                }

                return dataUrl.replace(/;base64/, ";" + newParamsetText + ";base64");
            }

            /**
             * データURL内の任意のパラメータを抽出する.
             *
             * @param {string} dataUrl データURL
             * @param {string} key パラメータのキー
             * @return {string} key に対応したデコードされたパラメータの値
             */
            static _getParam(dataUrl, key) {
                key = this.encode(key);

                // key を探して既にあれば パラメータ をデコードして返す.
                const paramset = (dataUrl.match(regDataUrlFormat).groups.params || "").split(";");
                for (const params of paramset) {
                    const param = params.split("=");
                    if (param[0] === key) {
                        return this.decode(param[1]);
                    }
                }

                return null;
            }

            /**
             * データURLに関数実行時の日時を "date" として埋め込む.
             *
             * @param {string} dataUrl データURL
             * @return {string} "date"パラメータを埋め込んだ新しいデータURL
             */
            static setDateNow(dataUrl) {
                return this._setParam(dataUrl, "date", Date.now());
            }

            /**
             * データURLに任意のパラメータを "ext" として埋め込む.
             *
             * @param {string} dataUrl データURL
             * @param {string} newValue パラメータ
             * @return {string} "ext"パラメータを埋め込んだ新しいデータURL
             */
            static setExtParam(dataUrl, newValue) {
                return this._setParam(dataUrl, "ext", newValue);
            }

            /**
             * データURLからMIMEタイプを抽出する
             *
             * @param {string} dataUrl データURL
             * @return {string} MIMEタイプ の文字列
             */
            static extractMimeType(dataUrl) {
                return dataUrl.match(regDataUrlFormat)?.groups.mine || "";
            }

            /**
             * データURLから日時パラメータを取得する
             *
             * @param {string} dataUrl データURL
             * @return {string} 日時 の文字列
             */
            static getDateParam(dataUrl) {
                return this._getParam(dataUrl, "date");
            }

            /**
             * データURLから追加パラメータを抽出する
             *
             * @param {string} dataUrl データURL
             * @return {string} 追加パラメータ の文字列
             */
            static getExtParam(dataUrl) {
                return this._getParam(dataUrl, "ext");
            }

            /**
             * データURLからバイナリデータを生成して返します
             *
             * @param {string} dataUrl データURL
             * @return {ArrayBuffer} バイト配列
             */
            static toArrayBuffer(dataUrl) {
                const bin = atob(dataUrl.split(",")[1]);
                let buffer = new Uint8Array(bin.length);
                for (let i = 0, l = bin.length; l > i; i++) {
                    buffer[i] = bin.charCodeAt(i);
                }
                return buffer.buffer;
            }
        };

        // -------------------------------------------------------------------
        // DataUrl に対応させるための再定義と追加処理
        /**
         * データURLからBlobを生成して読み込む
         */
        Bitmap.prototype._startConvertingDataUrl = function() {
            const arrayBuffer = YKNR_UtilDataUrl.toArrayBuffer(this._url);
            const mimeType = YKNR_UtilDataUrl.extractMimeType(this._url);
            const blob = new Blob([arrayBuffer], { type: mimeType });
            this._image.src = URL.createObjectURL(blob);
            if (this._image.width > 0) {
                this._image.onload = null;
                this._onLoad();
            }
        };

        YKNR.Core.redefine(Bitmap.prototype, "_startLoading", function($) {
            return function() {
                if (!YKNR_UtilDataUrl.test(this._url)) {
                    $.call(this);
                    return;
                }
                // DataURLなら暗号化について考慮しない
                this._image = new Image();
                this._image.onload = this._onLoad.bind(this);
                this._image.onerror = this._onError.bind(this);
                this._destroyCanvas();
                this._loadingState = "loading";
                this._startConvertingDataUrl();
            };
        });

        YKNR.Core.redefine(Bitmap.prototype, "_onLoad", function($) {
            return function() {
                if (!YKNR_UtilDataUrl.test(this._url)) {
                    $.call(this);
                    return;
                }
                // DataURLなら暗号化について考慮しない
                URL.revokeObjectURL(this._image.src);
                this._loadingState = "loaded";
                this._createBaseTexture(this._image);
                this._callLoadListeners();
            };
        });

        /**
         * 現在のキャンバスからJPEGフォーマットの DataURL を生成します.\
         * 生成時の日時と追加パラメータを DataURL に埋め込み, 日時はキャッシュとして利用します.
         *
         * @param {number|string} extValue 埋め込む追加パラメータ
         * @param {number} quality jpg品質(0-100指定)
         * @return {string} JPEGフォーマットのデータURL
         */
        Bitmap.prototype.toJpegDataUrl = function(extValue = "", quality = 90) {
            if (!this._canvas) {
                return "";
            }
            const originalDataUrl = this._canvas.toDataURL("image/jpeg", quality / 100);
            let newDataUrl = YKNR_UtilDataUrl.setDateNow(originalDataUrl);
            if (extValue) {
                newDataUrl = YKNR_UtilDataUrl.setExtParam(newDataUrl, extValue);
            }
            return newDataUrl;
        };

        /**
         * 現在のキャンバスからPNGフォーマットの DataURL を生成します.\
         * 生成時の日時と追加パラメータを DataURL に埋め込み, 日時はキャッシュとして利用します.
         *
         * @param {number|string} extValue 埋め込む追加パラメータ
         * @return {string} PNGフォーマットのデータURL
         */
        Bitmap.prototype.toPngDataUrl = function(extValue = "") {
            if (!this._canvas) {
                return "";
            }
            const originalDataUrl = this._canvas.toDataURL("image/png");
            let newDataUrl = YKNR_UtilDataUrl.setDateNow(originalDataUrl);
            if (extValue) {
                newDataUrl = YKNR_UtilDataUrl.setExtParam(newDataUrl, extValue);
            }
            return newDataUrl;
        };

        /**
         * データURLからビットマップをロードします.\
         * データURL内のパラメータをキャッシュキーとして利用します.
         *
         * @param {string} dataUrl データURL
         * @return {Bitmap} ビットマップ
         *
         * @example
         * // 4px x 4px の赤丸画像
         * const url = "data:image/jpeg;ext=redCircle;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
         * const bitmap = ImageManager.loadBitmapFromDataUrl(url, "example");
         */
        ImageManager.loadBitmapFromDataUrl = function(dataUrl) {
            if (!dataUrl) {
                return this._emptyBitmap;
            }
            if (!YKNR_UtilDataUrl.isImageMineType(dataUrl)) {
                console.warn("This '%1' is not image MIME Type.".format(dataUrl));
                return this._emptyBitmap;
            }
            const dateKey = YKNR_UtilDataUrl.getDateParam(dataUrl);
            if (!dateKey) {
                // パラメータが設定されていなかったら, キャッシュせずにビットマップを生成する.
                return Bitmap.load(dataUrl);
            }
            const cache = this._cache;
            if (!cache[dateKey]) {
                cache[dateKey] = Bitmap.load(dataUrl);
            }
            return cache[dateKey];
        };

        return YKNR_UtilDataUrl;
    })();


    // =======================================================================
    // 既存オブジェクトに便利関数追加
    //------------------------------------------------------------------------
    /**
     * 任意のキャッシュキーの画像を削除する
     *
     * @param {string} cacheKey キャッシュキー
     */
    ImageManager.clearAt = function(cacheKey) {
        const cache = this._cache;
        if (cache[cacheKey]) {
            cache[cacheKey].destroy();
            delete cache[cacheKey];
        }
    };

    //------------------------------------------------------------------------
    /**
     * Takes a snapshot of the game screen.
     *
     * 出力するビットマップの幅と高さを指定できるように拡張しています.\
     * それぞれが未指定の場合は, Bitmap.snap と同じ動作になります.
     *
     * @static
     * @param {Stage} stage - The stage object.
     * @param {number} outWidth 出力するビットマップの幅
     * @param {number} outHeight 出力するビットマップの高さ
     * @param {number} originWidth 元の幅
     * @param {number} originHeight 元の高さ
     * @returns {Bitmap} The new bitmap object.
     */
    Bitmap.snapExt = function(
        stage,
        outWidth = Graphics.width,
        outHeight = Graphics.height,
        originWidth = Graphics.width,
        originHeight = Graphics.height
    ) {
        const bitmap = new Bitmap(outWidth, outHeight);
        const renderTexture = PIXI.RenderTexture.create(outWidth, outHeight);
        if (stage) {
            const last_sx = stage.scale.x;
            const last_sy = stage.scale.y;
            stage.scale.x = outWidth / originWidth;
            stage.scale.y = outHeight / originHeight;
            const renderer = Graphics.app.renderer;
            renderer.render(stage, renderTexture);
            stage.worldTransform.identity();
            stage.scale.x = last_sx;
            stage.scale.y = last_sy;
            const canvas = renderer.extract.canvas(renderTexture);
            bitmap.context.drawImage(canvas, 0, 0);
            canvas.width = 0;
            canvas.height = 0;
        }
        renderTexture.destroy({ destroyBase: true });
        bitmap.baseTexture.update();
        return bitmap;
    };


    // =======================================================================
    YKNR.Core.redefine(Graphics, "resize", function($) {
        return function(width, height) {
            console.log(`ScreenSize : ${width} x ${height}`);
            $.call(this, width, height);
        };
    });

})();

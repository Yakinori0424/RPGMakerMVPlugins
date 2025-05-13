//=============================================================================
// YKNR_MZ_Core.js
// ----------------------------------------------------------------------------
// (c) 2022 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ----------------------------------------------------------------------------
// Version    : 1.0.0 (2022/05/06) 公開
//            : 1.1.0 (2022/05/26) Coreにプラグインコマンド登録関数の追加
//            : 1.1.1 (2022/06/02) データURL読み込み処理を本体v.1.5.0に合わせる
//            : 1.2.0 (2023/03/01) YKNR.Core.redefine 関数を拡張
//            :                    DataManager.extractMetadata 拡張関数の追加
//            :                    プラグインコマンドで使用する共通関数の追加
//            :                    型定義ファイルを別途用意（主に自分用）
//            :                    一部, クラス式による宣言を廃止
//            : 1.2.1 (2024/04/09) NaNチェックが正常に動作しなかった問題の修正
//            : 1.3.0 (2024/05/07) メタデータ抽出時に利用する解析関数を追加
//            :                    DataManagerにオブジェクト判定関数を追加
//            : 1.3.1 (2024/05/99) 関数への変換処理で参照エラーが起きていたので修正
//            :                    []や{}で囲った文字列の誤解析によるエラーを修正
//            :                    関数の解析に配列にも対応させる
// ----------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//=============================================================================

/*:
 * @===========================================================================
 * @plugindesc 焼きノリ作のプラグインのパラメータの解析/展開や
 * 汎用性のある機能を纏めている共通プラグインです。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_Core
 * @===========================================================================
 * 
 * 
 * 
 * @===========================================================================
 * @help YKNR_MZ_Core.js (Version : 1.3.1)
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
 * ■ YKNR.UtilPluginCommand
 * プラグインコマンド内で使用する共通の機能を纏めたクラスです。
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

(() => {
    "use strict";

    window.YKNR ||= {};
    const YKNR = window.YKNR;

    // =======================================================================
    // YKNR.Core
    (() => {
        const REGEXP_SARCH_PULGIN_NAME = Object.freeze(/^.*\/plugins\/(.*).js$/);
        const REGEXP_REVIVER_ARRAY2MAP = Object.freeze([/^.+?Map$/, /^.+?Dictionary$/]);
        const REGEXP_REVIVER_VALUE2FUNC = Object.freeze([/^.+?Function$/, /^.+?Callback$/, /^On[A-Z].+$/]);

        /** @type {Map<string,boolean>} */
        const _imported = new Map();

        /**
         * {@link YKNR.Core.redefine}可能かチェックし, 問題があれば例外をスローします.
         * @template T
         * @param {T} target
         * @param {string} methodName
         */
        function checkRedefinable(target, methodName) {
            if (target === null || target === undefined) {
                throw new Error("'target' in arguments is null or undefined");
            }
            if (!methodName) {
                throw new Error("'methodName' in arguments is empty");
            }
            const oldMethod = target[methodName];
            if (!oldMethod) {
                throw new Error(`'${methodName}' is not defined in 'target'`);
            }
            if (typeof oldMethod !== "function") {
                throw new Error(`'${methodName}' in 'target' is not function`);
            }
        };


        // constructor
        YKNR.Core = function YKNR_Core() {
            throw new Error("This is a static class");
        };

        YKNR.Core.isImported = function(pluginName) {
            return _imported.has(pluginName);
            //return _imported[pluginName] !== undefined;
        };

        YKNR.Core.importCurrentPlugin = function() {
            const pluginName = this.pluginName();
            _imported.set(pluginName, true);
            //_imported[pluginName] = true;
            return this.pluginParams(pluginName);
        };

        YKNR.Core.pluginName = function() {
            const currentScript = document.currentScript;
            const pulginPath = currentScript?.src.replace(REGEXP_SARCH_PULGIN_NAME,
                (match, p1) => decodeURIComponent(p1));
            return Utils.extractFileName(pulginPath);
        };

        YKNR.Core.pluginParams = function(pluginName) {
            const parameters = PluginManager.parameters(pluginName);
            const jsonStrings = JSON.stringify(parameters, this.paramReplacer);
            const parsedParams = JSON.parse(jsonStrings, this.paramReviver);
            return parsedParams;
        };

        YKNR.Core.paramReplacer = function(key, value) {
            // Value Object
            if (key === "") {
                return value;
            }

            // undefined
            if (value === undefined) {
                return undefined;
            }

            // Boolean
            if (value === "true" || value === "false") {
                return value === "true";
            }

            // Number
            if (Number(value).toString() === value) {
                return Number(value);
            }

            // Array or Object
            if ((value[0] === "[" && value[value.length - 1] === "]")
                || (value[0] === "{" && value[value.length - 1] === "}")) {
                try {
                    return JSON.parse(value);
                } catch (error) {
                    return value;
                }
            }

            // String or Any
            return value;
        };

        YKNR.Core.paramReviver = function(key, value) {
            // パラメータ名を元に変換
            if (REGEXP_REVIVER_ARRAY2MAP.some((reg) => reg.test(key))) {
                // value to Map
                return YKNR.Core.convertArrayToMap(value);
            } else if (REGEXP_REVIVER_VALUE2FUNC.some((reg) => reg.test(key))) {
                // value to Function
                return YKNR.Core.convertValuetoFunction(value);
            }

            // Raw
            return value;
        };

        YKNR.Core.convertArrayToMap = function(array) {
            /** @type {Map<string,object>} */
            const map = new Map();

            if (Array.isArray(array)) {
                // Mapオブジェクト変換可否チェック
                if (array.every(e => "key" in e && "value" in e)) {
                    array.forEach(e => {
                        const key = e.key;
                        const value = e.value;
                        if (map.has(key)) {
                            console.error(`key名が重複しています! : ${key}\n\o`, array);
                        }
                        map.set(key, value);
                    });
                }
            }

            return map;
        };

        YKNR.Core.convertValuetoFunction = function(value) {
            // 関数変換可否チェック
            if (Array.isArray(value)) {
                return value.map(script => YKNR.Core.convertValuetoFunction(script));
            } else if (typeof (value) === "string") {
                if (value[0] === "\"" && value[value.length - 1] === "\"") {
                    // String(Note) to Function(引数なし)
                    return YKNR.Core.toFunction(JSON.parse(value));
                } else {
                    // String to Function(引数なし)
                    return YKNR.Core.toFunction(value);
                }
            } else if (typeof (value) === "object") {
                if ("jsCode" in value) {
                    const code = value.jsCode;
                    if (code[0] === "\"" && code[code.length - 1] === "\"") {
                        // Object(Note jsCode) to Function(引数あり)
                        return YKNR.Core.toFunction(value.argFormat, JSON.parse(code));
                    } else {
                        // Object to Function(引数あり)
                        return YKNR.Core.toFunction(value.argFormat, code);
                    }
                }
            }

            // empty function
            return (function() { });
        };

        YKNR.Core.toFunction = function(argsOrCode, code = undefined) {
            argsOrCode = argsOrCode || '';
            const _args = code !== undefined ? argsOrCode : '';
            const _code = code !== undefined ? code : argsOrCode;
            return Function(`"use strict"; return (function(${_args}) { ${_code} });`)();
        };

        YKNR.Core.toNumber = function(value) {
            if (value.slice(-1) === "%") {
                return Number(value.slice(0, value.length - 1)) * 0.01;
            } else {
                return Number(value);
            }
        };

        YKNR.Core.toTrait = function(code, dataId = 0, value = 0) {
            return { code: code, dataId: dataId, value: value, ext: true };
        };

        YKNR.Core.setGlobal = function(anyClass) {
            const name = anyClass.name;
            if (window[name]) {
                // 同名のものがあれば, 潜在バグが無いように明示的にエラーを出力する
                throw new Error(`Name of ${name} is existed in global`);
            }
            window[name] = anyClass;
        };

        YKNR.Core.redefine = function() {
            if (arguments.length == 2) {
                redefineV2(...arguments);
            } else {
                redefineV1(...arguments);
            }
        };

        /**
         * @template T
         * @template R
         * @param {T} target 
         * @param {string} methodName 
         * @param {YKNR.types.RedefMethodWrapper<T,R>} newMethodWrapper 
         */
        function redefineV1(target, methodName, newMethodWrapper) {
            checkRedefinable(target, methodName);
            target[methodName] = newMethodWrapper(target[methodName]);
        };

        /**
         * @template T
         * @template R
         * @param {T} target 
         * @param {YKNR.types.TRFunction<T,R>} newMethod 
         */
        function redefineV2(target, newMethod) {
            const methodName = newMethod.name;
            checkRedefinable(target, methodName);
            newMethod.super = target[methodName].bind(target);
            target[methodName] = newMethod;
        };

        YKNR.Core.registerPluginCommands = function(commands) {
            const pluginName = this.pluginName();
            commands.forEach(command => {
                PluginManager.registerCommand(pluginName, command.name, command.func);
            });
        };
    })();
    /*
    // 第三者向けの使用例メモ
    if (YKNR.Core.isImported("otherPluginName")) {
    }
    */


    // -----------------------------------------------------------------------
    //const parameters = YKNR.Core.importCurrentPlugin();
    //console.log(parameters);


    // =======================================================================
    // YKNR.Extension
    (() => {
        // ロード時の挙動調整用
        let _isLoadDataCompleted = false;

        // constructor
        YKNR.Extension = function YKNR_Extension() {
            throw new Error("This is a static class");
        };

        YKNR.Extension.onCompleteLoadDatabase = function() {
            //console.log("onCompleteLoadDatabase");
        };

        YKNR.Extension.onLoadOtherData = function(object) {
            //console.log(`onLoadOtherData : \n${object}`);
        };

        YKNR.Extension.onExtracedMetadata = function(data) {
            //console.log(`onExtracedMetadata : \n${data}`);
        };

        // -------------------------------------------------------------------

        YKNR.Core.redefine(DataManager, "loadDatabase", function($) {
            return function() {
                _isLoadDataCompleted = false;
                $.call(this, ...arguments);
            };
        });

        YKNR.Core.redefine(DataManager, "onLoad", function($) {
            return function(object) {
                $.call(this, ...arguments);

                const databaseNames = DataManager._databaseFiles.map(file => file.name);
                const isDatabaseObj = databaseNames.some(name => window[name] === object);

                if (!isDatabaseObj) {
                    // データベース以外のものを読み込んだとき実行する
                    YKNR.Extension.onLoadOtherData(object);
                } else {
                    // データベースをすべて読み込んだとき実行する
                    if (!_isLoadDataCompleted && DataManager.isDatabaseLoaded()) {
                        _isLoadDataCompleted = true;
                        YKNR.Extension.onCompleteLoadDatabase();
                    }
                }
            };
        });

        YKNR.Core.redefine(DataManager, "extractMetadata", function($) {
            return function(data) {
                $.call(this, ...arguments);
                YKNR.Extension.onExtracedMetadata(data);
            };
        });
    })();


    // -----------------------------------------------------------------------
    // YKNR.UtilRPGData
    (() => {
        // constructor
        YKNR.UtilRPGData = function YKNR_UtilRPGData() {
            throw new Error("This is a static class");
        };

        YKNR.UtilRPGData.parseParams = function(data, ...metaKeys) {
            const regExp = /([^\s,:]+):([^\s,]+)/g;

            /** @type {[key: string]: any} */
            const result = {};

            /** @type {string} */
            const metaValue = data.meta[metaKeys.find(key => data.meta.hasOwnProperty(key))] || "";
            /** @type {string[]} */
            const matchs = [...metaValue.matchAll(regExp)];
            for (let match of matchs) {
                result[match[1]] = YKNR.Core.paramReplacer(match[1], match[2]);
            }

            return result;
        };
    })();

    // -------------------------------------------------------------------
    // DataManager.isMapObject のような判定関数の全オブジェクト版を用意.
    (() => {

        DataManager.isActorObject = function(object) {
            return !!(object.profile && object.equips);
        };
        DataManager.isClassObject = function(object) {
            return !!(object.expParams && object.expParams);
        };
        DataManager.isSkillObject = function(object) {
            return !!(object.damage && object.message1 !== undefined && object.message2 !== undefined);
        };
        DataManager.isItemObject = function(object) {
            return !!(object.damage && object.message1 === undefined && object.message2 === undefined);
        };
        DataManager.isWeaponObject = function(object) {
            return !!(object.params && object.wtypeId !== undefined);
        };
        DataManager.isArmorObject = function(object) {
            return !!(object.params && object.atypeId !== undefined);
        };
        DataManager.isEnemyObject = function(object) {
            return !!(object.params && object.actions && object.dropItems);
        };
        DataManager.isTroopObject = function(object) {
            return !!(object.pages && object.members);
        };
        DataManager.isStateObject = function(object) {
            return !!(object.removeAtBattleEnd !== undefined && object.removeByRestriction !== undefined);
        };
        DataManager.isAnimationObject = function(object) {
            return !!(object.flashTimings && object.soundTimings);
        };
        DataManager.isTilesetObject = function(object) {
            return !!(object.tilesetNames && object.flags);
        };
        DataManager.isCommonEventObject = function(object) {
            return !!(object.trigger !== undefined && object.list);
        };
        DataManager.isSystemObject = function(object) {
            return !!(object.gameTitle !== undefined && object.battleSystem !== undefined);
        };
        DataManager.isMapInfoObject = function(object) {
            return !!(object.order !== undefined && object.parentId !== undefined);
        };
        DataManager.isOtherObject = function(object) {
            /** @type {Function[]} */
            const list = [
                this.isActorObject,
                this.isClassObject,
                this.isSkillObject,
                this.isItemObject,
                this.isWeaponObject,
                this.isArmorObject,
                this.isEnemyObject,
                this.isTroopObject,
                this.isStateObject,
                this.isAnimationObject,
                this.isTilesetObject,
                this.isCommonEventObject,
                this.isSystemObject,
                this.isMapInfoObject,
                this.isMapObject,
            ];
            return !list.some(callback => callback.call(this, object));
        };
        DataManager.isEventObject = function(object) {
            return !!(object.pages && object.members === undefined);
        };

    })();


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
                $.call(this, ...arguments);
                TweenManager._update();
            };
        });

        /**
         * -----------------------------------------------------------------------
         * Tween処理を行うクラス.
         */
        class TweenEngine {
            constructor(target) {
                this._initialize(target);
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
    // YKNR.UtilPluginCommand
    (() => {
        // constructor
        YKNR.UtilPluginCommand = function YKNR_UtilPluginCommand() {
            throw new Error("This is a static class");
        };

        YKNR.UtilPluginCommand.getNumber = function(params, key) {
            let value = NaN;
            if (params) {
                if (key + "ForVariable" in params) {
                    const variableId = Number(params[key + "ForVariable"]);
                    if (variableId > 0) {
                        value = $gameVariables.value(variableId);
                    }
                }
                if (Number.isNaN(value) && key in params) {
                    value = Number(params[key]);
                }
            }
            return value;
        };

        YKNR.UtilPluginCommand.getBoolean = function(params, key) {
            let value = undefined;
            if (params) {
                if (key + "ForSwitch" in params) {
                    const switchId = Number(params[key + "ForSwitch"]);
                    if (switchId > 0) {
                        value = $gameSwitches.value(switchId);
                    }
                }
                if (value === undefined && key in params) {
                    value = Boolean(params[key]);
                }
            }
            return value;
        };

        YKNR.UtilPluginCommand.getGameActor = function(params) {
            const id = this.getNumber(params, "actorId");
            return $gameActors.actor(id);
        };

        YKNR.UtilPluginCommand.iterateActorId = function(interpreter, params, callback) {
            const id = this.getNumber(params, "actorId");
            interpreter.iterateActorId(id, callback);
        };

        YKNR.UtilPluginCommand.iterateActorIndex = function(interpreter, params, callback) {
            const index = this.getNumber(params, "partyIndex");
            interpreter.iterateActorIndex(index, callback);
        };

        YKNR.UtilPluginCommand.iterateEnemyIndex = function(interpreter, params, callback) {
            const index = this.getNumber(params, "enemyIndex");
            interpreter.iterateEnemyIndex(index, callback);
        };
    })();


    // =======================================================================
    // YKNR.UtilDataUrl
    (() => {
        /** データURLのフォーマット */
        const REGEXP_DATAURL_FORMAT = /^data:(?<mine>[a-z\/]+);(?<params>(?:(?:.+?=.+?);)+)*?base64,[a-zA-Z0-9\+\/=]+$/;
        /** 文字列のエンコード/デコードの対象の文字の一覧 */
        const DATAURL_ENCODE_MAP = {
            "%": "%25",
            "=": "%3D",
            ";": "%3B",
            "+": "%2B",
            " ": "+",
            "　": "%E3%80%80",
        };

        // constructor
        YKNR.UtilDataUrl = function YKNR_UtilDataUrl() {
            throw new Error("This is a static class");
        };

        YKNR.UtilDataUrl.test = function(url) {
            return REGEXP_DATAURL_FORMAT.test(url);
        }

        YKNR.UtilDataUrl.isImageMineType = function(dataUrl) {
            const minetype = this.extractMimeType(dataUrl);
            return ["image/jpeg", "image/png"].some((e) => e === minetype);
        }

        YKNR.UtilDataUrl.encode = function(str) {
            /** @type {string[][]} */
            const map = Object.entries(DATAURL_ENCODE_MAP);
            map.forEach(([k, v]) => str = str.replace(k, v));
            return str;
        }

        YKNR.UtilDataUrl.decode = function(str) {
            /** @type {string[][]} */
            const map = Object.entries(DATAURL_ENCODE_MAP);
            map.reverse().forEach(([k, v]) => str = str.replace(v, k));
            return str;
        }

        YKNR.UtilDataUrl._setParam = function(dataUrl, key, value) {
            key = this.encode(key);
            const newParamsetText = `${key}=${this.encode(value + '')}`;

            // key を探して既にあれば置換して返す.
            /** @type {string[]} */
            const paramset = (dataUrl.match(REGEXP_DATAURL_FORMAT).groups.params || "").split(";");
            for (const params of paramset) {
                const param = params.split("=");
                if (param[0] === key) {
                    return dataUrl.replace(params, newParamsetText);
                }
            }

            return dataUrl.replace(";base64", `;${newParamsetText};base64`);
        }

        YKNR.UtilDataUrl._getParam = function(dataUrl, key) {
            key = this.encode(key);

            // key を探して既にあれば パラメータ をデコードして返す.
            /** @type {string[]} */
            const paramset = (dataUrl.match(REGEXP_DATAURL_FORMAT).groups.params || "").split(";");
            for (const params of paramset) {
                const param = params.split("=");
                if (param[0] === key) {
                    return this.decode(param[1]);
                }
            }

            return null;
        }

        YKNR.UtilDataUrl.setDateNow = function(dataUrl) {
            return this._setParam(dataUrl, "date", Date.now());
        }

        YKNR.UtilDataUrl.setExtParam = function(dataUrl, newValue) {
            return this._setParam(dataUrl, "ext", newValue);
        }

        YKNR.UtilDataUrl.extractMimeType = function(dataUrl) {
            return dataUrl.match(REGEXP_DATAURL_FORMAT)?.groups.mine || "";
        }

        YKNR.UtilDataUrl.getDateParam = function(dataUrl) {
            return this._getParam(dataUrl, "date");
        }

        YKNR.UtilDataUrl.getExtParam = function(dataUrl) {
            return this._getParam(dataUrl, "ext");
        }

        YKNR.UtilDataUrl.toArrayBuffer = function(dataUrl) {
            const bin = atob(dataUrl.split(",")[1]);
            let buffer = new Uint8Array(bin.length);
            for (let i = 0, l = bin.length; l > i; i++) {
                buffer[i] = bin.charCodeAt(i);
            }
            return buffer.buffer;
        }

        // -------------------------------------------------------------------
        // DataUrl に対応させるための再定義と追加処理

        YKNR.Core.redefine(Bitmap.prototype, "_startLoading", function($) {
            return function() {
                if (YKNR.UtilDataUrl.test(this._url)) {
                    this._startLoadingForDataUrl();
                } else {
                    $.call(this, ...arguments);
                }
            };
        });

        Bitmap.prototype._startLoadingForDataUrl = function() {
            // MEMO : DataURLなら暗号化について考慮しない
            this._image = new Image();
            this._image.onload = this._onDataUrlLoad.bind(this);
            this._image.onerror = this._onError.bind(this);
            this._destroyCanvas();
            this._loadingState = "loading";

            const arrayBuffer = YKNR.UtilDataUrl.toArrayBuffer(this._url);
            const mimeType = YKNR.UtilDataUrl.extractMimeType(this._url);
            const blob = new Blob([arrayBuffer], { type: mimeType });
            this._image.src = URL.createObjectURL(blob);
            if (this._image.width > 0) {
                this._image.onload = null;
                this._onDataUrlLoad();
            }
        };

        Bitmap.prototype._onDataUrlLoad = function() {
            // MEMO : DataURLなら暗号化について考慮しない
            URL.revokeObjectURL(this._image.src);
            this._loadingState = "loaded";
            this._createBaseTexture(this._image);
            this._callLoadListeners();
        };

        Bitmap.prototype.toJpegDataUrl = function(extValue = "", quality = 90) {
            if (!this._canvas) {
                return "";
            }
            const originalDataUrl = this._canvas.toDataURL("image/jpeg", quality / 100);
            let newDataUrl = YKNR.UtilDataUrl.setDateNow(originalDataUrl);
            if (extValue) {
                newDataUrl = YKNR.UtilDataUrl.setExtParam(newDataUrl, extValue);
            }
            return newDataUrl;
        };

        Bitmap.prototype.toPngDataUrl = function(extValue = "") {
            if (!this._canvas) {
                return "";
            }
            const originalDataUrl = this._canvas.toDataURL("image/png");
            let newDataUrl = YKNR.UtilDataUrl.setDateNow(originalDataUrl);
            if (extValue) {
                newDataUrl = YKNR.UtilDataUrl.setExtParam(newDataUrl, extValue);
            }
            return newDataUrl;
        };

        ImageManager.loadBitmapFromDataUrl = function(dataUrl) {
            if (!dataUrl) {
                return this._emptyBitmap;
            }
            if (!YKNR.UtilDataUrl.isImageMineType(dataUrl)) {
                console.warn("This '%1' is not image MIME Type.".format(dataUrl));
                return this._emptyBitmap;
            }
            const dateKey = YKNR.UtilDataUrl.getDateParam(dataUrl);
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
    })();


    // =======================================================================
    // 既存オブジェクトに便利関数追加
    //------------------------------------------------------------------------
    ImageManager.clearAt = function(cacheKey) {
        const cache = this._cache;
        if (cache[cacheKey]) {
            cache[cacheKey].destroy();
            delete cache[cacheKey];
        }
    };

    //------------------------------------------------------------------------
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


    /**
     * キー入力が離された瞬間を判定する.
     * @param {string} keyName 
     * @returns {bool} 現フレームでの入力は無く, 前フレームでの入力があった場合は true を返す.
     */
    Input.isReleased = function(keyName) {
        if (this._isEscapeCompatible(keyName) && this.isReleased("escape")) {
            return true;
        } else {
            return !this._currentState[keyName] && !!this._previousState[keyName];
        }
    };

    /**
     * 入力中のフレーム数を取得する.
     * @param {string} keyName 
     * @returns {number} 押下時間を返す.
     */
    Input.getPressedFrame = function(keyName) {
        if (this._isEscapeCompatible(keyName)) {
            return this.getPressedFrame("escape");
        } else {
            return this._latestButton === keyName ? this._pressedTime : 0;
        }
    };


    // =======================================================================
    YKNR.Core.redefine(Graphics, "resize", function($) {
        return function(width, height) {
            console.log(`ScreenSize : ${width} x ${height}`);
            $.call(this, ...arguments);
        };
    });

})();

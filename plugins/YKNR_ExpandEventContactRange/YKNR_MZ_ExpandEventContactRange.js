//============================================================================
// YKNR_MZ_ExpandEventContactRange.js
// ---------------------------------------------------------------------------
// (c) 2024 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 0.1.0 (2024/05/02) 試作版公開
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @===========================================================================
 * @plugindesc イベントの接触範囲を自由に広げる機能を追加します。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_ExpandEventContactRange
 * @base YKNR_MZ_Core
 * @orderAfter YKNR_MZ_Core
 * @===========================================================================
 * 
 * 
 * @===========================================================================
 * @help YKNR_MZ_ExpandEventContactRange.js (Version : 0.1.0)
 * ----------------------------------------------------------------------------
 * 【！注意！】
 * ※共通プラグイン「YKNR_MZ_Core.js」のバージョン(1.2.1)以降でのみ対応。
 * ----------------------------------------------------------------------------
 * --------------------------------------
 *【機能紹介】
 * イベントのトリガーの範囲を拡張し、
 * 1つのイベントで広範囲をカバーできるようになります。
 * 
 * イベントのメモ欄に <範囲拡張: xxxx:xx> というフォーマットで記述することで、
 * 指定された範囲を広げることができます。
 * 以下に、記述方法と効果範囲を記載します。
 * --------------------------------------
 * ・イベント位置からの距離2マス分
 * <範囲拡張: Distance:2>
 * 
 * □□■□□
 * □■■■□
 * ■■●■■
 * □■■■□
 * □□■□□
 * --------------------------------------
 * ・イベント位置の周囲1マス分
 * <範囲拡張: Around:1>
 * 
 * □□□□□
 * □■■■□
 * □■●■□
 * □■■■□
 * □□□□□
 * --------------------------------------
 * ・イベント位置から左方向2マス分
 * <範囲拡張: Left:2>
 * 
 * □□□□□
 * □□□□□
 * ■■●□□
 * □□□□□
 * □□□□□
 * --------------------------------------
 * ・イベント位置から右方向1マス分
 * <範囲拡張: Right:1>
 * 
 * □□□□□
 * □□□□□
 * □□●■□
 * □□□□□
 * □□□□□
 * --------------------------------------
 * ・イベント位置から上方向1マス分
 * <範囲拡張: Up:1>
 * 
 * □□□□□
 * □□■□□
 * □□●□□
 * □□□□□
 * □□□□□
 * --------------------------------------
 * ・イベント位置から下方向2マス分
 * <範囲拡張: Down:2>
 * 
 * □□□□□
 * □□□□□
 * □□●□□
 * □□■□□
 * □□■□□
 * --------------------------------------
 * 
 * また、カンマ区切りで複数指定することもできます。
 * --------------------------------------
 * ・イベント位置の周囲1マス分と下方向2マス分
 * <範囲拡張: Around:1, Down:2>
 * 
 * □□□□□
 * □■■■□
 * □■●■□
 * □■■■□
 * □□■□□
 * --------------------------------------
 * ・イベント位置から上方向に1マス分と左右方向に2マス分
 * <範囲拡張: Left:2, Right:2, Up:1>
 * 
 * □□□□□
 * □□■□□
 * ■■●■■
 * □□□□□
 * □□□□□
 * --------------------------------------
 * 
*/

(() => {
    'use strict';

    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    const pluginName = YKNR.Core.pluginName();
    //console.log(parameters);

    // =======================================================================

    //------------------------------------------------------------------------
    /**
     * 接触範囲拡張パラメータ
     * @typedef ContactRange
     * @property {number} left  左方向に接触判定を広げるマス数
     * @property {number} right 右方向に接触判定を広げるマス数
     * @property {number} up    上方向に接触判定を広げるマス数
     * @property {number} down  下方向に接触判定を広げるマス数
     * @property {number} around   周囲に接触判定を広げるマス数
     * @property {number} distance 距離で接触判定を広げるマス数
     */


    // -----------------------------------------------------------------------
    // add contactRange from extracted metadata.

    /**
     * イベントオブジェクトデータのメタデータ[範囲拡張]を解析し,\
     * 接触範囲を広げるためのマス数をイベントオブジェクトへ保存させます.
     * @param {rm.types.Event} data イベントデータ
     */
    function parseMetadataContactRange(data) {
        if (!data.pages) {
            // ページオブジェクト持ちではないオブジェクトはスキップする
            return;
        }

        const CONTACT_RANGE_PARAM_NAME = [
            "left",
            "right",
            "up",
            "down",
            "around",
            "distance",
        ];
        data.contactRange = {};

        /** @type {string} */
        const areaMetaValue = data.meta["範囲拡張"] || '';
        const areaData = areaMetaValue.replace(/\s+/g, "").toLowerCase().split(",");
        for (let i = 0; i < CONTACT_RANGE_PARAM_NAME.length; i++) {
            const keyName = CONTACT_RANGE_PARAM_NAME[i];
            const area = areaData.find(r => r.includes(keyName + ":"));
            if (!!area) {
                const value = area.split(":")[1];
                data.contactRange[keyName] = Number(value);
            } else {
                data.contactRange[keyName] = 0;
            }
        }
    };

    YKNR.Core.redefine(YKNR.Extension, "onExtracedMetadata", function($) {
        return function(data) {
            $.call(this, ...arguments);
            parseMetadataContactRange(data);
        };
    });


    // -----------------------------------------------------------------------
    // Game_Map

    // TODO : このあたりの関数を拡張していきたい
    /*
    Game_Map.prototype.eventsXy = function(x, y) {
        return this.events().filter(event => event.pos(x, y));
    };

    Game_Map.prototype.eventsXyNt = function(x, y) {
        return this.events().filter(event => event.posNt(x, y));
    };
    */

    Game_Map.prototype.eventsXyInRange = function(x, y) {
        return this.events().filter(event => event.isWithinTriggerRange(x, y));
    };

    Game_Map.prototype.eventsXyInRangeNt = function(x, y) {
        return this.events().filter(event => event.isWithinTriggerRange(x, y)) && !this.isThrough();
    };


    // -----------------------------------------------------------------------
    // Game_Player

    // TODO : このマップイベント実行処理をもう少し最適化したい
    YKNR.Core.redefine(Game_Player.prototype, "startMapEvent", function($) {
        return function(x, y, triggers, normal) {
            $.call(this, ...arguments);
            if (!$gameMap.isEventRunning()) {
                for (const event of $gameMap.eventsXyInRange(x, y)) {
                    if (
                        event.isTriggerIn(triggers) &&
                        event.isNormalPriority() === normal
                    ) {
                        event.start();
                    }
                }
            }
        };
    });


    // -----------------------------------------------------------------------
    // Game_Event

    // TODO : イベント起動チェック用ログの出力
    YKNR.Core.redefine(Game_Event.prototype, "start", function($) {
        return function() {
            console.log(`[Game_Event] start : ${this.eventId()}:${this.event().name}`);
            $.call(this, ...arguments);
        };
    });

    /**
     * 起動判定の範囲内か判定する.
     * @param {number} x
     * @param {number} y
     */
    Game_Event.prototype.isWithinTriggerRange = function(x, y) {
        return this.isWithinRange(this.event().contactRange, x, y);
    };

    /**
     * 起動判定の範囲内のマップ座標をすべて取得する.
     * @param {number} x
     * @param {number} y
     * @returns {Array<{x:number, y:number}>}
     */
    Game_Event.prototype.allPosWithinTriggerRange = function() {
        return this.allPosWithinRange(this.event().contactRange);
    };

    /**
     * 任意の範囲内か判定する.
     * @param {ContactRange} area 範囲データ
     * @param {number} x 範囲内かを判定するX座標
     * @param {number} y 範囲内かを判定するY座標
     * @returns {boolean} 指定された範囲内であれば true を返す.
     */
    Game_Event.prototype.isWithinRange = function(area, x, y) {
        const dx = $gameMap.deltaX(x, this.x);
        const dy = $gameMap.deltaY(y, this.y);

        if (dx === 0 && dy === 0) {
            // 同一座標もエリア内とする.
            return true;
        } else if (area.distance > 0 && Math.abs(dx) + Math.abs(dy) <= area.distance) {
            // 距離.
            return true;
        } else if (area.around > 0 && Math.abs(dx) <= area.around && Math.abs(dy) <= area.around) {
            // 周囲.
            return true;
        } else if (area.left === 0 && area.right === 0 && area.up === 0 && area.down === 0) {
            // 4方向範囲 未設定.
            return false;
        } else {
            // 4方向範囲.
            const dl = $gameMap.deltaX($gameMap.roundX(this.x - area.left), this.x);
            const dr = $gameMap.deltaX($gameMap.roundX(this.x + area.right), this.x);
            const du = $gameMap.deltaY($gameMap.roundY(this.y - area.up), this.y);
            const dd = $gameMap.deltaY($gameMap.roundY(this.y + area.down), this.y);
            if ((dl <= dx && dx <= dr) && (du <= dy && dy <= dd)) {
                return true;
            }
        }
        return false;
    };

    /**
     * 任意の範囲内の全マップ座標を配列で取得する.
     * @param {ContactRange} area 範囲データ
     * @returns {Array<{x:number, y:number}>} 範囲内の有効なマップ座標を配列で返す.
     */
    Game_Event.prototype.allPosWithinRange = function(area) {
        /** @type {Array<{x:number, y:number}>} */
        const posList = [];
        const setPos = (ox, oy) => {
            /** @type {{x:number, y:number}} */
            const p = { x: $gameMap.roundX(this.x + ox), y: $gameMap.roundY(this.y + oy) };
            if (p.x >= 0 && p.y >= 0 && !posList.contains(p)) {
                posList.push(p);
            }
        };

        setPos(0, 0);

        // around
        if (area.around > 0) {
            for (let x = -area.around; x <= area.around; x++) {
                for (let y = -area.around; y <= area.around; y++) {
                    setPos(x, y);
                }
            }
        }

        // distance
        if (area.distance > 0) {
            for (let x = -area.distance; x <= area.distance; x++) {
                const absX = Math.abs(x);
                for (let y = -(area.distance - absX); y <= area.distance - absX; y++) {
                    setPos(x, y);
                }
            }
        }

        // horizontal
        if (area.left >= 0 && area.right >= 0 && area.left + area.right > 0) {
            for (let x = -area.left; x <= area.right; x++) {
                setPos(x, 0);
            }
        }

        // vertical
        if (area.up >= 0 && area.down >= 0 && area.up + area.down > 0) {
            for (let y = -area.up; y <= area.down; y++) {
                setPos(0, y);
            }
        }

        return posList;
    };

})();

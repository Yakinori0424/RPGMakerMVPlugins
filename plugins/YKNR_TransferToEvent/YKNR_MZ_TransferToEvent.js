//============================================================================
// YKNR_MZ_TransferToEvent.js
// ---------------------------------------------------------------------------
// (c) 2024 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 1.0.0 (2024/04/14) 公開
//            : 1.1.0 (2025/02/20) MZバージョン1.9.0 新アノテーション対応
//            :                    オフセット値による補正計算処理の最適化
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @===========================================================================
 * @plugindesc イベントコマンドの「場所移動」を拡張した、
 * 任意のイベント位置へ移動する機能を追加します。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_TransferToEvent
 * @base YKNR_MZ_Core
 * @orderAfter YKNR_MZ_Core
 * @===========================================================================
 * 
 * 
 * @===========================================================================
 * @command transferToEvent
 * @text イベント位置へ場所移動
 * @desc 任意のマップの任意のイベント位置へ場所移動を行います。
 * 
 * @arg mapId
 * @text マップID（直接指定）
 * @desc 遷移先のマップです。
 * @type map
 * @default 1
 * 
 * @arg mapIdForVariable
 * @text マップID（変数で指定）
 * @desc 遷移先のマップIDを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg eventId
 * @text イベントID（直接指定）
 * @desc 遷移先のイベントのIDです。存在しないイベントIDの場合は
 * マップの左上(0, 0)に移動されます。
 * @type number
 * @min 1
 * @default 1
 * 
 * @arg eventIdForVariable
 * @text イベントID（変数で指定）
 * @desc 遷移先のイベントIDを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg adjustX
 * @text オフセット値X（直接指定）
 * @desc 左右へ何マス分位置調整するか指定します。
 * 左方向へはマイナス、右方向へはプラスの値になります。
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @arg adjustXForVariable
 * @text オフセット値X（変数で指定）
 * @desc 左右へ何マス分位置調整するかを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg adjustY
 * @text オフセット値Y（直接指定）
 * @desc 上下へ何マス分位置調整するか指定します。
 * 上方向へはマイナス、下方向へはプラスの値になります。
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @arg adjustYForVariable
 * @text オフセット値Y（変数で指定）
 * @desc 上下へ何マス分位置調整するかを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg direction
 * @text 向き
 * @desc 移動後のプレイヤー向きです。
 * @type select
 * @option そのまま
 * @value 0
 * @option 下
 * @value 2
 * @option 左
 * @value 4
 * @option 右
 * @value 6
 * @option 上
 * @value 8
 * @default 0
 * 
 * @arg fadeType
 * @text フェード
 * @desc 場所移動時の画面切り替え方法です。
 * @type select
 * @option 黒
 * @value 0
 * @option 白
 * @value 1
 * @option なし
 * @value 2
 * @default 0
 * 
 * @---------------------------------------------------------------------------
 * @command transferToEventInCurrentMap
 * @text 現在のマップのイベント位置へ場所移動
 * @desc 現在のマップの任意のイベント位置へ場所移動を行います。
 * 
 * @arg eventId
 * @text イベントID（直接指定）
 * @desc 遷移先のイベントのIDです。存在しないイベントIDの場合は
 * マップの左上(0, 0)に移動されます。
 * @type number
 * @min 1
 * @default 1
 * 
 * @arg eventIdForVariable
 * @text イベントID（変数で指定）
 * @desc 遷移先のイベントIDを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg adjustX
 * @text オフセット値X（直接指定）
 * @desc 左右へ何マス分位置調整するか指定します。
 * 左方向へはマイナス、右方向へはプラスの値になります。
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @arg adjustXForVariable
 * @text オフセット値X（変数で指定）
 * @desc 左右へ何マス分位置調整するかを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg adjustY
 * @text オフセット値Y（直接指定）
 * @desc 上下へ何マス分位置調整するか指定します。
 * 上方向へはマイナス、下方向へはプラスの値になります。
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @arg adjustYForVariable
 * @text オフセット値Y（変数で指定）
 * @desc 上下へ何マス分位置調整するかを変数で指定します。
 * 利用しない場合は「なし」に設定してください。
 * @type variable
 * @default 0
 * 
 * @arg direction
 * @text 向き
 * @desc 移動後のプレイヤー向きです。
 * @type select
 * @option そのまま
 * @value 0
 * @option 下
 * @value 2
 * @option 左
 * @value 4
 * @option 右
 * @value 6
 * @option 上
 * @value 8
 * @default 0
 * 
 * @arg fadeType
 * @text フェード
 * @desc 場所移動時の画面切り替え方法です。
 * @type select
 * @option 黒
 * @value 0
 * @option 白
 * @value 1
 * @option なし
 * @value 2
 * @default 0
 * 
 * 
 * @===========================================================================
 * @help YKNR_MZ_TransferToEvent.js (Version : 1.1.0)
 * ----------------------------------------------------------------------------
 * 【！注意！】
 * ※共通プラグイン「YKNR_MZ_Core.js」のバージョン(1.2.1)以降でのみ対応。
 * ※ツクールMZ本体のバージョン(1.9.0)以降でのみ対応。
 * ----------------------------------------------------------------------------
 *【機能紹介】
 * 通常のイベントコマンドの「場所移動」は
 * ・マップID
 * ・X座標
 * ・Y座標
 * ・向き
 * ・フェード
 * を指定して移動処理を行いますが、本プラグインは
 * ・マップID
 * ・イベントID
 * ・向き
 * ・フェード
 * を指定して移動処理を行い、そのイベントと同じ位置に移動する機能を提供します。
 * 
 * これにより、例えば
 * 通常ではゲームの作成途中でマップの形状を調整すると、
 * そのマップへ移動する全イベントをチェック/移動座標の修正が必要になりますが、
 * 本プラグインの機能を利用することで
 * そのマップ上のイベント位置を調整するだけで済むようになります。
 * 
 * あとはおまけ機能として、
 * 通常のイベントコマンド「場所移動」の移動時も含めて、
 * 指定された座標から±nマスずれた位置に移動する設定も可能となります。
 * 扉イベントの位置に移動させたいけど、
 * 扉と重なった位置に移動するのは違和感があるといった場合に有効です。
 * 
 * ----------------------------------------------------------------------------
 *【プラグインコマンド】
 * -------------------------------------
 * 「イベント位置へ場所移動」
 * -------------------------------------
 * マップIDとイベントIDを指定して場所移動を行います。
 * 向きとフェードはイベントコマンド「場所移動」と同様に設定できるほか、
 * イベント位置から何マスずらした位置に移動するかの設定ができます。
 * 
 * -------------------------------------
 * 「現在のマップのイベント位置へ場所移動」
 * -------------------------------------
 * イベントIDを指定して場所移動を行います。
 * こちらは現在のマップにある任意のイベントに移動させるため、
 * マップIDの指定は省略されています。
 * それ以外の設定については、「イベント位置へ場所移動」と同じです。
 * 
 * 
 * ----------------------------------------------------------------------------
 * ※以下、スクリプトわかる方向け
 * ----------------------------------------------------------------------------
 * 
 * -------------------------------------
 * // 任意のマップの任意のイベントへ「場所移動」
 * // ($gamePlayer.reserveTransfer の代わりに使用します).
 * $gamePlayer.reserveTransferToEvent(mapId, eventId, direction, fadeType);
 * -------------------------------------
 * // 「場所移動」での転送先を指定マス分ずらす.
 * // $gamePlayer.reserveTransfer や $gamePlayer.reserveTransferToEvent
 * // と併用して呼び出す必要があります.
 * const ox = 1; // 左右へのずらすマス数. マイナスで左方向, プラスで右方向です.
 * const oy = 1; // 上下へのずらすマス数. マイナスで上方向, プラスで下方向です.
 * $gamePlayer.reserveTransferOffset(ox, oy);
 * -------------------------------------
 * // イベントコマンドの「スクリプト」から実行する例.
 * const mapId = 1;
 * const eventId = 1;
 * const direction = 0;
 * const fadeType = 0;
 * const ox = 0;
 * const oy = 1;
 * $gamePlayer.reserveTransferToEvent(mapId, eventId, direction, fadeType);
 * $gamePlayer.reserveTransferOffset(ox, oy);
 * this.setWaitMode("transfer");
 * -------------------------------------
*/

(() => {
    'use strict';

    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    const pluginName = YKNR.Core.pluginName();
    //console.log(parameters);

    // =======================================================================

    // -----------------------------------------------------------------------
    // plugin commands (MZ)
    (() => {
        'use strict';

        /**
         * イベント位置へ場所移動
         * @this {Game_Interpreter}
         * @param {YKNR.types.CommandParameters} params コマンドの引数
         */
        function transferToEvent(params) {
            const mapId = YKNR.UtilPluginCommand.getNumber(params, "mapId");
            const eventId = YKNR.UtilPluginCommand.getNumber(params, "eventId");
            const direction = YKNR.UtilPluginCommand.getNumber(params, "direction");
            const fadeType = YKNR.UtilPluginCommand.getNumber(params, "fadeType");
            const adjustX = YKNR.UtilPluginCommand.getNumber(params, "adjustX");
            const adjustY = YKNR.UtilPluginCommand.getNumber(params, "adjustY");

            $gamePlayer.reserveTransferToEvent(mapId, eventId, direction, fadeType);
            $gamePlayer.reserveTransferOffset(adjustX, adjustY);

            this.setWaitMode("transfer");
        };

        /**
         * 現在のマップのイベント位置へ場所移動
         * @this {Game_Interpreter}
         * @param {YKNR.types.CommandParameters} params コマンドの引数
         */
        function transferToEventInCurrentMap(params) {
            const eventId = YKNR.UtilPluginCommand.getNumber(params, "eventId");
            const direction = YKNR.UtilPluginCommand.getNumber(params, "direction");
            const fadeType = YKNR.UtilPluginCommand.getNumber(params, "fadeType");
            const adjustX = YKNR.UtilPluginCommand.getNumber(params, "adjustX");
            const adjustY = YKNR.UtilPluginCommand.getNumber(params, "adjustY");

            $gamePlayer.reserveTransferToEvent($gameMap.mapId(), eventId, direction, fadeType);
            $gamePlayer.reserveTransferOffset(adjustX, adjustY);

            this.setWaitMode("transfer");
        };


        YKNR.Core.registerPluginCommands([
            { name: "transferToEvent", func: transferToEvent },
            { name: "transferToEventInCurrentMap", func: transferToEventInCurrentMap },
        ]);
    })();


    // -----------------------------------------------------------------------
    // Game_Player

    YKNR.Core.redefine(Game_Player.prototype, "clearTransferInfo", function($) {
        return function() {
            $.call(this, ...arguments);
            this._newEventId = 0;
            this._newOffsetX = 0;
            this._newOffsetY = 0;
        };
    });

    YKNR.Core.redefine(Game_Player.prototype, "reserveTransfer", function($) {
        return function() {
            $.call(this, ...arguments);
            this._newEventId = 0;
            this._newOffsetX = 0;
            this._newOffsetY = 0;
        };
    });

    YKNR.Core.redefine(Game_Player.prototype, "locate", function($) {
        return function(x, y) {
            if (this.isTransferring()) {
                this.adjustTransferPos();
                x = this._newX;
                y = this._newY;
            }
            $.call(this, x, y);
        };
    });

    /**
     * 「場所移動」による転送先の座標を調整する.
     * @this {Game_Player}
     */
    Game_Player.prototype.adjustTransferPos = function() {
        if (this._newEventId > 0) {
            this.overrideTransferPosToEvent(this._newEventId);
        }
        if (this._newOffsetX !== 0 || this._newOffsetY !== 0) {
            this.addTransferPos(this._newOffsetX, this._newOffsetY);
        }
    };

    /**
     * 「場所移動」による転送先の座標を任意のイベントの位置へ上書きする.
     * @this {Game_Player}
     * @param {number} eventId 転送先のイベントID
     */
    Game_Player.prototype.overrideTransferPosToEvent = function(eventId) {
        const event = $gameMap.event(eventId);
        if (event) {
            this._newX = event.x;
            this._newY = event.y;
        } else {
            console.warn(`現在のマップ[ID:${$gameMap.mapId()}]にID:${eventId}のイベントは存在しません.`);
        }
    };

    /**
     * 「場所移動」による転送先の座標から位置を補正する.
     * @this {Game_Player}
     * @param {number} ox 左右方向のマス数
     * @param {number} oy 上下方向のマス数
     */
    Game_Player.prototype.addTransferPos = function(ox, oy) {
        this._newX = $gameMap.roundX(this._newX + ox);
        this._newY = $gameMap.roundY(this._newY + oy);
    };

    /**
     * イベント位置への転送処理の予約する.
     * @this {Game_Player}
     * @param {number} mapId 転送先のマップID
     * @param {number} eventId 転送先のマップのイベントID
     * @param {number} d 転送後の向き
     * @param {number} fadeType 転送時の画面のフェードタイプ
     */
    Game_Player.prototype.reserveTransferToEvent = function(mapId, eventId, d, fadeType) {
        this.reserveTransfer(mapId, 0, 0, d, fadeType);
        this._newEventId = eventId;
    };

    /**
     * 転送先の座標から任意のマス分の位置調整を追加で予約する.
     * @this {Game_Player}
     * @param {number} ox 左右方向のマス数
     * @param {number} oy 上下方向のマス数
     */
    Game_Player.prototype.reserveTransferOffset = function(ox, oy) {
        this._newOffsetX = ox;
        this._newOffsetY = oy;
    };

})();

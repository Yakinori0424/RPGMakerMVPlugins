//============================================================================
// YKNR_MZ_SaveThumbnail.js
// ---------------------------------------------------------------------------
// (c) 2022 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 1.0.0 (2022/05/08) 公開
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @plugindesc セーブファイルにサムネイル用の画像を保存し、
 * セーブ/ロード画面でファイル毎にサムネイルを表示します。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_SaveThumbnail
 * @base YKNR_MZ_Core
 * @orderAfter YKNR_MZ_Core
 *
 * 
 * @param thumbWidth
 * @text サイズの設定：幅
 * @desc 保存するサムネイルの幅を設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @default 122
 *
 * @param thumbHeight
 * @text サイズの設定：高さ
 * @desc 保存するサムネイルの高さを設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @default 94
 *
 * @param thumbQuality
 * @text 画質の設定
 * @desc 保存するサムネイルの画質を設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param isShowInSavefileList
 * @text ファイルリスト内に表示
 * @desc リストの項目にサムネイルを表示するか設定します。
 * @type boolean
 * @on 表示する
 * @off 表示しない
 * @default true
 *
 * @param thumbSLPosX
 * @text サムネイルのX座標
 * @desc 描画するX座標をJavascriptで設定します。
 * rect = 項目の範囲, width = サムネイル幅
 * @type string
 * @default rect.x + rect.width - width;
 * @parent isShowInSavefileList
 *
 * @param thumbSLPosY
 * @text サムネイルのY座標
 * @desc 描画するY座標をJavascriptで設定します。
 * rect = 項目の範囲, height = サムネイル高さ
 * @type string
 * @default rect.y
 * @parent isShowInSavefileList
 *
 * @param otherWindowClass
 * @text 別ウィンドウの表示設定
 * @desc 別ウィンドウにサムネイルを表示したいときに設定します。
 * 対象となるウィンドウクラス名を記入します。
 * @type string
 * @default 
 *
 * @param thumbOWPosX
 * @text サムネイルのX座標
 * @desc 別ウィンドウに描画するX座標をJavascriptで設定します。
 * rect = ウィンドウ内の範囲, width = サムネイル幅
 * @type string
 * @default rect.x + rect.width - width;
 * @parent otherWindowClass
 *
 * @param thumbOWPosY
 * @text サムネイルのY座標
 * @desc 別ウィンドウに描画するY座標をJavascriptで設定します。
 * rect = ウィンドウ内の範囲, height = サムネイル高さ
 * @type string
 * @default rect.y
 * @parent otherWindowClass
 *
 * 
 * @help YKNR_MZ_SaveThumbnail.js
 * ----------------------------------------------------------------------------
 * 【！注意！】
 * ※本スクリプトはツクールMZ専用です。
 *   MV版の YKNR_SaveThumbnail.js をMZ版へと移植/改良したものとなります。
 * ----------------------------------------------------------------------------
 *【機能紹介】
 * セーブデータにマップの現在地の画像をサムネイルとして保存し、
 * セーブ画面/ロード画面のリストにそのサムネイルを表示する機能を追加します。
 * 
 * ---------------------------------------------------------------------------
 *【パラメータ説明】
 * ・「サイズの設定：幅」「サイズの設定：高さ」「画質の設定」
 *   保存するデータサイズに関わる設定です。
 *   サイズを大きく画質を良くすれば、サムネイルの品質は良くなりますが、
 *   データが肥大化するので注意が必要です。
 * 
 * ・「ファイルリスト内に表示」
 *   デフォルトのセーブ/ロード画面のファイルリストウィンドウの
 *   項目内にそれぞれのサムネイルを表示します。
 *   ここに表示する必要性が無ければ OFF にしてください。
 *   また、サムネイルのサイズは項目内に収まるよう自動でリサイズされます。
 * 
 * ・「別ウィンドウの表示設定」
 *   ファイルリスト内ではなく、他プラグインによって追加された
 *   任意のウィンドウに表示することも可能です。
 *   表示したいウィンドウのクラス名を設定することで表示できます。
 *   例えば、公式プラグインの AltSaveScreen を本プラグインより前に配置し、
 *   このパラメータに Window_SavefileStatus と設定すると
 *   詳細ウィンドウ内に選択中のセーブデータのサムネイルが表示されます。
 * 
 * ---------------------------------------------------------------------------
 * ※以下、スクリプトわかる方向け
 * ---------------------------------------------------------------------------
 * 
 * -------------------------------------
 * // 撮影したサムネイルのビットマップ取得
 * const bitmap = SceneManager.thumbnailBitmap();
 * -------------------------------------
 * // 指定セーブデータのサムネイルのビットマップ取得
 * const savefileId = 1;
 * const bitmap = ImageManager.loadSavedataThumbnail(savefileId);
 * -------------------------------------
*/

(() => {
    "use strict";
    const YKNR = window.YKNR ||= {};

    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    //console.log(parameters);

    //------------------------------------------------------------------------
    /**
     * セーブファイルIDからセーブデータのサムネイル画像をロードします
     *
     * @param {number} savefileId セーブファイルID
     * @return {Bitmap} サムネイル画像のビットマップ
     */
    ImageManager.loadSavedataThumbnail = function(savefileId) {
        const dataUrl = DataManager.savefileInfo(savefileId)?.thumbnail || "";
        return this.loadBitmapFromDataUrl(dataUrl);
    };

    /**
     * ゲーム画面をプラグインパラメータ指定サイズのビットマップとして保存します
     */
    SceneManager.snapThumbnail = function() {
        if (this._thumbnailBitmap) {
            this._thumbnailBitmap.destroy();
        }
        const tw = parameters.thumbWidth;
        const th = parameters.thumbHeight;
        const ow = Graphics.width;
        const oh = Graphics.height;
        this._thumbnailBitmap = Bitmap.snapExt(this._scene, tw, th, ow, oh);

        /*
        // テスト用 : 撮影した画面を別ウィンドウへ出力
        const bitmap = this.snap();
        const dataUrl = bitmap.toJpegDataUrl();
        const arrayBuffer = YKNR.UtilDataUrl.toArrayBuffer(dataUrl);
        const mimeType = YKNR.UtilDataUrl.extractMimeType(dataUrl);
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        window.open(url);
        URL.revokeObjectURL(url);
        bitmap.destroy();
        */
    };

    /**
     * サムネイル用に保存したビットマップを返します.
     *
     * @return {Bitmap}
     */
    SceneManager.thumbnailBitmap = function() {
        return this._thumbnailBitmap;
    };

    /**
     * マップ画面を撮影し、ビットマップとして保存します.\
     * ウィンドウやフェード効果を一時非表示にして撮影を行います.
     */
    Scene_Map.prototype.snapForThumbnail = function() {
        this._windowLayer.visible = false;  // ウィンドウ消し
        this._colorFilter.enabled = false;  // フェード消し

        SceneManager.snapThumbnail();

        this._colorFilter.enabled = true;
        this._windowLayer.visible = true;
    };

    //------------------------------------------------------------------------
    /**
     * 撮影したサムネイル画像のデータURLを取得する
     * 
     * @return {string} データURL
     */
    function getSceneThumbDataUrl() {
        const bitmap = SceneManager.thumbnailBitmap();
        return bitmap?.toJpegDataUrl("", parameters.thumbQuality);
    };

    /**
     * セーブデータのサムネイルの描画位置を矩形で取得
     *
     * @param {Rectangle} rect 描画範囲の矩形
     * @return {Rectangle} 描画位置の矩形
     */
    function getDrawRectangle(rect) {
        const sw = parameters.thumbWidth;
        const sh = parameters.thumbHeight;
        const iw = rect.width;
        const ih = rect.height;
        const ratio = Math.min(Math.min(iw, sw) / sw, Math.min(ih, sh) / sh);
        const dw = Math.round(sw * ratio);
        const dh = Math.round(sh * ratio);
        const dx = this.thumbnailX(rect, dw);
        const dy = this.thumbnailY(rect, dh);
        return new Rectangle(dx, dy, dw, dh);
    };

    /**
     * セーブデータのサムネイルを描画する
     *
     * @param {Object} info セーブデータ
     * @param {Rectangle} rect 項目の矩形
     */
    function drawThumbnail(info, rect) {
        const sw = parameters.thumbWidth;
        const sh = parameters.thumbHeight;
        const dr = getDrawRectangle.call(this, rect);
        const bitmap = ImageManager.loadBitmapFromDataUrl(info.thumbnail);
        this.contents.blt(bitmap, 0, 0, sw, sh, dr.x, dr.y, dr.width, dr.height);
    };

    //------------------------------------------------------------------------
    YKNR.Core.redefine(Scene_Map.prototype, "executeAutosave", function($) {
        return function() {
            // マップ画面でのオートセーブ実行前にサムネイルの撮影
            this._spriteset.update();
            this.snapForThumbnail();
            $.call(this);
        };
    });

    YKNR.Core.redefine(Scene_Map.prototype, "stop", function($) {
        return function() {
            // マップ画面終了前にサムネイルの撮影
            if (!SceneManager.isNextScene(Scene_Map)) {
                this.snapForThumbnail();
            }
            $.call(this);
        };
    });

    YKNR.Core.redefine(DataManager, 'makeSavefileInfo', function($) {
        return function() {
            const info = $.call(this);
            const thumbnail = getSceneThumbDataUrl();
            if (thumbnail) {
                info.thumbnail = thumbnail;
            }
            return info;
        };
    });

    YKNR.Core.redefine(DataManager, 'loadSavefileImages', function($) {
        return function(info) {
            $.call(this, info);
            if (info.thumbnail) {
                ImageManager.loadBitmapFromDataUrl(info.thumbnail);
            }
        };
    });


    // =======================================================================
    // ファイルリストウィンドウ内にサムネイル表示を行う処理を追加します
    if (parameters.isShowInSavefileList) {
        Window_SavefileList.prototype.thumbnailX = eval('(function(rect, width) { return %1; });'.format(parameters.thumbSLPosX));
        Window_SavefileList.prototype.thumbnailY = eval('(function(rect, height) { return %1; });'.format(parameters.thumbSLPosY));

        YKNR.Core.redefine(Window_SavefileList.prototype, 'drawContents', function($) {
            return function(info, rect) {
                // 既存の描画項目より下にサムネイルを表示させるため, 先に矩形を作り直してサムネイルを描画する
                const padding = this.itemPadding();
                const itemRect = new Rectangle(rect.x, rect.y + padding, rect.width, rect.height - padding * 2);
                drawThumbnail.call(this, info, itemRect);

                $.call(this, info, rect);
            };
        });
    }


    // =======================================================================
    // セーブ/ロード画面の任意のウィンドウにサムネイル表示を行う処理を追加します
    if (parameters.otherWindowClass) {
        //--------------------------------------------------------------------
        /** @type {Function} */
        const thumbnailX = eval('(function(rect, width) { return %1; });'.format(parameters.thumbOWPosX));
        /** @type {Function} */
        const thumbnailY = eval('(function(rect, height) { return %1; });'.format(parameters.thumbOWPosY));

        /**
         * セーブデータのサムネイルを描画する
         *
         * @param {Number} savefileId セーブデータのファイル番号
        */
        function setThumbnailForAnyWindow(savefileId) {
            const info = DataManager.savefileInfo(savefileId);
            const itemRect = new Rectangle(0, 0, this.contentsWidth(), this.contentsHeight());
            const drawRect = getDrawRectangle.call(this, itemRect);
            this.contents.clearRect(drawRect.x, drawRect.y, drawRect.width, drawRect.height);
            if (info) {
                drawThumbnail.call(this, info, itemRect);
            }
        };

        //--------------------------------------------------------------------
        YKNR.Core.redefine(Window_SavefileList.prototype, 'callUpdateHelp', function($) {
            return function() {
                $.call(this);
                this.callUpdateThumbnail();
            };
        });

        /**
         * サムネイルを表示するウィンドウを設定する
         *
         * @param {Window_Base} anyWindow 任意のウィンドウ
        */
        Window_SavefileList.prototype.setAnyWindowForThumbnail = function(anyWindow) {
            this._anyWindowForThumbnail = anyWindow;
            this.callUpdateHelp();
        };

        /**
         * サムネイルの更新処理を呼び出す
        */
        Window_SavefileList.prototype.callUpdateThumbnail = function() {
            const anyWindow = this._anyWindowForThumbnail;
            if (this.active && anyWindow?.hasOwnProperty('setThumbnail')) {
                anyWindow.setThumbnail(this.savefileId());
            }
        };

        //--------------------------------------------------------------------

        YKNR.Core.redefine(Scene_File.prototype, 'create', function($) {
            return function() {
                $.call(this);
                this.setupThumbnailWindow();
            };
        });

        /**
         * サムネイル表示するウィンドウのセットアップ
        */
        Scene_File.prototype.setupThumbnailWindow = function() {
            const anyWindow = this.findThumbnailWindow();
            if (anyWindow) {
                // ウィンドウに動的に関数を追加する
                anyWindow.thumbnailX = thumbnailX.bind(anyWindow);
                anyWindow.thumbnailY = thumbnailY.bind(anyWindow);
                anyWindow.setThumbnail = setThumbnailForAnyWindow.bind(anyWindow);

                this._listWindow.setAnyWindowForThumbnail(anyWindow);
            }
        };

        /**
         * サムネイルを表示するウィンドウを取得する
         * 
         * @return {Window_Base} 任意のウィンドウクラス
        */
        Scene_File.prototype.findThumbnailWindow = function() {
            /** @type {Window_Base} */
            const anyWindow = this._windowLayer.children.find(el => el.constructor.name === parameters.otherWindowClass);
            return anyWindow;
        };
    }

})();

//============================================================================
// YKNR_SaveThumbnail.js - ver.1.0.0
// ---------------------------------------------------------------------------
// Copyright (c) 2019 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc セーブファイルにサムネイル用の画像を保存し、
 * セーブ/ロード画面でファイル毎にサムネイルを表示する
 * @author 焼きノリ
 * ===========================================================================
 *
 * @param AutoSnapForThumbnail
 * @text サムネイルの自動生成
 * @desc マップ画面からメニュー画面に切り替えたタイミングで
 * サムネイル用の画像を撮影するかを設定します。
 * @type boolean
 * @default true
 *
 * @param SnapSettings
 * @text サムネイルの保存設定
 *
 * @param ThumbQuality
 * @text 画質の設定
 * @desc 保存するサムネイルの画質を設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @parent SnapSettings
 *
 * @param ThumbSaveWidth
 * @text サイズの設定：幅
 * @desc 保存するサムネイルの幅を設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @default 122
 * @parent SnapSettings
 *
 * @param ThumbSaveHeight
 * @text サイズの設定：高さ
 * @desc 保存するサムネイルの高さを設定します。
 * 値が小さいほどデータサイズを小さくできます。
 * @type number
 * @min 0
 * @default 94
 * @parent SnapSettings
 *
 * @param ShowInSavefileList
 * @text ファイルリスト内に表示
 * @desc リストの項目にサムネイルを表示するか設定します。
 * @type boolean
 * @on 表示する
 * @off 表示しない
 * @default true
 *
 * @param ThumbItemPosX
 * @text サムネイルのX座標
 * @desc 描画するX座標をJavascriptで設定します。
 * rect = 項目の範囲, width = サムネイル幅
 * @type string
 * @default rect.x + rect.width - width;
 * @parent ShowInSavefileList
 *
 * @param ThumbItemPosY
 * @text サムネイルのY座標
 * @desc 描画するY座標をJavascriptで設定します。
 * rect = 項目の範囲, height = サムネイル高さ
 * @type string
 * @default rect.y + 5
 * @parent ShowInSavefileList
 *
 * @param ThumbItemScale
 * @text サムネイルのスケール値
 * @desc 描画するスケールを設定します。
 * 「サムネイルの保存設定」で設定した幅/高さを 1 とします。
 * @type number
 * @min 0
 * @decimals 2
 * @default 1.00
 * @parent ShowInSavefileList
 *
 * @param OtherWindowClass
 * @text 別ウィンドウの表示設定
 * @desc 別ウィンドウにサムネイルを表示したいときに設定します。
 * 対象となるウィンドウクラス名を記入します。
 * @type string
 * @default 
 *
 * @param ThumbOWPosX
 * @text サムネイルのX座標
 * @desc 別ウィンドウに描画するX座標をJavascriptで設定します。
 * rect = ウィンドウ内の範囲, width = サムネイル幅
 * @type string
 * @default rect.x + rect.width - width;
 * @parent OtherWindowClass
 *
 * @param ThumbOWPosY
 * @text サムネイルのY座標
 * @desc 別ウィンドウに描画するY座標をJavascriptで設定します。
 * rect = ウィンドウ内の範囲, height = サムネイル高さ
 * @type string
 * @default rect.y + 5
 * @parent OtherWindowClass
 *
 * @param ThumbOWScale
 * @text サムネイルのスケール値
 * @desc 別ウィンドウに描画するスケールを設定します。
 * 「サムネイルの保存設定」で設定した幅/高さを 1 とします。
 * @type number
 * @min 0
 * @decimals 2
 * @default 1.00
 * @parent OtherWindowClass
 *
 * @help
 * ===========================================================================
 *【！注意！】
 * ※ツクールMV本体のバージョンが 1.6.1 未満の場合、動作できません。
 * ===========================================================================
 *【機能紹介】
 * セーブデータにマップの現在地の画像をサムネイルとして保存し、
 * セーブ画面/ロード画面のリストにそのサムネイルを表示する機能を追加します。
 * 
 * サムネイル撮影のタイミングは、メニュー画面を開くときに自動に撮影されます。
 * 
 * community-1.3 の「オートセーブ機能」でセーブされたデータには、
 * サムネイルは表示しない仕様となっています。
 * 
 * ---------------------------------------------------------------------------
 *【パラメータ説明】
 * ・「サムネイルの自動生成」
 *   false にした場合、サムネイルの撮影は手動で行うことになります。
 *   イベントコマンドの「スクリプト」から以下を呼び出してください。
 * -------------------------------------
 * SceneManager.snapForThumbnail();
 * -------------------------------------
 * 
 * ・「画質の設定」「サイズの設定：幅」「サイズの設定：高さ」
 *   保存するデータサイズに関わる設定です。
 *   サイズを大きく画質を良くすれば、サムネイルの品質は良くなりますが、
 *   データが肥大化するので注意が必要です。
 * 
 * ・「ファイルリスト内に表示」
 *   デフォルトのリストのウィンドウ内にサムネイルを表示します。
 *   ここに表示する必要性が無ければ false にしてください。
 * 
 * ・「別ウィンドウの表示設定」
 *   ファイルリスト内ではなく、他プラグインによって追加された
 *   任意のウィンドウに表示することも可能です。
 *   表示したいウィンドウのクラス名を設定することで表示できます。
 *   例えば、Window_Help と設定すると
 *   ヘルプウィンドウ内に選択中のセーブデータのサムネイルが表示されます。
 *   (SceneManager._scene._listWindow を参照しているため、
 *    これが存在しない場合は正常に動作しません。)
 * 
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2019/01/04] [1.0.0] 公開
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * [Github] : https://github.com/Yakinori0424/RPGMakerMVPlugins
 * ---------------------------------------------------------------------------
 * 本プラグインは MITライセンス のもとで配布されています。
 * 利用はどうぞご自由に。
 * http://opensource.org/licenses/mit-license.php
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
    const pluginName = 'YKNR_SaveThumbnail';
    const parameters = PluginManager.parameters(pluginName);
    const isAutoSnap = parameters['AutoSnapForThumbnail'] === 'true';
    const thumbQuality = parseInt(parameters['ThumbQuality']);
    const thumbSaveWidth = parseInt(parameters['ThumbSaveWidth']);
    const thumbSaveHeight = parseInt(parameters['ThumbSaveHeight']);
    const isShowInList = parameters['ShowInSavefileList'] === 'true';
    const thumbItemPosX = parameters['ThumbItemPosX'] || '0';
    const thumbItemPosY = parameters['ThumbItemPosY'] || '0';
    const thumbItemScale = parseFloat(parameters['ThumbItemScale']);
    const otherWindowClass = parameters['OtherWindowClass'];
    const thumbOtherPosX = parameters['ThumbOWPosX'] || '0';
    const thumbOtherPosY = parameters['ThumbOWPosY'] || '0';
    const thumbOtherScale = parseFloat(parameters['ThumbOWScale']);


    //------------------------------------------------------------------------

    /**
     * セーブデータのサムネイルで使用するユニークなキーを返します
     *
     * @param {Object} info セーブデータのグローバルデータ
     * @return {string} 
    */
    function generateThumbUniqueKey(info) {
        if (info) {
            const globalInfo = DataManager.loadGlobalInfo();
            const savefileId = globalInfo.findIndex((gi) => gi === info);
            if (savefileId > 0) {
                return savefileId + ':' + info.timestamp;
            }
        }
        return undefined;
    };


    //------------------------------------------------------------------------

    /**
     * Takes a snapshot of the game screen and returns a new bitmap object.\
     * 出力するビットマップの幅と高さを指定できるよう, Bitmap.snap を元に拡張しています.\
     * 幅/高さが未指定の場合は, 従来のように Graphics.width, Graphics.height となります.\
     * また, 出力前の元々の幅と高さをさらに指定することで,\
     * その値を元にビットマップの幅と高さに合わせて拡大率を調整します.\
     * こちらの指定がない場合は, ビットマップの幅と高さと同値となり, 拡大率を変えません.
     *
     * @static
     * @param {Stage} stage The stage object
     * @param {number} dw 出力するビットマップの幅
     * @param {number} dh 出力するビットマップの高さ
     * @param {number} cw 元の幅
     * @param {number} ch 元の高さ
     * @return {Bitmap} リサイズされたビットマップ
     */
    Bitmap.snap2 = function(stage, dw = Graphics.width, dh = Graphics.height, cw = dw, ch = dh) {
        const bitmap = new Bitmap(dw, dh);
        if (stage) {
            const context = bitmap._context;
            const renderTexture = PIXI.RenderTexture.create(dw, dh);
            const last_sx = stage.scale.x;
            const last_sy = stage.scale.y;
            stage.scale.x = dw / cw;
            stage.scale.y = dh / ch;
            Graphics._renderer.render(stage, renderTexture);
            stage.worldTransform.identity();
            stage.scale.x = last_sx;
            stage.scale.y = last_sy;
            let canvas = null;
            if (Graphics.isWebGL()) {
                canvas = Graphics._renderer.extract.canvas(renderTexture);
            } else {
                canvas = renderTexture.baseTexture._canvasRenderTarget.canvas;
            }
            context.drawImage(canvas, 0, 0);
            renderTexture.destroy({ destroyBase: true });
            bitmap._setDirty();
        }
        return bitmap;
    };


    //------------------------------------------------------------------------

    /**
     * Base64形式用のキャッシュキーを返します.\
     * データURIは長くなるので, ユニークなキーを指定して代用します.
     *
     * @param {number|string} uniqueKey 任意のキー
     * @param {number} hue 色相
     * @return {string} 
     */
    ImageManager._generateBase64CacheKey = function(uniqueKey, hue) {
        return 'Base64:' + uniqueKey + ':' + hue;
    };

    /**
     * ビットマップをjpgのBase64形式文字列に変換します
     *
     * @param {Bitmap} bitmap ビットマップ
     * @return {string} Base64形式の文字列を返します
     */
    ImageManager.toBase64 = function(bitmap) {
        const minetype = 'image/jpeg';
        const quality = thumbQuality / 100;
        return bitmap._canvas.toDataURL(minetype, quality);
    };

    /**
     * Base64形式の文字列からビットマップをロードします.\
     * キャッシュに対応しています.
     *
     * @param {string} src Base64形式の文字列
     * @param {number|string} uniqueKey キャッシュに使用する任意のキー
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.loadBase64Bitmap = function(src, uniqueKey, hue = 0) {
        const key = this._generateBase64CacheKey(uniqueKey, hue);
        let bitmap = this._imageCache.get(key);
        if (!bitmap) {
            bitmap = Bitmap.load(src);
            if (this._callCreationHook) {
                // community-1.3 の プログレスバー 対応
                this._callCreationHook(bitmap);
            }
            bitmap.addLoadListener(function() {
                bitmap.rotateHue(hue);
            });
            this._imageCache.add(key, bitmap);
        } else if (!bitmap.isReady()) {
            bitmap.decode();
        }
        return bitmap;
    };

    /**
     * セーブファイルからサムネイルをロードします.
     *
     * @param {number} savefileId セーブファイルのID
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.loadThumbnail = function(savefileId) {
        const info = DataManager.loadSavefileInfo(savefileId);
        const uniqueKey = generateThumbUniqueKey(info);
        if (info && info.thumbnail && uniqueKey) {
            return ImageManager.loadBase64Bitmap(info.thumbnail, uniqueKey);
        }
        return this.loadEmptyBitmap();
    };

    /**
     * Base64形式の文字列からビットマップをリクエストします.\
     * キャッシュに対応しています.
     *
     * @param {string} src Base64形式の文字列
     * @param {number|string} uniqueKey キャッシュに使用する任意のキー
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.requestBase64Bitmap = function(src, uniqueKey, hue = 0) {
        const key = this._generateBase64CacheKey(uniqueKey, hue);
        let bitmap = this._imageCache.get(key);
        if (!bitmap) {
            bitmap = Bitmap.request(src);
            if (this._callCreationHook) {
                // community-1.3 の プログレスバー 対応
                this._callCreationHook(bitmap);
            }
            bitmap.addLoadListener(function() {
                bitmap.rotateHue(hue);
            });
            this._imageCache.add(key, bitmap);
            this._requestQueue.enqueue(key, bitmap);
        } else {
            this._requestQueue.raisePriority(key);
        }
        return bitmap;
    };

    /**
     * セーブファイルからサムネイルをリクエストします.
     *
     * @param {number} savefileId セーブファイルのID
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.requestThumbnail = function(savefileId) {
        const info = DataManager.loadSavefileInfo(savefileId);
        const uniqueKey = generateThumbUniqueKey(info);
        if (info && info.thumbnail && uniqueKey) {
            return ImageManager.requestBase64Bitmap(info.thumbnail, uniqueKey);
        }
        return this.loadEmptyBitmap();
    };

    /**
     * セーブ/ロード画面用のサムネイル読み込み中のビットマップを返します.
     *
     * @param {number} width
     * @param {number} height
     * @return {Bitmap} 
     */
    ImageManager.loadBusyThumbBitmap = function(width, height) {
        let empty = this._imageCache.get('emptyThumb:' + width + '_' + height);
        if (!empty) {
            empty = new Bitmap(width, height);
            empty.fillAll('#000000');
            this._imageCache.add('emptyThumb', empty);
        }
        return empty;
    };

    /**
     * サムネイルの自動撮影を行うか判定.
     * 
     * @return {boolean}
     */
    SceneManager.isAutoSnapForThumbnail = function() {
        if (!isAutoSnap || !$gameSystem.isSaveEnabled()) {
            return false;
        }
        // 現在のシーンがマップ画面以外であれば false.
        if (!this._scene || this._scene.constructor !== Scene_Map) {
            return false;
        }
        // 次のシーンが指定のいずれかであれば true.
        //const scenes = [Scene_Menu, Scene_Load, Scene_Save];
        const scenes = [Scene_Menu];
        return scenes.some((scene) => this.isNextScene(scene));
    };

    monkeyPatch(SceneManager, 'snapForBackground', function($) {
        return function() {
            $.call(this);
            if (this.isAutoSnapForThumbnail()) {
                this.snapForThumbnail();
            }
        };
    });

    /**
     * マップ画面を指定のサイズのビットマップを保存します.
     */
    SceneManager.snapForThumbnail = function() {
        if (this._scene) {
            const cw = Graphics.width;
            const ch = Graphics.height;
            this._thumbnailBitmap = Bitmap.snap2(this._scene, thumbSaveWidth, thumbSaveHeight, cw, ch);
        }
    };

    /**
     * サムネイルのビットマップを削除します.
     */
    SceneManager.clearThumbnail = function() {
        this._thumbnailBitmap = null;
    };

    /**
     * サムネイル用に保存したビットマップのBase64形式の文字列を返します.
     * 
     * @return {string} 
     */
    SceneManager.thumbnailBase64 = function() {
        if (this._thumbnailBitmap) {
            return ImageManager.toBase64(this._thumbnailBitmap);
        }
        return '';
    };

    monkeyPatch(DataManager, 'makeSavefileInfo', function($) {
        return function() {
            let info = $.call(this);
            info.thumbnail = SceneManager.thumbnailBase64();
            if (!info.thumbnail) {
                delete info.thumbnail;
            }
            return info;
        };
    });


    //------------------------------------------------------------------------

    /**
     * Base64形式の文字列データから画像を読み込んで描画する.
     * 
     * @param {string} src Base64形式の文字列
     * @param {number|string} uniqueKey キャッシュに使用する任意のキー
     * @param {number} x 描画 X 座標
     * @param {number} y 描画 Y 座標
     * @param {number} width 描画する幅
     * @param {number} height 描画する高さ
     * @param {Function} onDrawAfter 描画後の処理
     */
    Window_Base.prototype.drawBase64Data = function(src, uniqueKey, x, y, width = 0, height = 0, onDrawAfter = null) {
        const bitmap = ImageManager.loadBase64Bitmap(src, uniqueKey);
        const saveOpacity = this.contents.paintOpacity;
        if (!bitmap.isReady() && width > 0 && height > 0) {
            this.contents.fillRect(x, y, width, height, '#000000');
        }
        bitmap.addLoadListener(() => {
            const bw = bitmap.width;
            const bh = bitmap.height;
            width = width || bw;
            height = height || bh;
            const lastOpacity = this.contents.paintOpacity;
            this.contents.paintOpacity = saveOpacity;
            this.contents.blt(bitmap, 0, 0, bw, bh, x, y, width, height);
            if (onDrawAfter) {
                onDrawAfter();
            }
            this.contents.paintOpacity = lastOpacity;
        });
    };

    /**
     * Base64形式の文字列データから画像を読み込んで描画する.\
     * 読み込みの遅延により描画が遅れると, 高速スクロールさせることで\
     * 描画位置や透明度がずれることがあるのでその対策込みで再定義.
     * 
     * @param {string} src Base64形式の文字列
     * @param {number|string} uniqueKey キャッシュに使用する任意のキー
     * @param {number} x 描画 X 座標
     * @param {number} y 描画 Y 座標
     * @param {number} width 描画する幅
     * @param {number} height 描画する高さ
     * @param {Function} onDrawAfter 描画後の処理
     */
    Window_Selectable.prototype.drawBase64Data = function(src, uniqueKey, x, y, width = 0, height = 0, onDrawAfter = null) {
        const lastTopRow = this.topRow();
        const lastLeftCol = Math.floor(this._scrollX / this.itemWidth());
        const saveOpacity = this.contents.paintOpacity;
        const bitmap = ImageManager.loadBase64Bitmap(src, uniqueKey);
        if (!bitmap.isReady() && width > 0 && height > 0) {
            this.contents.fillRect(x, y, width, height, '#000000');
        }
        bitmap.addLoadListener(() => {
            if (this.topRow() !== lastTopRow || Math.floor(this._scrollX / this.itemWidth()) !== lastLeftCol) {
                return;
            }
            const bw = bitmap.width;
            const bh = bitmap.height;
            width = width || bw;
            height = height || bh;
            const lastOpacity = this.contents.paintOpacity;
            this.contents.paintOpacity = saveOpacity;
            this.contents.blt(bitmap, 0, 0, bw, bh, x, y, width, height);
            if (onDrawAfter) {
                onDrawAfter();
            }
            this.contents.paintOpacity = lastOpacity;
        });
    };


    //------------------------------------------------------------------------

    // リストウィンドウ内に, サムネイル表示を行う処理を追加します
    if (isShowInList) {
        Window_SavefileList.prototype.thumbnailX = eval('(function(rect, width) { return %1; });'.format(thumbItemPosX));
        Window_SavefileList.prototype.thumbnailY = eval('(function(rect, height) { return %1; });'.format(thumbItemPosY));

        monkeyPatch(Window_SavefileList.prototype, 'initialize', function($) {
            return function(x, y, width, height) {
                $.call(this, x, y, width, height);
                this.createThumbnail();
            };
        });

        Window_SavefileList.prototype.createThumbnail = function() {
            const contentsIndex = this.children.indexOf(this._windowContentsSprite);
            this._thumbContainer = new PIXI.Container();
            this.addChildAt(this._thumbContainer, contentsIndex);
            let thumb;
            for (let i = 0, l = this.maxVisibleItems(); i < l; i++) {
                thumb = new Sprite();
                thumb.scale.x = thumbItemScale;
                thumb.scale.y = thumbItemScale;
                thumb.bitmap = null;
                thumb.visible = false;
                this._thumbContainer.addChild(thumb);
            }
            this.refreshThumbnailParts();
        };

        monkeyPatch(Window_SavefileList.prototype, '_refreshContents', function($) {
            return function() {
                $.call(this);
                this.refreshThumbnailParts();
            };
        });

        Window_SavefileList.prototype.refreshThumbnailParts = function() {
            if (this._thumbContainer) {
                this._thumbContainer.x = this.padding;
                this._thumbContainer.y = this.padding;
            }
        };

        monkeyPatch(Window_SavefileList.prototype, 'refresh', function($) {
            return function() {
                this.clearThumbnail();
                $.call(this);
            };
        });

        Window_SavefileList.prototype.clearThumbnail = function() {
            const thumbs = this._thumbContainer.children;
            let thumb;
            for (let i = 0, l = thumbs.length; i < l; i++) {
                thumb = thumbs[i];
                thumb.bitmap = null;
                thumb.visible = false;
            }
        };

        monkeyPatch(Window_SavefileList.prototype, 'drawContents', function($) {
            return function(info, rect, valid) {
                $.call(this, info, rect, valid);
                let thumbRect = new Rectangle();
                thumbRect.width = Math.floor(thumbSaveWidth * thumbItemScale);
                thumbRect.height = Math.floor(thumbSaveHeight * thumbItemScale);
                thumbRect.x = this.thumbnailX(rect, thumbRect.width);
                thumbRect.y = this.thumbnailY(rect, thumbRect.height);
                this.drawThumbnail(info, thumbRect, valid);
            };
        });

        /**
         * サムネイルを描画する
         * 
         * @param {Object} info セーブファイルのインフォデータ
         * @param {Rectangle} thumbRect 
         * @param {boolean} valid 
         */
        Window_SavefileList.prototype.drawThumbnail = function(info, thumbRect, valid) {
            const globalInfo = DataManager.loadGlobalInfo();
            const savefileId = globalInfo.findIndex((gi) => gi === info);
            if (savefileId > 0 && info.thumbnail) {
                let sprite = this._thumbContainer.children.find((s) => !s.visible);
                sprite.visible = true;
                sprite.x = thumbRect.x;
                sprite.y = thumbRect.y;
                const thunmbBitmap = ImageManager.loadThumbnail(savefileId);
                if (!thunmbBitmap.isReady()) {
                    // 読み込み終わるまで別のビットマップを表示
                    const empty = ImageManager.loadBusyThumbBitmap(thumbRect.width, thumbRect.height);
                    sprite.bitmap = empty;
                }
                thunmbBitmap.addLoadListener(() => {
                    sprite.bitmap = thunmbBitmap;
                    sprite.bitmap.paintOpacity = valid ? 255 : this.translucentOpacity();
                });
            }
        };
    }

    // 任意のウィンドウに, サムネイル表示を行う処理を追加します
    if (otherWindowClass) {
        /** @type{Window_Base} */
        const WindowClass = eval(otherWindowClass);

        if (!(WindowClass instanceof Window_Base)) {
            throw new Error(WindowClass + ': This is not a class extended \'Window_Base\' class');
        }

        WindowClass.prototype._thumbnailX = eval('(function(rect, width) { return %1; });'.format(thumbOtherPosX));
        WindowClass.prototype._thumbnailY = eval('(function(rect, height) { return %1; });'.format(thumbOtherPosY));

        monkeyPatch(WindowClass.prototype, 'initialize', function($) {
            return function() {
                $.call(this, ...arguments);
                if (SceneManager._scene instanceof Scene_File) {
                    this._createThumbnail();
                }
            };
        });

        WindowClass.prototype._createThumbnail = function() {
            const contentsIndex = this.children.indexOf(this._windowContentsSprite);
            this._thumbContainer = new PIXI.Container();
            this.addChildAt(this._thumbContainer, contentsIndex);
            this._thumbSprite = new Sprite();
            this._thumbSprite.scale.x = thumbItemScale;
            this._thumbSprite.scale.y = thumbItemScale;
            this._thumbSprite.bitmap = null;
            this._thumbSprite.visible = false;
            this._thumbContainer.addChild(this._thumbSprite);
            // contents からはみ出ないためのマスクをつける
            this._maskGraphic = new PIXI.Graphics();
            this._thumbContainer.addChild(this._maskGraphic);
            this._thumbContainer.mask = this._maskGraphic;
            this._refreshThumbnailParts();
        };

        monkeyPatch(WindowClass.prototype, '_refreshContents', function($) {
            return function() {
                $.call(this);
                this._refreshThumbnailParts();
            };
        });

        WindowClass.prototype._refreshThumbnailParts = function() {
            if (this._thumbContainer) {
                this._thumbContainer.x = this.padding;
                this._thumbContainer.y = this.padding;
            }
            if (this._maskGraphic) {
                this._maskGraphic.clear();
                this._maskGraphic.beginFill('#000000');
                this._maskGraphic.drawRect(0, 0, this.contentsWidth(), this.contentsHeight());
                this._maskGraphic.endFill();
            }
        };

        monkeyPatch(WindowClass.prototype, 'update', function($) {
            return function() {
                if ($) {
                    $.call(this);
                }
                if (SceneManager._scene instanceof Scene_File) {
                    this._updateThumbnail();
                }
            };
        });

        WindowClass.prototype._updateThumbnail = function() {
            const list = SceneManager._scene._listWindow;
            if (list) {
                const savefileId = list.index() + 1;
                if (savefileId !== this._savefileId) {
                    this._savefileId = savefileId;
                    const rect = new Rectangle(0, 0, this.contentsWidth(), this.contentsHeight());
                    let thumbRect = new Rectangle();
                    thumbRect.width = Math.floor(thumbSaveWidth * thumbOtherScale);
                    thumbRect.height = Math.floor(thumbSaveHeight * thumbOtherScale);
                    thumbRect.x = this.thumbnailX(rect, thumbRect.width);
                    thumbRect.y = this.thumbnailY(rect, thumbRect.height);
                    this._drawThumbnail(thumbRect);
                }
            }
        };

        WindowClass.prototype._drawThumbnail = function(thumbRect) {
            const savefileId = this._savefileId;
            const info = DataManager.loadSavefileInfo(savefileId);
            if (this._savefileId > 0 && info && info.thumbnail) {
                const valid = DataManager.isThisGameFile(savefileId);
                this._thumbSprite.visible = true;
                this._thumbSprite.x = thumbRect.x;
                this._thumbSprite.y = thumbRect.y;
                const thunmbBitmap = ImageManager.loadThumbnail(savefileId);
                if (!thunmbBitmap.isReady()) {
                    // 読み込み終わるまで別のビットマップを表示
                    const empty = ImageManager.loadBusyThumbBitmap(thumbRect.width, thumbRect.height);
                    this._thumbSprite.bitmap = empty;
                }
                thunmbBitmap.addLoadListener(() => {
                    if (savefileId === this._savefileId) {
                        this._thumbSprite.bitmap = thunmbBitmap;
                        this._thumbSprite.bitmap.paintOpacity = valid ? 255 : this.translucentOpacity();
                    }
                });
            } else {
                this._thumbSprite.visible = false;
                this._thumbSprite.bitmap = null;
            }
        };
    }

    //--------------------------------------------------------------------

    monkeyPatch(Window_SavefileList.prototype, 'refresh', function($) {
        return function() {
            if (this._enabledRefresh) {
                $.call(this);
            }
        };
    });

    monkeyPatch(Scene_File.prototype, 'create', function($) {
        return function() {
            $.call(this);
            this._listWindow.deactivate();
            this.requestThumbnail();
        };
    });

    /**
     * セーブデータのサムネイル画像をリクエストする
     */
    Scene_File.prototype.requestThumbnail = function() {
        let info;
        for (let id = 1, l = this._listWindow.maxItems(); id <= l; id++) {
            info = DataManager.loadSavefileInfo(id);
            if (info && info.thumbnail) {
                ImageManager.requestThumbnail(id);
            }
        }
    };

    monkeyPatch(Scene_File.prototype, 'start', function($) {
        return function() {
            this._listWindow._enabledRefresh = true;
            $.call(this);
            this._listWindow.activate();
        };
    });


    //------------------------------------------------------------------------

    // community-1.3 の オートセーブ 対応
    if (DataManager.autoSaveGame) {
        monkeyPatch(DataManager, 'autoSaveGame', function($) {
            return function() {
                if (this._autoSaveFileId !== 0 && !this.isEventTest() && $gameSystem.isSaveEnabled()) {
                    SceneManager.clearThumbnail();
                }
                $.call(this);
            };
        });
    }

})();

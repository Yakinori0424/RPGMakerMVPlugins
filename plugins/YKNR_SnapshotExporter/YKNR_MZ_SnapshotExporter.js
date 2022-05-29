//============================================================================
// YKNR_MZ_SnapshotExporter.js
// ---------------------------------------------------------------------------
// (c) 2022 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 1.0.0 (2022/05/30) 公開
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @plugindesc ゲーム画面の他に、ウィンドウのみ/スプライトのみを
 * 画像ファイルとしてダウンロードできる機能を追加します。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_SnapshotExporter
 * @base YKNR_MZ_Core
 * @orderAfter YKNR_MZ_Core
 * 
 * 
 * @param defaultJpegQuality
 * @text JPGの品質のデフォルト値
 * @desc JPGで出力する際の品質の初期値を設定します。
 * export時に品質が未指定だった場合のみ適用されます。
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param defaultTimeLimit
 * @text URL有効秒数の設定
 * @desc 一部ブラウザの画像のURLが有効な時間を秒単位で設定します。
 * 画像のDL中であっても、時間を過ぎるとDLできなくなります。
 * @type number
 * @min 3
 * @max 180
 * @default 30
 * 
 * @param snapSignature
 * @text 署名テキスト
 * @desc 画面を撮影した場合の左下に表示する文字列を設定します。
 * スクリプトでの指定にも対応しています。
 * @type combo
 * @option (ここには任意の文字列も入力できます)
 * @option $dataSystem.gameTitle //タイトル名
 * @option SceneManager._scene.constructor.name //シーン名
 * @default 
 *
 * @param snapKey
 * @text スクリーンショットキー
 * @desc 画面の撮影を行うためのホットキーを設定します。
 * @type select
 * @option --設定なし--
 * @value 
 * @option F1
 * @option F2
 * @option F3
 * @option F4
 * @option F5
 * @option F6
 * @option F7
 * @option F8
 * @option F9
 * @option F10
 * @option F11
 * @option F12
 * @default 
 * 
 * @param snapModifierKey
 * @text 装飾キー
 * @desc 画面の撮影を行うための装飾キーを設定します。
 * ここで指定されたキーを同時に押さないと撮れません。
 * @type select
 * @option --設定なし--
 * @value 0
 * @option Ctrl
 * @value 1
 * @option Shift
 * @value 2
 * @option Alt
 * @value 4
 * @option Ctrl + Shift
 * @value 3
 * @option Ctrl + Alt
 * @value 5
 * @option Shift + Alt
 * @value 6
 * @option Ctrl + Shift + Alt
 * @value 7
 * @default 0
 * @parent snapKey
 * 
 * @param snapFormat
 * @text 画像フォーマット
 * @desc 画面の撮影を行った場合の
 * 画像フォーマットを設定します。
 * @type select
 * @option png
 * @option jpg
 * @default png
 * @parent snapKey
 * 
 * 
 * @help YKNR_MZ_SnapshotExporter.js
 * ----------------------------------------------------------------------------
 * 【！注意！】
 * ※本スクリプトはツクールMZ専用です。
 *   このプラグインは主に開発者向けに作られたもので、
 *   MV版の YKNR_SnapshotExporter.js をMZ版へと移植したものとなります。
 * ----------------------------------------------------------------------------
 *【機能紹介】
 * プラグインパラメータで設定したショートカットキーで、
 * ゲーム画面のスクリーンショットをいつでも撮影 & ダウンロードできます。
 * 
 * また、スクリプトを実行することで任意のウィンドウやスプライトだけを撮影して
 * 撮影 & ダウンロードすることもできます。
 * ゲーム中に表示されたUIのみを出力したいときに使えるかもしれませんが、
 * マイナーすぎる機能な感じもします..。
 * 
 * ----------------------------------------------------------------------------
 *【ダウンロード仕様】
 * ブラウザ経由で画像をダウンロードするため、
 * ネット上にアップロードしたゲームでも本機能は有効です。
 * （Chrome/FireFoxを用いて、GitHub上で動作確認済み）
 * ※Safariでは一部動作しないようなので、別タブで画像を開くようにしています。
 * 
 * ダウンロードした画像の保存場所は、ブラウザの設定に依存します。
 * ツクールからのテスト実行では、毎回保存場所を聞かれます。
 * 
 * ダウンロードする画像のファイル名のフォーマットは以下になっています。
 *   (ゲームタイトル)_(クラス名)_(年月日時分秒ミリ秒).(png/jpg)
 *   (ゲームタイトル)_(シーン名)_(年月日時分秒ミリ秒).(png/jpg)
 * 
 * ---------------------------------------------------------------------------
 * ※以下、スクリプトわかる方向け
 * ---------------------------------------------------------------------------
 *【提供している追加関数】
 * ・Bitmap/Sprite/Windowクラスのprototypeに撮影用関数を用意しました。
 *   基本的にはこちらの関数を使うのがよいです。
 *     Bitmap.prototype.exportPNG(className?: string)
 *     Bitmap.prototype.exportJPG(className?: string, quality?: number)
 *     Sprite.prototype.exportPNG()
 *     Sprite.prototype.exportJPG(quality?: number)
 *     Window.prototype.exportPNG()
 *     Window.prototype.exportJPG(quality?: number)
 * 
 * ・SceneManagerクラスに現在の画面を撮影する関数を用意しました。
 *     SceneManager.exportPNG()
 *     SceneManager.exportJPG(quality?: number)
 * 
 * ・Sprite/Windowクラスを撮影するためにBitmapへ変換する関数を用意しました。
 *     Bitmap.convert(pixi: PIXI.Container, dw?: number, dh?: number)
 * 
 * ---------------------------------------------------------------------------
 *【利用例】
 * パラメータの「スクリーンショットキー」と「装飾キー」を設定して
 * ゲーム中に設定したキーを押下することでゲーム画面を撮影できます。
 * 
 * スクリプトはコンソールから実行して撮影も可能です。
 * 
 * -------------------------------------
 * // 現在の画面をpng形式で撮影する
 * SceneManager.exportPNG();
 * -------------------------------------
 * // メニュー画面で実行すると背景の画像をpng形式で撮影する
 * SceneManager.backgroundBitmap().exportPNG();
 * -------------------------------------
 * // タイトル画面で実行すると
 * // 「はじめから」などのコマンドのウィンドウをpng形式で撮影する
 * SceneManager._scene._commandWindow.exportPNG();
 * -------------------------------------
*/

(function() {
    'use strict';
    const YKNR = window.YKNR ||= {};

    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    //console.log(parameters);

    //------------------------------------------------------------------------
    const pluginName = YKNR.Core.pluginName();
    let _anchorCount = 0;

    /**
     * download 属性を利用するためのアンカー要素を, 現在のページに作成してその要素を返す.\
     * click() 後は要素を自動削除する.
     * 
     * @return {HTMLAnchorElement}
     */
    function createAnchorElement() {
        let anchor = document.createElement('a');
        anchor.id = pluginName + '_' + (_anchorCount++);
        anchor.style.position = 'absolute';
        anchor.hidden = true;
        anchor.href = '';
        anchor.download = '';
        document.body.appendChild(anchor);
        anchor.onclick = () => {
            document.body.removeChild(anchor);
        }
        return anchor;
    };

    /**
     * 使用中のブラウザ経由でURLのファイルをダウンロードする
     * 
     * @param {Blob} blob 
     * @param {string} filename 
     * @param {number} limitSec 
     */
    function downloadFile(url, filename) {
        let anchor = createAnchorElement();
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
    };

    /**
     * キャンバスを画像ファイルとしてダウンロードする
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {string} filename 
     * @param {string} format 
     * @param {number} jpgQuality 
     * @param {number} limitSec 
     */
    function downloadImageFile(canvas, filename, format, jpgQuality, limitSec) {
        format = (format === 'jpeg') ? 'jpg' : format;
        jpgQuality = (format === 'jpg') ? jpgQuality.clamp(0, 100) / 100 : undefined;
        const minetype = 'image/' + ((format === 'jpg') ? 'jpeg' : format);
        const name = filename + '.' + format;
        if (window.navigator.msSaveBlob) {
            // for IE / Edge
            canvas.toBlob((b) => {
                window.navigator.msSaveBlob(b, name);
            }, minetype, jpgQuality);
        } else if (window.URL = window.URL || window.webkitURL) {
            // for Chrome / Firefox
            canvas.toBlob((b) => {
                const url = URL.createObjectURL(b);
                downloadFile(url, name);
                setTimeout(URL.revokeObjectURL, limitSec * 1000, url);
            }, minetype, jpgQuality);
        } else {
            // for Other...
            const url = canvas.toDataURL(minetype, jpgQuality);
            const ua = window.navigator.userAgent.toLowerCase();
            const isSafari = (ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1);
            if (isSafari) {
                // Safari ではクライアントのみで download 属性は扱えないようので新規タブへ
                window.open(url, '_blank');
            } else {
                downloadFile(url, name);
            }
        }
    };

    /**
     * 現在日時を文字列で取得する
     * 
     * @return {string} 
     */
    function dateNowFormat() {
        const date = new Date();
        let format = '';
        format += date.getFullYear().padZero(4);
        format += (date.getMonth() + 1).padZero(2);
        format += date.getDate().padZero(2);
        format += date.getHours().padZero(2);
        format += date.getMinutes().padZero(2);
        format += date.getSeconds().padZero(2);
        format += date.getMilliseconds().padZero(3);
        return format;
    };

    /**
     * 署名テキストを取得する
     */
    function getSignature() {
        try {
            return eval(parameters.snapSignature) || "";
        } catch (e) {
            return parameters.snapSignature;
        }
    };

    /**
     * ビットマップの左下に署名を描画する
     * 
     * @param {Bitmap} bitmap 描画するビットマップ
     */
    function drawSignature(bitmap) {
        const signText = getSignature();
        if (!!signText) {
            const size = 22;
            const padding = 6;
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.fontSize = size;
            bitmap.drawText(signText, padding, bitmap.height - padding - size, bitmap.width, size);
        }
    };


    //------------------------------------------------------------------------
    /**
     * ワールド空間のスケール値を取得
     * 
     * @param {PIXI.DisplayObject} object 
     * @return {Point} 
     */
    function worldScale(object) {
        let scale = new Point(1, 1);
        let item = object;
        do {
            scale.x *= item.scale.x;
            scale.y *= item.scale.y;
        } while (item = item.parent);
        return scale;
    };


    //------------------------------------------------------------------------
    /**
     * PIXIのオブジェクトの内容をビットマップに変換して返します.\
     * width/height プロパティが設定されていない場合は,\
     * ゲーム画面と同じサイズのビットマップとなります.\
     * また, 子オブジェクトも変換の対象になります.
     *
     * @static
     * @param {PIXI.Container} pixi
     * @param {number} dw 出力するビットマップの幅
     * @param {number} dh 出力するビットマップの高さ
     * @return {Bitmap}
     */
    Bitmap.convert = function(pixi, dw = 0, dh = 0) {
        const parent = pixi.parent;
        const anchor = pixi.anchor;
        const index = (parent) ? parent.children.indexOf(pixi) : -1;
        const x = pixi.x;
        const y = pixi.y;
        const visible = pixi.visible;
        const ax = (anchor) ? anchor.x : -1;
        const ay = (anchor) ? anchor.y : -1;
        const stage = new Stage();
        stage.addChild(pixi);
        pixi.x = 0;
        pixi.y = 0;
        pixi.visible = true;
        if (anchor) {
            anchor.x = 0;
            anchor.y = 0;
        }
        const wScale = worldScale(pixi);
        const wWidth = Math.round(pixi.width == 0 ? Graphics.width : pixi.width * wScale.x);
        const wHeight = Math.round(pixi.height == 0 ? Graphics.height : pixi.height * wScale.y);
        dw = dw > 0 ? dw : wWidth;
        dh = dh > 0 ? dh : wHeight;
        const bitmap = this.snapExt(stage, dw, dh, wWidth, wHeight);
        if (parent) {
            parent.addChildAt(pixi, index);
        }
        pixi.x = x;
        pixi.y = y;
        pixi.visible = visible;
        if (anchor) {
            anchor.x = ax;
            anchor.y = ay;
        }
        stage.destroy();
        return bitmap;
    };

    /**
     * ビットマップを指定の画像フォーマットで保存します.
     * 
     * @param {string} className
     * @param {string} format
     * @param {number} quality
     */
    Bitmap.prototype._export = function(className, format = 'png', quality = parameters.defaultJpegQuality) {
        const filename = $dataSystem.gameTitle + '_' + (className ? className + '_' : '') + dateNowFormat();
        downloadImageFile(this._canvas, filename, format, quality, parameters.defaultTimeLimit);
    };

    /**
     * ビットマップをpngファイルとして保存します.
     * 
     * @param {string} className
     */
    Bitmap.prototype.exportPNG = function(className) {
        this._export(className || this.constructor.name, 'png');
    };

    /**
     * ビットマップをjpgファイルとして保存します.
     *
     * @param {string} className
     * @param {number} quality
     */
    Bitmap.prototype.exportJPG = function(className, quality = parameters.defaultJpegQuality) {
        this._export(className || this.constructor.name, 'jpg', quality);
    };

    /**
     * スプライトをpngファイルとして保存します.
     */
    Sprite.prototype.exportPNG = function() {
        const bitmap = Bitmap.convert(this);
        bitmap.exportPNG(this.constructor.name);
        bitmap.destroy();
    };

    /**
     * スプライトをjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    Sprite.prototype.exportJPG = function(quality = parameters.defaultJpegQuality) {
        const bitmap = Bitmap.convert(this);
        bitmap.exportJPG(this.constructor.name, quality);
        bitmap.destroy();
    };

    /**
     * ウィンドウをpngファイルとして保存します.
     */
    Window.prototype.exportPNG = function() {
        const bitmap = Bitmap.convert(this);
        bitmap.exportPNG(this.constructor.name);
        bitmap.destroy();
    };

    /**
     * ウィンドウをjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    Window.prototype.exportJPG = function(quality = parameters.defaultJpegQuality) {
        const bitmap = Bitmap.convert(this);
        bitmap.exportJPG(this.constructor.name, quality);
        bitmap.destroy();
    };

    /**
     * 画面をpngファイルとして保存します.
     */
    SceneManager.exportPNG = function() {
        const bitmap = this.snap();
        drawSignature(bitmap);
        bitmap._export(this._scene.constructor.name, 'png');
        bitmap.destroy();
    };

    /**
     * 画面をjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    SceneManager.exportJPG = function(quality = parameters.defaultJpegQuality) {
        const bitmap = this.snap();
        drawSignature(bitmap);
        bitmap._export(this._scene.constructor.name, 'jpg', quality);
        bitmap.destroy();
    };

    //------------------------------------------------------------------------
    if (parameters.snapKey) {
        /**
         * ゲーム画面のスクリーンショットを撮影してダウンロード
         */
        function snapGameScreen() {
            if (parameters.snapFormat === 'png') {
                SceneManager.exportPNG();
            } else {
                SceneManager.exportJPG(parameters.defaultJpegQuality);
            }
        };

        /**
         * スクリーンショットを撮るためのトリガーの判定
         * 
         * @param {KeyboardEvent} event
         * @return {boolean} 
         */
        function isTriggerSnapshot(event) {
            return (parameters.snapKey === event.key)
                && (((parameters.snapModifierKey & (1 << 0)) !== 0) === event.ctrlKey)
                && (((parameters.snapModifierKey & (1 << 1)) !== 0) === event.shiftKey)
                && (((parameters.snapModifierKey & (1 << 2)) !== 0) === event.altKey);
        };

        YKNR.Core.redefine(SceneManager, "onKeyDown", function($) {
            return function(event) {
                if (isTriggerSnapshot(event)) {
                    snapGameScreen();
                } else {
                    $.call(this, event);
                }
            };
        });
    }

})();

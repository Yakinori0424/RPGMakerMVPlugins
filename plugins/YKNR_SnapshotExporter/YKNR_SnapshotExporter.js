//============================================================================
// YKNR_SnapshotExporter.js - ver.1.0.1
// ---------------------------------------------------------------------------
// Copyright (c) 2018 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc 画面の他に、ウィンドウのみ/スプライトのみを
 * 画像ファイルとしてダウンロードできる関数を追加します。
 * @author 焼きノリ
 * ===========================================================================
 *
 * @param DefaultJpegQuality
 * @text JPGの品質のデフォルト値
 * @desc JPGで出力する際の品質の初期値を設定します。
 * export時に品質が未指定だった場合のみ適用されます。
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param DefaultDLTimeLimit
 * @text URL有効秒数の設定
 * @desc 一部ブラウザの画像のURLが有効な時間を秒単位で設定します。
 * 画像のDL中であっても、時間を過ぎるとDLできなくなります。
 * @type number
 * @min 5
 * @max 300
 * @default 60
 *
 * @param ScreenshotKeyCode
 * @text スクリーンショットキー
 * @desc スクリーンショットを行うためのショートカットを設定します。
 * @type select
 * @option none
 * @value 0
 * @option F1
 * @value 112
 * @option F2
 * @value 113
 * @option F3
 * @value 114
 * @option F4
 * @value 115
 * @option F5
 * @value 116
 * @option F6
 * @value 117
 * @option F7
 * @value 118
 * @option F8
 * @value 119
 * @option F9
 * @value 120
 * @option F10
 * @value 121
 * @option F11
 * @value 122
 * @option F12
 * @value 123
 * @default 0
 * 
 * @param ScreenshotModifierKey
 * @text 装飾キー
 * @desc スクリーンショットを行うための装飾キーを設定します。
 * ここで指定されたキーを同時に押さないと撮れません。
 * @type select
 * @option none
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
 * @parent ScreenshotKeyCode
 * 
 * @param ScreenshotFormat
 * @text 画像フォーマット
 * @desc ショートカットキーでスクリーンショットを行った場合の
 * 画像フォーマットを設定します。
 * @type select
 * @option png
 * @option jpg
 * @default png
 * @parent ScreenshotKeyCode
 * 
 * @help
 * ===========================================================================
 *【！注意！】
 * ※ツクールMV本体のバージョンが 1.6.1 未満の場合、動作できません。
 * ===========================================================================
 *【機能紹介】
 * このプラグインは主に開発者向けに作られたものです。
 * 
 * 画面のスクリーンショット機能に加え、任意のウィンドウ or スプライトだけを
 * png/jpg としてダウンロードすることができます。
 * 
 * スクリーンショットだとどうしても背景に移りこんでしまう...など、
 * ゲーム中に表示されたパーツのみを出力したいときに使えるかもしれません。
 * 
 * ブラウザ経由で画像をダウンロードするため、
 * ネット上にアップロードしたゲームでも本機能は有効です。
 * （Chrome/FireFoxを用いて、GitHub上で動作確認済み）
 * 
 * ダウンロードした画像の保存場所は、ブラウザの設定に依存します。
 * ツクールからのテスト実行では、毎回保存場所を聞かれます。
 * 
 * 画像のファイル名のフォーマットは以下になっています。
 *   (ゲームタイトル)_(クラス名)_(年月日時分秒ミリ秒).(png/jpg)
 * 
 * スクリーンショット機能に限り、
 * ショートカットキーでいつでも撮ることができるようになっています。
 * プラグインパラメータから、キーの設定を行ってください。
 * 不要であれば none を指定してください。
 * 
 * 
 * ---------------------------------------------------------------------------
 *【実装内容詳細】
 * ・Bitmap.snap 関数で、出力する幅/高さ、元の幅/高さを指定できる引数を追加。
 *     Bitmap.snap(stage, dw?, dh?, cw?, ch?)
 *   これ以下の機能のためにこの関数を拡張。
 * 
 * ・Bitmap.convert 関数を新たに追加。
 *     Bitmap.convert(pixi, dw?, dh?)
 *   PIXI.Sprite or PIXI.Container クラスを継承したオブジェクトなら
 *   個別にビットマップを作成して返します。
 *   このプラグインでは Sprite / Windowを渡しているが、
 *   実は WindowLayer とか Weather とか ToneSprite も渡せる。サポートしないけど。
 *   Stage も渡せる。おそらくサイズがおかしくなるだろうが。
 * 
 * ・Bitmapクラスのプロトタイプに、
 *   ビットマップデータを png/jpg としてダウンロードする関数を追加。
 *     Bitmap.prototype._export(className?, format?, quality?)
 * 
 * ・Bitmap/Sprite/Windowクラスのプロトタイプに、
 *   ダウンロード用の関数をそれぞれ用意しています。
 *   基本的にはこちらの関数を使うのがよいです。
 *     Bitmap.prototype.exportPNG(className?)
 *     Bitmap.prototype.exportJPG(className?, quality?)
 *     Sprite.prototype.exportPNG()
 *     Sprite.prototype.exportJPG(quality?)
 *     Window.prototype.exportPNG()
 *     Window.prototype.exportJPG(quality?)
 * 
 * ・SceneManagerクラスに、
 *   画面を撮影したものをダウンロードする関数を用意しています。
 *     SceneManager.exportPNG()
 *     SceneManager.exportJPG(quality?)
 * 
 * ・Sprite や Window のダウンロードは、一度Bitmapに変換させてから
 *   それを画像ファイルとして出力するという仕様で設計。
 * 
 * ・ダウンロードの実装のため、アンカー要素を作成して利用しています。
 *   Safariでは一部動作しないようなので、別タブで画像を開くようにしています。
 * 
 * 
 * ---------------------------------------------------------------------------
 *【お試し】
 * 
 * いずれかの画面で以下をコンソールから実行すると
 * 現在の画面の画像をダウンロードします。
 * -------------------------------------
 * SceneManager.exportPNG();
 * -------------------------------------
 * 
 * メニュー画面やセーブ/ロード画面で以下をコンソールから実行すると
 * 背景の画像をダウンロードします。
 * -------------------------------------
 * SceneManager.backgroundBitmap().exportPNG();
 * -------------------------------------
 * 
 * タイトル画面で以下をコンソールから実行すると
 * 「はじめから」などのコマンドのウィンドウの画像をダウンロードします。
 * -------------------------------------
 * SceneManager._scene._commandWindow.exportPNG();
 * -------------------------------------
 * 
 * ===========================================================================
 * 
 * ---------------------------------------------------------------------------
 *【その他】
 * <!> Bitmap.snap を再定義しています。
 *
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2018/12/16] [1.0.0] Twitterで先行公開
 * [2018/12/22] [1.0.1] プラグインパラメータの親設定のミス修正
 *                      Bitmap.snapの再定義をヘルプに明記
 *                      Bitmap.snapの再定義チェックを追加
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
    // パラメータを受け取る.
    const pluginName = 'YKNR_SnapshotExporter';
    const parameters = PluginManager.parameters(pluginName);
    const defaultJpegQuality = parseInt(parameters['DefaultJpegQuality']);
    const defaultTimeLimit = parseInt(parameters['DefaultDLTimeLimit']);
    const takeFuncKeyCode = parseInt(parameters['ScreenshotKeyCode']);
    const takeModifierKey = parseInt(parameters['ScreenshotModifierKey']);
    const takeFormat = parameters['ScreenshotFormat'];


    //------------------------------------------------------------------------

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

    if (Bitmap.snap.name !== 'YKNR_Bitmap_snap') {
        /**
         * Takes a snapshot of the game screen and returns a new bitmap object.\
         * 出力するビットマップの幅と高さを指定できるように拡張しています.\
         * それぞれが未指定の場合は, 従来のように Graphics.width, Graphics.height となります.\
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
         * @return {Bitmap}
         */
        Bitmap.snap = function YKNR_Bitmap_snap(stage, dw = Graphics.width, dh = Graphics.height, cw = dw, ch = dh) {
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
    }

    /**
     * PIXIのオブジェクトの内容をビットマップに変換して返します.\
     * width/height プロパティが設定されていない場合は,\
     * ゲーム画面と同じサイズのビットマップとなります.\
     * また, 子オブジェクトも変換の対象になります.
     *
     * @static
     * @param {PIXI.Container|PIXI.Sprite} pixi
     * @param {number} dw 出力するビットマップの幅
     * @param {number} dh 出力するビットマップの高さ
     * @return {Bitmap}
     */
    Bitmap.convert = function Bitmap_convert(pixi, dw = 0, dh = 0) {
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
        const bitmap = Bitmap.snap(stage, dw, dh, wWidth, wHeight);
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
        stage.destroy(true);
        return bitmap;
    };

    /**
     * ビットマップを指定の画像フォーマットで保存します.
     * 
     * @param {string} className
     * @param {string} format
     * @param {number} quality
     */
    Bitmap.prototype._export = function Bitmap_export(className, format = 'png', quality = defaultJpegQuality) {
        const filename = $dataSystem.gameTitle + '_' + (className ? className + '_' : '') + dateNowFormat();
        downloadImageFile(this._canvas, filename, format, quality, defaultTimeLimit);
    };

    /**
     * ビットマップをpngファイルとして保存します.
     * 
     * @param {string} className
     */
    Bitmap.prototype.exportPNG = function Bitmap_exportPNG(className) {
        this._export(className || this.constructor.name, 'png');
    };

    /**
     * ビットマップをjpgファイルとして保存します.
     *
     * @param {string} className
     * @param {number} quality
     */
    Bitmap.prototype.exportJPG = function Bitmap_exportJPG(className, quality = defaultJpegQuality) {
        this._export(className || this.constructor.name, 'jpg', quality);
    };

    /**
     * スプライトをpngファイルとして保存します.
     */
    Sprite.prototype.exportPNG = function Sprite_exportPNG() {
        Bitmap.convert(this).exportPNG(this.constructor.name);
    };

    /**
     * スプライトをjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    Sprite.prototype.exportJPG = function Sprite_exportJPG(quality = defaultJpegQuality) {
        Bitmap.convert(this).exportJPG(this.constructor.name, quality);
    };

    /**
     * ウィンドウをpngファイルとして保存します.
     */
    Window.prototype.exportPNG = function Window_export() {
        Bitmap.convert(this).exportPNG(this.constructor.name);
    };

    /**
     * ウィンドウをjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    Window.prototype.exportJPG = function Window_exportJPG(quality = defaultJpegQuality) {
        Bitmap.convert(this).exportJPG(this.constructor.name, quality);
    };

    /**
     * 画面をpngファイルとして保存します.
     */
    SceneManager.exportPNG = function SceneManager_exportPNG() {
        this.snap()._export(this._scene.constructor.name, 'png');
    };

    /**
     * 画面をjpgファイルとして保存します.
     * 
     * @param {number} quality
     */
    SceneManager.exportJPG = function SceneManager_exportJPG(quality = defaultJpegQuality) {
        this.snap()._export(this._scene.constructor.name, 'jpg', quality);
    };


    //------------------------------------------------------------------------

    if (takeFuncKeyCode !== 0) {
        /**
         * スクリーンショットを撮るためのトリガーの判定
         * 
         * @param {KeyboardEvent} event
         * @return {boolean} 
         */
        function isTriggerSnapshot(event) {
            return (((takeModifierKey & (1 << (1 - 1))) !== 0) === event.ctrlKey) &&
                (((takeModifierKey & (1 << (2 - 1))) !== 0) === event.shiftKey) &&
                (((takeModifierKey & (1 << (3 - 1))) !== 0) === event.altKey) &&
                (takeFuncKeyCode === event.keyCode);
        };

        monkeyPatch(SceneManager, 'onKeyDown', function($) {
            return function(event) {
                $.call(this, event);
                if (isTriggerSnapshot(event)) {
                    this.snap()._export(this._scene.constructor.name, takeFormat);
                }
            };
        });
    }

})();

// ===========================================================================
// YKNR_ShopSettingsEx.js - ver.2.0.0
// ---------------------------------------------------------------------------
// Copyright (c) 2016 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc ショップの設定を拡張します。装備コマンドの追加や
 * 価格レートの設定、売却専用ショップなどが設定できます。
 * @author 焼きノリ
 * ===========================================================================
 * @param BuyPriceRate
 * @text 購入価格レートの設定
 * @desc 購入時の価格に対し、乗算するレートの設定。
 * @type struct<StructPriceRate>
 * @default {"Base":"100","UseVar":"0"}

 * @param SellPriceRate
 * @text 売却価格レートの設定
 * @desc 売却時の価格に対し、乗算するレートの設定。
 * @type struct<StructPriceRate>
 * @default {"Base":"50","UseVar":"0"}

 * @param IsEnableEquipment
 * @text 装備コマンドの追加
 * @desc ショップのコマンドに「装備」を追加します。
 * プラグインコマンドからでも個別に設定可能。
 * @type boolean
 * @on 装備コマンドを表示
 * @off 装備コマンドを非表示
 * @default true

 * @param IsDirectOpenList
 * @text 直接商品リストを開く
 * @desc "購入のみ or 売却のみ" のとき、直接リストを表示するか。
 * 直接表示した場合は、"装備コマンドの追加"は無視されます。
 * @type boolean
 * @on 装備コマンドを表示
 * @off 装備コマンドを非表示
 * @default false

 * @param IsSortForSellList
 * @text 売却リストの自動ソート
 * @desc 売却時の所持リスト内で、売却可能なアイテムが
 * 優先的にリストの上に来るように自動ソートを行います。
 * @type boolean
 * @on 自動ソートする
 * @off 自動ソートしない
 * @default true

 * @help
 * ===========================================================================
 *【！注意！】
 * ※ツクールMV本体のバージョンが 1.4.X 以前の場合、動作保証できません。
 * ===========================================================================
 *【機能紹介】
 * ・売却専用ショップが設定できるようになる
 *   (その際、売れるものを限定できるショップにも設定可能)
 * ・"購入/売却" 時の価格に対し、それぞれレートをかけることができる
 *   (小数点以下は切り捨て)
 * ・"購入のみ or 売却のみ" の場合、直接商品リストを表示させる
 * ・"購入のみ or 売却のみ" なら、無効になったコマンドを非表示にする
 *   (直接商品リストを開く機能がOFFの場合にのみ設定有効)
 * ・ショップ画面の "購入する/売却する/やめる" のコマンドに "装備" を表示
 *   (直接商品リストを開く機能がOFFの場合にのみ設定有効)
 * ・売却する時のアイテムリストの並び順を
 *   売却可能なアイテムが優先的に上に表示されるよう、自動ソートができる

 * ---------------------------------------------------------------------------
 *【プラグインコマンド】
 * イベントコマンドの「ショップの処理」の実行前に
 * 「プラグインコマンド」から以下のコマンドを呼び出して設定します。
 * また、設定した内容はショップ画面から戻ったタイミングでリセットされます。

 * --------------------------------------
 * ショップ拡張設定 売却のみ
 * --------------------------------------
 * 購入不可の売却のみのショップにすることができます。
 * その際、購入のみのチェックは外さないと、購入のみが優先されるので注意。
 * さらに商品を設定していると、その商品だけを売ることができる店になります。

 * --------------------------------------
 * ショップ拡張設定 装備コマンド表示
 * ショップ拡張設定 装備コマンド非表示
 * --------------------------------------
 * 装備コマンドの表示設定をショップ個別に行えます。
 * パラメータの "装備コマンドの追加" の設定より優先されます。
 * 武器屋のみ店での装備変更が可能、といった表現をしたいときに。

 * --------------------------------------
 * ショップ拡張設定 購入価格レート変更 定数 n%
 * ショップ拡張設定 購入価格レート変更 変数 #n
 * --------------------------------------
 * 購入時の価格のレートを変更できます。
 * 定数の場合 : 'n' には任意の整数を入れてください。基本値は 100% です。
 * 変数の場合 : 'n' には任意の変数の番号を入れてください。
 *              (任意の変数の値 / 100.0) の値がレートとして設定されます。

 * --------------------------------------
 * ショップ拡張設定 売却価格レート変更 定数 n%
 * ショップ拡張設定 売却価格レート変更 変数 #n
 * --------------------------------------
 * 売却時の価格のレートを変更できます。
 * 定数の場合 : 'n' には任意の整数を入れてください。基本値は 50% です。
 * 変数の場合 : 'n' には任意の変数の番号を入れてください。
 *              (任意の変数の値 / 100.0) の値がレートとして設定されます。

 * ---------------------------------------------------------------------------
 *【その他】
 * <!> Scene_Shop.prototype.sellingPrice を再定義しています。
 *
 * ---------------------------------------------------------------------------
 *【更新履歴】
 * [2017/10/15] [2.0.0] ・1.5.0 以降の仕様に合わせてパラメータの作り直し
 *                        パラメータ名が変更になったため、再度設定が必要です。
 *                      ・プラグインコマンドの引数の変更。
 *                        以前の引数は実行されないため、再度設定が必要です。
 *                      ・売却リストの自動ソート機能の追加
 * [2017/07/08] [1.1.0] ・購入/売却のレート基本値が変数の場合、
 *                        ゲーム起動後初回のショップでのレートが
 *                        正常に適用されていなかった問題の修正
 *                      ・プラグインコマンドのレートの設定のフォーマットを変更
 * [2016/12/25] [1.0.0] 公開
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * ---------------------------------------------------------------------------
 * 本プラグインは MITライセンス のもとで配布されています。
 * 利用はどうぞご自由に。
 * http://opensource.org/licenses/mit-license.php
*/
/*~struct~StructPriceRate:
 * @param Base
 * @text レート基本値設定
 * @desc 価格に対し、乗算するレートのデフォルト値。単位は ％ です。
 * プラグインコマンドで設定しない場合、この値が適用されます。
 * @type number
 * @min 0
 * @default 100
 *
 * @param UseVar
 * @text 変数を使用する
 * @desc 指定した変数をレート基本値として使用できます。
 * 「なし」以外が設定されていると、こちらが優先されます。
 * @type variable
 * @default 0
 */

(function() {
    'use strict';

    //------------------------------------------------------------------------
    // パラメータを受け取る.
    var parameters = PluginManager.parameters('YKNR_ShopSettingsEx');
    var defaultBuyRate = JSON.parse(parameters['BuyPriceRate']);
    var defaultSeelRate = JSON.parse(parameters['SellPriceRate']);
    var defaultShowEquipCommand = parameters['IsEnableEquipment'] === 'true';
    var isDirectList = parameters['IsDirectOpenList'] === 'true';
    var isSortForSellList = parameters['IsSortForSellList'] === 'true';

    //------------------------------------------------------------------------
    var INVALID_RATE = -1;

    var _isShowEquipCommand = false;
    var _vendOnly = false;
    var _buyRate = INVALID_RATE;
    var _sellRate = INVALID_RATE;

    var _goods = null;
    var _purchaseOnly = false;

    //------------------------------------------------------------------------
    // 拡張プラグインコマンドの任意の引数判定用文字列.
    var VAR = '%$';
    var pluginCommands = [
        ['ショップ拡張設定', '売却のみ', function(args) { _vendOnly = true; }],
        ['ショップ拡張設定', '装備コマンド表示', function(args) { _isShowEquipCommand = true; }],
        ['ショップ拡張設定', '装備コマンド非表示', function(args) { _isShowEquipCommand = false; }],
        ['ショップ拡張設定', '購入価格レート変更', VAR, VAR, function(args) { _buyRate = getExtendRate(args[1], args[2]); }],
        ['ショップ拡張設定', '売却価格レート変更', VAR, VAR, function(args) { _sellRate = getExtendRate(args[1], args[2]); }],
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
     * 価格レートの取得.
     * @method getExtendRate
     * @param {String} setType 設定方法
     * @param {Number} value 設定値
     * @return {Number} : レート補正後の値.
     */
    var getExtendRate = function(setType, value) {
        var result = 0;

        switch (setType) {
            case '定数':
                value = value.replace(/%$/gi, function() { return ''; }.bind(this));
                result = parseInt(value) / 100.0;
                break;
            case '変数':
                value = value.replace(/^#/gi, function() { return ''; }.bind(this));
                result = $gameVariables.value(parseInt(value)) / 100.0;
                break;
        }

        return result;
    };

    /**
     * レートパラメータからレートの値を取得.
     * @method parseShopPriceRate
     * @param {Object} rate : レート情報
     * @return {Number} : レート
     */
    var parseShopPriceRate = function(rate) {
        var varIndex = parseInt(rate.UseVar);
        if (varIndex > 0) {
            return $gameVariables.value(varIndex) / 100.0;
        }

        return parseInt(rate.Base) / 100.0;
    };

    /**
     * ショップ拡張用の変数の初期化処理.
     * @method InitializeExShopParams
     */
    var InitializeExShopParams = function() {
        _isShowEquipCommand = defaultShowEquipCommand;
        _vendOnly = false;
        _buyRate = INVALID_RATE;
        _sellRate = INVALID_RATE;

        _goods = null;
        _purchaseOnly = false;
    };

    //------------------------------------------------------------------------
    InitializeExShopParams();

    //------------------------------------------------------------------------
    /**
     * ショップのコマンドがデフォルト状態か判定.
     *
     * @method Window_ShopCommand.prototype.isDefaultCommand
     * @return {Boolean} : コマンドに関する設定拡張が何もなければ true.
     */
    Window_ShopCommand.prototype.isDefaultCommand = function() {
        return (!_vendOnly && !_isShowEquipCommand && !isDirectList);
    };

    var _Window_ShopCommand_prototype_maxCols = Window_ShopBuy.prototype.maxCols;
    Window_ShopCommand.prototype.maxCols = function() {
        if (this.isDefaultCommand()) {
            return _Window_ShopCommand_prototype_maxCols.call(this);
        }
        return this._list.length;
    };

    var _Window_ShopCommand_prototype_makeCommandList = Window_ShopBuy.prototype.makeCommandList;
    Window_ShopCommand.prototype.makeCommandList = function() {
        if (this.isDefaultCommand()) {
            _Window_ShopCommand_prototype_makeCommandList.call(this);
            return;
        }

        if (isDirectList && (this._purchaseOnly || _vendOnly)) {
            if (this._purchaseOnly) {
                this.addCommand(TextManager.buy, 'buy');
            } else if (_vendOnly) {
                this.addCommand(TextManager.sell, 'sell');
            }
        } else {
            if (this._purchaseOnly || _vendOnly) {
                if (this._purchaseOnly) {
                    this.addCommand(TextManager.buy, 'buy');
                } else if (_vendOnly) {
                    this.addCommand(TextManager.sell, 'sell');
                }
            } else {
                this.addCommand(TextManager.buy, 'buy', !_vendOnly);
                this.addCommand(TextManager.sell, 'sell', !this._purchaseOnly);
            }
            if (_isShowEquipCommand) {
                this.addCommand(TextManager.equip, 'equip', $gameParty.exists());
            }
            this.addCommand(TextManager.cancel, 'cancel');
        }
    };


    //------------------------------------------------------------------------
    var _Window_ShopBuy_prototype_price = Window_ShopBuy.prototype.price;
    Window_ShopBuy.prototype.price = function(item) {
        var priceBase = _Window_ShopBuy_prototype_price.call(this, item);
        return Math.floor(priceBase * _buyRate);
    };

    //------------------------------------------------------------------------
    /**
     * 売却価格を返す.
     * @method Window_ShopSell.prototype.price
     * @param {Any} item : アイテム, 武器, 防具
     * @return {Number} レート補正後の売却価格.
     */
    Window_ShopSell.prototype.price = function(item) {
        var priceBase = item.price;
        return Math.floor(priceBase * _sellRate);
    };

    var _Window_ShopSell_prototype_isEnabled = Window_ShopSell.prototype.isEnabled;
    Window_ShopSell.prototype.isEnabled = function(item) {
        var result = _Window_ShopSell_prototype_isEnabled.call(this, item);
        if (result && _vendOnly && this._itemFilterList) {
            return this._itemFilterList.contains(item);
        }
        return result;
    };

    /**
     * アイテムのフィルタリングの設定.
     * @method Window_ShopSell.prototype.setSellableFilter
     * @param {Array<Any>} shopGoods : ショップの商品リスト
     */
    Window_ShopSell.prototype.setFilter = function(shopGoods) {
        this._itemFilterList = null;

        // ひとつでも設定されているのであれば, フィルタリング有効化.
        if (_vendOnly && shopGoods && shopGoods.length > 0) {
            this._itemFilterList = [];

            shopGoods.forEach(function(goods) {
                var item = null;
                switch (goods[0]) {
                    case 0:
                        item = $dataItems[goods[1]];
                        break;
                    case 1:
                        item = $dataWeapons[goods[1]];
                        break;
                    case 2:
                        item = $dataArmors[goods[1]];
                        break;
                }
                if (item && !this._itemFilterList.contains(item)) {
                    this._itemFilterList.push(item);
                }
            }, this);
        }
    };

    var _Window_ShopSell_prototype_makeItemList = Window_ShopSell.prototype.makeItemList;
    Window_ShopSell.prototype.makeItemList = function() {
        _Window_ShopSell_prototype_makeItemList.call(this);

        // 売却可能なアイテムが上に来るようにソート.
        if (isSortForSellList) {
            var sortThis = this;
            var sortLast = this._data.slice(0);
            this._data.sort(function(a, b) {
                if (!a) {
                    return 1;
                }
                if (!b) {
                    return -1;
                }
                if (!sortThis.isEnabled(a) && sortThis.isEnabled(b)) {
                    return 1;
                }
                if (!sortThis.isEnabled(b) && sortThis.isEnabled(a)) {
                    return -1;
                }
                return sortLast.indexOf(a) - sortLast.indexOf(b)
            });
        }
    };

    //------------------------------------------------------------------------
    var _Scene_Shop_prototype_initialize = Scene_Shop.prototype.initialize;
    Scene_Shop.prototype.initialize = function() {
        // 保持してある商品リストがあれば再設定する.
        if (_goods !== null) {
            this.prepare(_goods, _purchaseOnly);
            _goods = null;
            this.fromEquipScene = true;
        }

        _Scene_Shop_prototype_initialize.call(this);
    };

    /**
     * ショップ拡張用のレートの変数の初期化処理.
     * @method Scene_Shop.prototype.InitializeExtendRate
     */
    Scene_Shop.prototype.InitializeExtendRate = function() {
        if (_buyRate === INVALID_RATE) {
            _buyRate = parseShopPriceRate(defaultBuyRate);
        }
        if (_sellRate === INVALID_RATE) {
            _sellRate = parseShopPriceRate(defaultSeelRate);
        }
    };

    var _Scene_Shop_prototype_popScene = Scene_Shop.prototype.popScene;
    Scene_Shop.prototype.popScene = function() {
        InitializeExShopParams();
        _Scene_Shop_prototype_popScene.call(this);
    };
    var _Scene_Shop_prototype_create = Scene_Shop.prototype.create;
    Scene_Shop.prototype.create = function() {
        this.InitializeExtendRate();
        _Scene_Shop_prototype_create.call(this);

        if (isDirectList && (this._purchaseOnly || _vendOnly)) {
            if (this._purchaseOnly) {
                this._commandWindow.selectSymbol('buy');
                this._commandWindow.deactivate();
                this.commandBuy();
            } else if (_vendOnly) {
                this._commandWindow.selectSymbol('sell');
                this._commandWindow.deactivate();
                this.commandSell();
            }
        } else if (this.fromEquipScene) {
            this._commandWindow.selectSymbol('equip');
        }
    }

    var _Scene_Shop_prototype_createCommandWindow = Scene_Shop.prototype.createCommandWindow;
    Scene_Shop.prototype.createCommandWindow = function() {
        _Scene_Shop_prototype_createCommandWindow.call(this);
        this._commandWindow.setHandler('equip', this.commandEquip.bind(this));
    };

    var _Scene_Shop_prototype_createSellWindow = Scene_Shop.prototype.createSellWindow;
    Scene_Shop.prototype.createSellWindow = function() {
        _Scene_Shop_prototype_createSellWindow.call(this);
        this._sellWindow.setFilter(this._goods);
    };

    /**
     * コマンド[装備] の処理.
     * @method Scene_Shop.prototype.commandEquip
     */
    Scene_Shop.prototype.commandEquip = function() {
        // 戻ってきたときに再設定するため保持しておく.
        _goods = this._goods;
        _purchaseOnly = this._purchaseOnly;

        SceneManager.push(Scene_Equip);
    };

    var _Scene_Shop_prototype_onBuyCancel = Scene_Shop.prototype.onBuyCancel;
    Scene_Shop.prototype.onBuyCancel = function() {
        if (isDirectList && this._purchaseOnly) {
            this.popScene();
        } else {
            _Scene_Shop_prototype_onBuyCancel.call(this);
        }
    };

    var _Scene_Shop_prototype_onCategoryCancel = Scene_Shop.prototype.onCategoryCancel;
    Scene_Shop.prototype.onCategoryCancel = function() {
        if (isDirectList && _vendOnly) {
            this.popScene();
        } else {
            _Scene_Shop_prototype_onCategoryCancel.call(this);
        }
    };
    Scene_Shop.prototype.sellingPrice = function() {
        return this._sellWindow.price(this._item);
    };
})();

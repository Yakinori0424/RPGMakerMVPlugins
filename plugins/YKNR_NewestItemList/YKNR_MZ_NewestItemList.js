//============================================================================
// YKNR_MZ_NewestItemList.js
// ---------------------------------------------------------------------------
// (c) 2025 焼きノリ
// License    : MIT License(http://opensource.org/licenses/mit-license.php)
// ---------------------------------------------------------------------------
// Version    : 1.0.0 (2025/05/05) 公開
// ---------------------------------------------------------------------------
// Twitter    : https://twitter.com/Noritake0424
// Github     : https://github.com/Yakinori0424/RPGMakerMVPlugins
//============================================================================

/*:
 * @===========================================================================
 * @plugindesc アイテム/武器/防具の入手順を記憶し、
 * アイテム画面に新規入手一覧として表示します。
 * @author 焼きノリ
 * @target MZ
 * @url https://github.com/Yakinori0424/RPGMakerMVPlugins/tree/master/plugins/YKNR_NewestItemList
 * @base YKNR_MZ_Core
 * @orderAfter YKNR_MZ_Core
 * @===========================================================================
 * 
 * @param newestCategoryLabel
 * @text 新規入手一覧の名称
 * @desc アイテム画面で表示する新規入手一覧の名称です。
 * @type string
 * @default New
 * 
 * @param newestCapacity
 * @text 新規入手履歴の最大数
 * @desc 新規入手したアイテムを記憶する最大数です。
 * @type number
 * @min 1
 * @default 30
 * 
 * @param isIncludeSaveData
 * @text セーブに含める
 * @desc データのセーブ時に新規入手履歴を保存するか設定します。
 * OFF にすると、ロードする度に入手履歴が初期化されます。
 * @type boolean
 * @on 含める
 * @off 含めない
 * @default true
 * 
 * 
 * @---------------------------------------------------------------------------
 * @command isIncludeNewestItem
 * @text 最近入手したアイテムか判定
 * @desc 新規入手履歴に含まれているかを判定し、
 * その結果をスイッチに反映します。
 * 
 * @arg itemId
 * @text アイテムID
 * @desc 
 * @type item
 * @default 0
 * 
 * @arg switchId
 * @text 結果を代入するスイッチ
 * @desc 「アイテムID」で指定したアイテムを最近入手していた場合、
 * このスイッチが ON になります。
 * @type switch
 * @default 0
 * 
 * @---------------------------------------------------------------------------
 * @command isIncludeNewestWeapon
 * @text 最近入手した武器か判定
 * @desc 新規入手履歴に含まれているかを判定し、
 * その結果をスイッチに反映します。
 * 
 * @arg itemId
 * @text 武器ID
 * @desc 
 * @type item
 * @default 0
 * 
 * @arg switchId
 * @text 結果を代入するスイッチ
 * @desc 「武器ID」で指定した武器を最近入手していた場合、
 * このスイッチが ON になります。
 * @type switch
 * @default 0
 * 
 * @---------------------------------------------------------------------------
 * @command isIncludeNewestArmor
 * @text 最近入手した防具か判定
 * @desc 新規入手履歴に含まれているかを判定し、
 * その結果をスイッチに反映します。
 * 
 * @arg itemId
 * @text 防具ID
 * @desc 
 * @type item
 * @default 0
 * 
 * @arg switchId
 * @text 結果を代入するスイッチ
 * @desc 「防具ID」で指定した防具を最近入手していた場合、
 * このスイッチが ON になります。
 * @type switch
 * @default 0
 * 
 * 
 * @===========================================================================
 * @help YKNR_MZ_NewestItemList.js (Version : 1.0.0)
 * ----------------------------------------------------------------------------
 * 【！注意！】
 * ※共通プラグイン「YKNR_MZ_Core.js」のバージョン(1.3.0)以降でのみ対応。
 * ----------------------------------------------------------------------------
 *【機能紹介】
 * アイテム画面で、所謂「最近入手したアイテム一覧」が表示できるようになります。
 * これにより、「さっき手に入れたアイテムをすぐ確認したい」ときに重宝します。
 * 
 * また、以下のプラグインコマンドを用意しています。
 * 実行結果でスイッチをON/OFFするので、イベントコマンドの条件式に利用できます。
 * 「古いポーションは嫌、新しいの頂戴！」なNPCを実現したいときなどにどうぞ。
 * ・「最近入手したアイテムか判定」
 * ・「最近入手した武器か判定」
 * ・「最近入手した防具か判定」
 * 
 * 
 * ----------------------------------------------------------------------------
 * 【実装仕様】
 * ・入手履歴にアイテムが追加されるとき、既に同じアイテムがあればそれを削除し、
 *   入手履歴の先頭に改めてアイテムを追加する。
 * ・入手履歴に追加されたとき、入手履歴の最大数を超えた場合は、
 *   最も古いアイテムを履歴から削除する。
 * ・アイテムを1個以上入手し、1個以上所持していれば、入手履歴へ追加します。
 * ・「アイテムを入手」とは、 $gameParty.gainItem 関数を通して
 *   アイテムを1個以上獲得することを指します。
 * ・例外として、装備の着脱を行ったときは入手履歴の更新は行いません。
 * ・パーティにアクターが追加されたとき、
 *   そのアクターが装備しているアイテムを入手履歴へ追加します。
 *   履歴へ追加しますが、パーティがアイテムを所持していなければ、
 *   アイテム画面の新規入手一覧には表示されません。
 * ----------------------------------------------------------------------------
*/


(function() {
    'use strict';

    // -----------------------------------------------------------------------
    const parameters = YKNR.Core.importCurrentPlugin();
    const pluginName = YKNR.Core.pluginName();
    //console.log(parameters);

    /** @type {string} */
    const newestCategoryLabel = parameters.newestCategoryLabel;
    /** @type {number} */
    const newestCapacity = parameters.newestCapacity;
    /** @type {boolean} */
    const isIncludeSaveData = parameters.isIncludeSaveData;

    const itemCategorySymbol = "newest";

    /** 例外で入手履歴の登録をブロックさせるフラグ */
    let isBlockEntryItemHistory = false;


    // =======================================================================

    //------------------------------------------------------------------------
    // common function

    /**
     * アイテムのカテゴリーIDを返す.
     * @param {rm.types.Item|rm.types.Weapon|rm.types.Armor} item 
     * @returns {number} アイテム:1, 武器:2, 防具:3
     */
    function itemCategoryId(item) {
        if (!item) {
            return 0;
        } else if (DataManager.isItem(item)) {
            return 1;
        } else if (DataManager.isWeapon(item)) {
            return 2;
        } else if (DataManager.isArmor(item)) {
            return 3;
        } else {
            return 0;
        }
    };

    /**
     * アイテムが同一のものか判定する.
     * @param {rm.types.Item|rm.types.Weapon|rm.types.Armor} a 
     * @param {rm.types.Item|rm.types.Weapon|rm.types.Armor} b 
     * @returns {boolean} 
     */
    function isEqualItem(a, b) {
        if (!a || !b) {
            return false;
        } else if (itemCategoryId(a) !== itemCategoryId(b)) {
            return false;
        } else if (a.id !== b.id) {
            return false;
        } else {
            return true;
        }
    };


    // -----------------------------------------------------------------------
    // plugin commands (MZ)
    (() => {
        'use strict';

        /**
         * @this {Game_Interpreter}
         * @param {YKNR.types.CommandParameters} params コマンドの引数
         */
        function isIncludeNewestItem(params) {
            const itemId = YKNR.UtilPluginCommand.getNumber(params, "itemId");
            const switchId = YKNR.UtilPluginCommand.getNumber(params, "switchId");
            const isInclude = $gameParty.isIncludeNewest($dataItems[itemId]);
            $gameSwitches.setValue(switchId, isInclude);
        };

        /**
         * @this {Game_Interpreter}
         * @param {YKNR.types.CommandParameters} params コマンドの引数
         */
        function isIncludeNewestWeapon(params) {
            const itemId = YKNR.UtilPluginCommand.getNumber(params, "itemId");
            const switchId = YKNR.UtilPluginCommand.getNumber(params, "switchId");
            const isInclude = $gameParty.isIncludeNewest($dataWeapons[itemId]);
            $gameSwitches.setValue(switchId, isInclude);
        };

        /**
         * @this {Game_Interpreter}
         * @param {YKNR.types.CommandParameters} params コマンドの引数
         */
        function isIncludeNewestArmor(params) {
            const itemId = YKNR.UtilPluginCommand.getNumber(params, "itemId");
            const switchId = YKNR.UtilPluginCommand.getNumber(params, "switchId");
            const isInclude = $gameParty.isIncludeNewest($dataArmors[itemId]);
            $gameSwitches.setValue(switchId, isInclude);
        };

        YKNR.Core.registerPluginCommands([
            { name: "isIncludeNewestItem", func: isIncludeNewestItem },
            { name: "isIncludeNewestWeapon", func: isIncludeNewestWeapon },
            { name: "isIncludeNewestArmor", func: isIncludeNewestArmor },
        ]);
    })();


    // -----------------------------------------------------------------------
    // Game_NewestItems

    /**
     * 直近で入手したアイテムの履歴を管理するクラス.
     */
    class Game_NewestItems {
        /**
         * 
         */
        constructor() {
            this.initialize();
        }

        /**
         * 初期化処理.
         */
        initialize() {
            this.clear();
        }

        /**
         * 履歴の初期化.
         */
        clear() {
            /** @type {Game_Item[]} */
            this._data = [];
        }

        /**
         * 履歴にアイテムを追加する.
         * @param {rm.types.Item|rm.types.Weapon|rm.types.Armor} item 
         */
        entry(item) {
            const index = this.index(item);
            if (index > -1) {
                this._data.splice(index, 1);
            }
            this._data.unshift(new Game_Item(item));
            if (this._data.length > newestCapacity) {
                this._data.pop();
            }
        }

        /**
         * 履歴のインデックスを返す.
         * @param {rm.types.Item|rm.types.Weapon|rm.types.Armor} item 
         * @returns {number} 
         */
        index(item) {
            return this._data.findIndex(gi => isEqualItem(gi.object(), item));
        }

        /**
         * 履歴のアイテムデータを返す.
         * @returns {rm.types.BaseItem[]} 
         */
        objects() {
            return this._data.map(item => item.object());
        }

        /**
         * 履歴をバックアップする.
         */
        backup() {
            // Game_Party に無理矢理代入する強行手段.
            $gameParty._backupNewestItems = this._data;
        }

        /**
         * バックアップした履歴を復元する.
         */
        restore() {
            this._data = $gameParty._backupNewestItems || [];
            delete $gameParty._backupNewestItems;
        }
    }

    window.Game_NewestItems = Game_NewestItems;


    // -----------------------------------------------------------------------
    // Game_Temp

    /**
     * 新規入手履歴を返す.
     * @returns {Game_NewestItems} 
     */
    Game_Temp.prototype.newestItems = function() {
        return this._newestItems ||= new Game_NewestItems();
    };


    // -----------------------------------------------------------------------
    // Game_System

    if (isIncludeSaveData) {
        YKNR.Core.redefine(Game_System.prototype, "onBeforeSave", function($) {
            return function() {
                $.call(this, ...arguments);
                $gameParty.backupNewestItems();
            };
        });

        YKNR.Core.redefine(Game_System.prototype, "onAfterLoad", function($) {
            return function() {
                $.call(this, ...arguments);
                $gameParty.restoreNewestItems();
            };
        });
    }


    // -----------------------------------------------------------------------
    // Game_Actor

    YKNR.Core.redefine(Game_Actor.prototype, "tradeItemWithParty", function($) {
        return function(newItem, oldItem) {
            // 装備の入れ替えでは入手履歴は更新しない.
            isBlockEntryItemHistory = true;
            const ret = $.call(this, ...arguments);
            isBlockEntryItemHistory = false;
            return ret;
        };
    });


    // -----------------------------------------------------------------------
    // Game_Party

    YKNR.Core.redefine(Game_Party.prototype, "initAllItems", function($) {
        return function() {
            $.call(this, ...arguments);
            this.initNewestItems();
        };
    });

    /**
     * 入手履歴を初期化する.
     */
    Game_Party.prototype.initNewestItems = function() {
        this.newestItems().clear();
    };

    /**
     * 新規入手履歴を返す.
     * @returns {Game_NewestItems} 
     */
    Game_Party.prototype.newestItems = function() {
        return $gameTemp.newestItems();
    };

    /**
     * 最近入手した全アイテムを取得する.
     * @returns {rm.types.BaseItem[]} 
     */
    Game_Party.prototype.newestAllItems = function() {
        return $gameTemp.newestItems().objects();
    };

    /**
     * 最近入手したアイテムか判定する.
     * @param {rm.types.BaseItem} item 
     * @returns {boolean} 
     */
    Game_Party.prototype.isIncludeNewest = function(item) {
        return $gameTemp.newestItems().index(item) > -1;
    };

    YKNR.Core.redefine(Game_Party.prototype, "gainItem", function($) {
        return function(item, amount, includeEquip) {
            $.call(this, ...arguments);
            // 1個以上入手したら, 新規入手履歴へ登録する.
            if (!isBlockEntryItemHistory) {
                if (amount > 0 && this.numItems(item) > 0) {
                    this.newestItems().entry(item);
                }
            }
        };
    });

    YKNR.Core.redefine(Game_Party.prototype, "addActor", function($) {
        return function(actorId) {
            const isAddable = !this._actors.includes(actorId);
            $.call(this, ...arguments);
            // パーティに加入できたら, 現在装備しているものを新規入手履歴へ登録する.
            if (isAddable && this._actors.includes(actorId)) {
                const actor = $gameActors.actor(actorId);
                const equips = actor.equips().reverse();
                equips.forEach(equip => this.newestItems().entry(equip));
            }
        };
    });

    /**
     * 新規入手履歴をセーブデータに含めるためのバックアップする.
     */
    Game_Party.prototype.backupNewestItems = function() {
        this.newestItems().backup();
    };

    /**
     * バックアップした新規入手履歴を復元する.
     */
    Game_Party.prototype.restoreNewestItems = function() {
        this.newestItems().restore();
    };


    // -----------------------------------------------------------------------
    // Window_ItemCategory

    YKNR.Core.redefine(Window_ItemCategory.prototype, "maxCols", function($) {
        return function() {
            return $.call(this, ...arguments) + 1;
        };
    });

    YKNR.Core.redefine(Window_ItemCategory.prototype, "makeCommandList", function($) {
        return function() {
            if (this.needsCommand(itemCategorySymbol)) {
                this.addCommand(newestCategoryLabel, itemCategorySymbol);
            }
            $.call(this, ...arguments);
        };
    });

    YKNR.Core.redefine(Window_ItemCategory.prototype, "needsCommand", function($) {
        return function(name) {
            return name.includes(itemCategorySymbol) || $.call(this, ...arguments);
        };
    });


    // -----------------------------------------------------------------------
    // Window_ItemList

    YKNR.Core.redefine(Window_ItemList.prototype, "includes", function($) {
        return function(item) {
            if (this._category === itemCategorySymbol) {
                return $gameParty.hasItem(item);
            }
            return $.call(this, ...arguments);
        };
    });

    YKNR.Core.redefine(Window_ItemList.prototype, "makeItemList", function($) {
        return function() {
            if (this._category === itemCategorySymbol) {
                this._data = $gameParty.newestAllItems().filter(item => this.includes(item));
            } else {
                $.call(this, ...arguments);
            }
        };
    });

    YKNR.Core.redefine(Window_ItemList.prototype, "needsNumber", function($) {
        return function() {
            if (this._category === itemCategorySymbol) {
                return !!this._needsNumberForNew;
            } else {
                return $.call(this, ...arguments);
            }
        };
    });

    YKNR.Core.redefine(Window_ItemList.prototype, "drawItemNumber", function($) {
        return function(item, x, y, width) {
            if (this._category === itemCategorySymbol) {
                if (DataManager.isItem(item) && item.itypeId === 2) {
                    this._needsNumberForNew = $dataSystem.optKeyItemsNumber;
                }
                else {
                    this._needsNumberForNew = true;
                }
            }
            $.call(this, ...arguments);
        };
    });


})();

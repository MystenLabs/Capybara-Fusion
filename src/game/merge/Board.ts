import { GameObjects, Scene } from 'phaser';
import { MergeItemType, MergeBoardType } from '../GameObjectTypes';
import { type Level, type ItemDataDictionary, type ItemData, CalculateRecipeId, type QuestData, type ItemID } from './Data';
import { Item } from './Item';
import type { QuestBox } from './QuestBox';
import { InventoryItem } from './InventoryItem';
import type { MainScene } from '../scenes/MainScene';
import { generateItem } from '../GenerateBlockchainData';
import { MergeTransition, MoveTransition } from './Animations';

export enum MergeResult {
    Invalid,
    EmptyTarget,
    Successful,
};

export class Board extends GameObjects.Container {

    grid: (Item | null)[][];
    
    boardWidth: number;
    boardHeight: number;
    boardMargin: number;
    xPad: number;
    yPad: number;
    itemSize: number;

    boardRows: number;
    boardColumns: number;

    questBox: QuestBox;

    level: Level;

    constructor(scene: Scene, level: Level, x: number, y: number, width: number, height: number, margin: number) {
        super(scene, x, y);
        
        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: true,
            useHandCursor: false,
        }

        this.setInteractive(hitArea);

        const items : ItemDataDictionary = scene.registry.get('items');

        this.boardRows = level.grid.length;
        this.boardColumns = level.grid[0].length;

        this.boardMargin = margin;
        this.boardWidth = width;
        this.boardHeight = height;

        const maxItemHeight = (height - ((this.boardRows + 1) * margin)) / this.boardRows;
        const maxItemWidth = (width - ((this.boardColumns + 1) * margin)) / this.boardColumns;
        this.itemSize = Math.min(maxItemHeight, maxItemWidth);

        this.xPad = this.boardWidth - ((this.itemSize * this.boardColumns) + (this.boardMargin * (this.boardColumns + 1)));
        this.xPad *= 0.5;

        this.yPad = this.boardHeight - ((this.itemSize * this.boardRows) + (this.boardMargin * (this.boardRows + 1)));
        this.yPad *= 0.5;

        this.grid = [];
        for (let y = 0; y < this.boardRows; y++) {
            let row : (Item | null)[] = [];
            this.grid.push(row);
            
            const itemY = this.yPad + ((y + 1) * margin) + (y * this.itemSize) + (this.itemSize * 0.5);
            for (let x = 0; x < this.boardColumns; x++) {
                const itemX = this.xPad + ((x + 1) * margin) + (x * this.itemSize) + (this.itemSize * 0.5);

                const itemID = level.grid[y][x];

                let item : (Item | null) = null;
                if (itemID !== null) {
                    const itemData = items[itemID];
                    item = new Item(scene, this, itemData, itemX, itemY, this.itemSize, this.itemSize, y, x);
                    this.add(item);
                }

                this.grid[y][x] = item;
            }
        }

        this.level = level;

        this.type = MergeBoardType;
    }

    closestGridPosition(item: Item | InventoryItem): number[] {
        let itemX = item.x;
        let itemY = item.y;

        if (item instanceof InventoryItem) {
            itemX = item.x - this.x;
            itemY = item.y - this.y;
        }

        const rowPosition = (itemY - this.yPad - (this.boardMargin * 0.5)) / (this.itemSize + this.boardMargin);
        const columnPosition = (itemX - this.xPad - (this.boardMargin * 0.5)) / (this.itemSize + this.boardMargin);

        const row = Math.min(Math.max(0, Math.floor(rowPosition)), this.boardRows - 1);
        const column = Math.min(Math.max(0, Math.floor(columnPosition)), this.boardColumns - 1);

        return [row, column];
    }

    updateItemPosition(item: Item) {
        const [row, column] = this.closestGridPosition(item);

        this.grid[item.row][item.column] = null;
        this.grid[row][column] = item;

        const closestX = this.xPad + ((column + 1) * this.boardMargin) + (column * this.itemSize) + (this.itemSize * 0.5);
        const closestY = this.yPad + ((row + 1) * this.boardMargin) + (row * this.itemSize) + (this.itemSize * 0.5);

        item.row = row;
        item.column = column;

        MoveTransition(item, closestX, closestY);
        
        item.startX = item.x;
        item.startY = item.y;
    }

    replaceItem(currentItem: Item, newItemData: ItemData) : Item {
        const row = currentItem.row;
        const column = currentItem.column;
        
        this.removeItem(currentItem, false);
        return this.addItem(newItemData, row, column);
    }

    addItem(data: ItemData, row: number, column: number) : Item {
        if (this.grid[row][column] !== null) {
            this.removeItem(this.grid[row][column]);
        }

        const itemX = this.xPad + ((column + 1) * this.boardMargin) + (column * this.itemSize) + (this.itemSize * 0.5);
        const itemY = this.yPad + ((row + 1) * this.boardMargin) + (row * this.itemSize) + (this.itemSize * 0.5);

        const newItem = new Item(this.scene, this, data, itemX, itemY, this.itemSize, this.itemSize, row, column);
        this.grid[row][column] = newItem;
        this.add(newItem);

        return newItem;
    }

    removeItem(item: Item, destroy: boolean = true) {
        this.grid[item.row][item.column] = null;

        if (destroy) {
            this.remove(item);
            item.destroy();
        }
    }

    attemptMerge(dragRow: number, dragColumn: number, targetRow: number, targetColumn: number): MergeResult {
        const dragged: Item | null = this.grid[dragRow][dragColumn];
        const target: Item | null = this.grid[targetRow][targetColumn];

        if (dragged == null || target == null) {
            console.log('EMPTY SLOT');
            return MergeResult.EmptyTarget;
        }

        console.log(`${dragged.name}(${dragged.id}) + ${target.name}(${target.id})`);

        const items : ItemDataDictionary = this.scene.registry.get('items');
        
        const recipe = this.questBox.quest.allowedRecipes[CalculateRecipeId(dragged.id, target.id)];

        if (recipe === undefined) {
            return MergeResult.Invalid;
        }

        const resultItem = items[recipe.resultItem];

        let spawned = this.replaceItem(target, resultItem);
        this.removeItem(dragged, false);

        MergeTransition(dragged, target, spawned);

        this.attemptUploadMajorItem(resultItem);
        
        return MergeResult.Successful;
    }

    attemptInventoryMerge(inventoryItem: InventoryItem, targetRow: number, targetColumn: number): MergeResult {
        const target: Item | null = this.grid[targetRow][targetColumn];

        if (target == null) {
            return MergeResult.EmptyTarget;
        }

        const items : ItemDataDictionary = this.scene.registry.get('items');
        
        const recipe = this.questBox.quest.allowedRecipes[CalculateRecipeId(inventoryItem.id, target.id)];

        if (recipe === undefined) {
            return MergeResult.Invalid;
        }

        const resultItem = items[recipe.resultItem];

        let dragged = new InventoryItem(
            inventoryItem.scene,
            inventoryItem.board,
            inventoryItem.x,
            inventoryItem.y,
            inventoryItem.itemWidth,
            inventoryItem.itemHeight
        );
        let spanwed = this.replaceItem(target, resultItem);

        MergeTransition(dragged, target, spanwed);

        this.attemptUploadMajorItem(resultItem);
        
        return MergeResult.Successful;
    }

    attemptUploadMajorItem(item: ItemData) {
        if (item.major === undefined || item.major === null) {
            return;
        }

        let blockchainItem = generateItem(
            item.name,
            'CapyHQ',
            'capyguy22',
            'MERGE'
        );
    
        (<MainScene>this.scene).eventMenuLayer.ledger.uploadItem(blockchainItem);
    }

    findItem(itemID: ItemID): Item | null {
        for (let y = 0; y < this.boardRows; y++) {
            for (let x = 0; x < this.boardColumns; x++) {
                const item = this.grid[y][x];

                if (item === null || item.id !== itemID) {
                    continue;
                }

                return item
            }
        }

        return null;
    }
}
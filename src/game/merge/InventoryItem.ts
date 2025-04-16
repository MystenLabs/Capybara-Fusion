import { GameObjects, Scene } from 'phaser';
import { MergeItemType, MergeBoardType, QuestBoxType } from '../GameObjectTypes';
import { CalculateRecipeId, type ItemData, type ItemDataDictionary } from './Data';
import { MergeResult, type Board } from './Board';
import { OnMerge } from '../DatabaseHooks';
import { ItemSpawnTransition, MoveTransition } from './Animations';

export class InventoryItem extends GameObjects.Container {
    id: number;
    itemData: ItemData;

    board: Board;

    sprite: GameObjects.Sprite;

    startX: number;
    startY: number;
    
    itemWidth: number;
    itemHeight: number;

    canDrag: boolean;

    glow: Phaser.FX.Glow;

    constructor(scene: Scene, board: Board, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.addToUpdateList();

        this.startX = x;
        this.startY = y;

        this.itemWidth = width;
        this.itemHeight = height;

        this.board = board;

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.itemWidth * 0.5, -this.itemHeight * 0.5, this.itemWidth, this.itemHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true,
            dropZone: false,
            useHandCursor: true,
        }

        this.setInteractive(hitArea);

        this.updateItem(false);

        this.on('drag', this.drag);
        this.on('dragend', this.dragEnd);
        this.on('drop', this.drop);

        this.type = MergeItemType;
    }

    drag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        if (!this.canDrag) {
            return;
        }

        this.x = dragX;
        this.y = dragY;
    }

    dragEnd(pointer: Phaser.Input.Pointer, x: number, y: number, dropped: boolean) {
        if (!this.canDrag || !dropped) {
            this.x = this.startX;
            this.y = this.startY;
        }
    }

    drop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) {
        if (!this.canDrag) {
            return;
        }

        if (target.type === MergeBoardType) {
            const [row, column] = this.board.closestGridPosition(this);

            const result = this.board.attemptInventoryMerge(this, row, column);
            
            if (result == MergeResult.Successful) {
                this.dequeueItem();
                this.updateItem(true);
                return;
            }
            else if (result == MergeResult.EmptyTarget) {
                let item = this.board.addItem(this.itemData, row, column);
                let targetX = item.x;
                let targetY = item.y;

                item.x = this.x - item.board.x;
                item.y = this.y - item.board.y;
                MoveTransition(item, targetX, targetY);

                this.dequeueItem();
                this.updateItem(true);
                return;
            }
        }
        else if (target.type === QuestBoxType) {
            this.board.questBox.donateItem(this.id, () => {
                this.dequeueItem();
                this.updateItem(true);
            });
        }
        
        MoveTransition(this, this.startX, this.startY);
    }

    dequeueItem() {
        let inventory: ItemData[] = this.scene.game.registry.get('inventory');
        inventory = inventory.slice(1);
        this.scene.game.registry.set('inventory', inventory);
    }

    updateItem(transition: boolean) {
        this.x = this.startX;
        this.y = this.startY;

        let inventory: ItemData[] = this.scene.game.registry.get('inventory');

        this.remove(this.sprite, true);
        this.canDrag = false;

        if (inventory.length < 1) {
            return;
        }

        const item = inventory[0];

        this.name = item.name;
        this.id = item.id;
        this.itemData = item;

        this.sprite = new GameObjects.Sprite(this.scene, 0, 0, item.icon);
        this.sprite.setDisplaySize(this.itemWidth, this.itemHeight);
        this.add(this.sprite);

        this.canDrag = true;

        if (transition) {
            ItemSpawnTransition(this, 0);
        }
    }

    preUpdate(time: number, delta: number) {
    }
}
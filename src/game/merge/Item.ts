import { GameObjects, Scene } from 'phaser';
import { MergeItemType, MergeBoardType, QuestBoxType } from '../GameObjectTypes';
import { CalculateRecipeId, type ItemData, type ItemDataDictionary } from './Data';
import { MergeResult, type Board } from './Board';
import { OnMerge } from '../DatabaseHooks';
import { ItemGlow, MoveTransition } from './Animations';
import type { MainScene } from '../scenes/MainScene';
import { stringHash } from '$lib/utils/Hashes';

export class Item extends GameObjects.Container {
    id: number;

    board: Board;
    row: number;
    column: number;

    sprite: GameObjects.Sprite;

    startX: number;
    startY: number;
    
    itemWidth: number;
    itemHeight: number;

    telescopeID: number;

    glow: Phaser.FX.Glow | null | undefined;

    constructor(scene: Scene, board: Board, data: ItemData, x: number, y: number, width: number, height: number, row: number, column: number) {
        super(scene, x, y);
        this.addToUpdateList();

        this.startX = x;
        this.startY = y;

        this.itemWidth = width;
        this.itemHeight = height;

        this.name = data.name;
        this.id = data.id;

        this.board = board;
        this.row = row;
        this.column = column;

        this.sprite = new GameObjects.Sprite(scene, 0, 0, data.icon);
        this.sprite.setDisplaySize(width, height);
        this.add(this.sprite);

        this.enableDragAndDrop();

        this.on('drag', this.drag);
        this.on('dragend', this.dragEnd);
        this.on('drop', this.drop);

        this.type = MergeItemType;

        this.telescopeID = stringHash('high_tech_telescope');
    }

    enableDragAndDrop() {
        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.itemWidth * 0.5, -this.itemHeight * 0.5, this.itemWidth, this.itemHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true,
            dropZone: false,
            useHandCursor: true,
        }

        this.setInteractive(hitArea);
    }

    drag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        this.x = dragX;
        this.y = dragY;
    }

    dragEnd(pointer: Phaser.Input.Pointer, x: number, y: number, dropped: boolean) {
        if (!dropped) {
            this.x = this.startX;
            this.y = this.startY;
        }
    }

    drop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) {
        if (target.type === MergeBoardType) {
            const [row, column] = this.board.closestGridPosition(this);
            if ((row != this.row) || (column != this.column)) {
                const result = this.board.attemptMerge(this.row, this.column, row, column)
                
                if (result == MergeResult.Successful) {
                    return;
                }
                else if (result == MergeResult.EmptyTarget) {
                    this.board.updateItemPosition(this);
                    return;
                }
            }
        }
        else if (target.type === QuestBoxType) {
            this.board.questBox.donateItem(this.id, () => this.board.removeItem(this));
        }
        
        MoveTransition(this, this.startX, this.startY);
    }

    preUpdate(time: number, delta: number) {
        this.updateGlow();
    }

    updateGlow() {
        let mainScene = <MainScene>this.scene;
        if (this.glow !== undefined && this.glow !== null) {
            if (this.id !== this.telescopeID && !mainScene.mergeModalLayer.questBox.isQuestItem(this.id)) {
                this.sprite.postFX.remove(this.glow);
                this.glow = null;
            }
        }
        else if (this.id === this.telescopeID || mainScene.mergeModalLayer.questBox.isQuestItem(this.id)) {
            ItemGlow(this);
        }
    }
}
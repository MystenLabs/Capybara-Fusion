import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { LedgerItem } from './LedgerItem';
import type { Toolbar } from '../ui/Toolbar';
import { generateCapy, generateItem, type BlockchainCapy, type BlockchainItem } from '../GenerateBlockchainData';
import { TextButton } from '../ui/TextButton';
import type { ItemDataDictionary, RecipeLookup } from '../merge/Data';
import { stringHash } from '$lib/utils/Hashes';

export class Ledger extends GameObjects.Container {
    backdrop: GameObjects.NineSlice;
    mover: GameObjects.Container;
    
    ledgerWidth: number;
    ledgerHeight: number;

    yMin: number;
    yMax: number;

    dragging: boolean;
    velocity: Phaser.Math.Vector2;
    drag: number;

    initialX: number;
    initialY: number;
    pointerX: number;
    pointerY: number;

    blurFX: Phaser.FX.Blur;
    focused: boolean;
    uploading: boolean;

    ledgerItems: any[];
    
    queue: (BlockchainItem | BlockchainCapy)[];

    constructor(scene: Scene) {
        let x = scene.game.canvas.width * 0.5;
        let y = scene.game.canvas.height + scene.game.canvas.height * 0.1;

        super(scene, x, y);
        this.addToUpdateList();

        let gameWidth = scene.game.canvas.width;
        let gameHeight = scene.game.canvas.height;

        this.ledgerWidth = gameWidth * 0.9;
        this.ledgerHeight = gameHeight;

        this.backdrop = createBackdrop(scene, 0, 0, this.ledgerWidth, this.ledgerHeight);
        this.add(this.backdrop);

        this.mover = new GameObjects.Container(scene, 0, 0);
        this.add(this.mover);

        /*
        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.ledgerWidth * 0.5, -this.ledgerHeight * 0.5, this.ledgerWidth, this.ledgerHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: false,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);
        this.on('pointermove', this.pointerMove);
        this.on('pointerup', this.pointerUp);
        */

        this.yMin = 0;
        this.yMax = 0;

        this.drag = 5;
        this.dragging = false;
        this.velocity = new Phaser.Math.Vector2(0, 0);

        this.uploading = false;

        this.ledgerItems = scene.registry.get('ledger') || [];

        this.queue = [];

        this.updateItems();
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.dragging = true;
        this.velocity = new Phaser.Math.Vector2(0, 0);

        this.initialX = this.mover.x;
        this.initialY = this.mover.y;

        this.pointerX = x;
        this.pointerY = y;
    }

    pointerMove(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if (!this.dragging) {
            return;
        }

        this.mover.y = Phaser.Math.Clamp(this.initialY + (y - this.pointerY), this.yMin, this.yMax);
        this.velocity = new Phaser.Math.Vector2(pointer.velocity.scale(10)); // 10x the velocity feels the nicest, couldn't tell you why.
    }

    pointerUp(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.dragging = false;
    }

    uploadItem(item: BlockchainItem, updateLedger: boolean = true) {
        if (this.uploading) {
            this.queue.push(item);
            return;
        }
        this.uploading = true;

        const addItem = ((id: string) => {
            item.chainID = id;
            this.ledgerItems.push(item);
            this.updateItems();
            this.finish();
        }).bind(this);

        fetch('https://capy-dev.anomalygames.xyz/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: item.itemType,
                fromUser: item.fromUser,
                toUser: item.toUser
            }),
        }).then(async response => {
            let r = await response.json();
            console.log(r);

            if (updateLedger && r['status'] == 'success') {
                addItem(r['digest']);
            }
        });
    }

    uploadCapy(capy: BlockchainCapy, updateLedger: boolean = true) {
        if (this.uploading) {
            this.queue.push(capy);
            return;
        }
        this.uploading = true;
        
        const addItem = ((id: string) => {
            capy.chainID = id;
            this.ledgerItems.push(capy);
            this.updateItems();
            this.finish();
        }).bind(this);

        fetch('https://capy-dev.anomalygames.xyz/capy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(capy),
        }).then(async response => {
            let r = await response.json();
            console.log(r);

            if (updateLedger && r['status'] == 'success') {
                addItem(r['digest']);
            }
        });
    }

    addToLedger(item: BlockchainCapy | BlockchainItem) {
        this.ledgerItems.push(item);
        this.ledgerItems = this.ledgerItems.slice(Math.min(this.ledgerItems.length - 20, 0));
    }

    addItem(username: string, description: string, ledgetItemType: string, chainID: string | null) {
        const itemWidth = this.ledgerWidth * 0.75;
        const itemY = this.mover.list.length * 75 + (this.ledgerWidth * 0.15) - this.ledgerHeight * 0.5;

        const itemAdded = new LedgerItem(this.scene, 0, itemY, itemWidth, 60, '16px', username, description, ledgetItemType, chainID);
        
        if (itemAdded.input) {
            itemAdded.input.enabled = this.input?.enabled || false;
        }

        this.mover.add(itemAdded);
    }

    // TODO: Update items instead of remaking the entire list view from scratch
    updateItems() {
        this.mover.removeAll(true);

        const items : ItemDataDictionary = this.scene.registry.get('items');
        const recipeLookup : RecipeLookup = this.scene.registry.get('recipe_lookup');

        for (let i = this.ledgerItems.length - 1; i >= 0; i--) {
            const ledgerItem = this.ledgerItems[i];

            if (ledgerItem.type == 'item') {
                const ledgerGameItem = <BlockchainItem>ledgerItem;
                const ledgerGameItemID = stringHash(ledgerGameItem.itemType);
                const item = items[ledgerGameItemID];
                const itemName = item.displayName.toUpperCase();

                if (ledgerGameItem.itemEventType == 'MERGE') {
                    const recipe = recipeLookup[ledgerGameItemID];
                    const draggedItem = items[recipe.draggedItem];
                    const targetItem = items[recipe.targetItem];

                    const message = draggedItem.id === targetItem.id ? `2X ${draggedItem.displayName.toUpperCase()}` : `${draggedItem.displayName.toUpperCase()} + ${targetItem.displayName.toUpperCase()}`;

                    this.addItem(ledgerGameItem.toUser, message + ` TO ${itemName}`, 'MERGED', ledgerGameItem.chainID || null);
                }
                else if (ledgerGameItem.itemEventType == 'PICK') {
                    this.addItem(ledgerGameItem.toUser, itemName, 'PICKED', ledgerGameItem.chainID || null);
                }
                else if (ledgerGameItem.itemEventType == 'DONATE') {
                    this.addItem(ledgerGameItem.fromUser == 0 ? "UNKNOWN" : ledgerGameItem.fromUser.toString(), itemName, 'DONATED', ledgerGameItem.chainID || null);
                }
            }
            else if (ledgerItem.type == 'capy') {
                const capy = <BlockchainCapy>ledgerItem;
                this.addItem(capy.toUser, `CAPY "${capy.name.toUpperCase()}"`, 'VISITED', capy.chainID || null);
            }
        }
    }

    finish() {
        this.uploading = false;
        if(this.queue.length > 0) {
            const nextItem = this.queue[0];
            this.queue = this.queue.slice(1);

            if (nextItem.type == 'item') {
                this.scene.time.delayedCall(1000, this.uploadItem, [nextItem], this);
            }
            else {
                this.scene.time.delayedCall(1000, this.uploadCapy, [nextItem], this);
            }
            
            return;
        }
    }

    preUpdate(time: number, delta: number) {
        const dt = delta / 1000;

        /*
        if (!this.dragging) {
            this.velocity.subtract(new Phaser.Math.Vector2(
                this.velocity.x * this.drag * dt,
                this.velocity.y * this.drag * dt
            ));
    
            this.mover.x = Phaser.Math.Clamp(this.mover.x + this.velocity.x * dt, this.xMin, this.xMax);
            this.mover.y = Phaser.Math.Clamp(this.mover.y + this.velocity.y * dt, this.yMin, this.yMax);
        }
        */
    }

    close() {
        this.scene.registry.set('ledger', this.ledgerItems || []);
    }
}
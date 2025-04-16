
import { GameObjects } from 'phaser';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { stringHash } from "$lib/utils/Hashes";
import { Board } from './Board';
import type { CardDataDictionary } from '../shop/Data';
import { CardSet } from '../shop/CardSet';
import type { ItemData, ItemDataDictionary, ItemID, Level, QuestID, QuestDataDictionary } from './Data';
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import { QuestBox } from './QuestBox';
import type { Item } from './Item';
import { createSquircle } from '../ui/Squircle';
import { InventoryItem } from './InventoryItem';

export class MergeModal extends GameLayer {
    backdrop: GameObjects.NineSlice;
    board: Board;
    questBox: QuestBox;
    inventoryItem: InventoryItem;
    capy: GameObjects.Sprite;
    quests: QuestDataDictionary;

    constructor(scene: MainScene, shown: boolean) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, shown);

        const levels : Record<string, Level> = scene.registry.get('levels');

        this.board = new Board(scene, levels['mvp_level'], 0, gameHeight * 0.225, gameWidth, gameHeight * 0.55, 5);

        let backdropWidth = this.board.boardWidth - (this.board.xPad * 2);
        let backdropHeight = this.board.boardHeight - (this.board.yPad * 2);

        let padding = Math.min(backdropWidth, backdropHeight) * 0.15;

        backdropWidth += padding;
        backdropHeight += padding;

        this.backdrop = createBackdrop(scene, gameWidth * 0.5, gameHeight * 0.5, backdropWidth, backdropHeight);

        const questBoxRatio = 0.55;
        const offsetRatio = (1 - questBoxRatio) * 0.5;
        let questBoxWidth = backdropWidth * questBoxRatio;
        let questBoxX =  gameWidth * 0.5 - (backdropWidth * offsetRatio);

        let questBoxHeight = questBoxWidth * 0.6;
        let questBoxY = (gameHeight * 0.5) - (backdropHeight * 0.5) - (questBoxHeight * 0.5);
        questBoxY -= questBoxHeight * 0.1;

        this.questBox = new QuestBox(scene, this, questBoxX, questBoxY, questBoxWidth, questBoxHeight, 16, "We will need some \nresources to repair it!");

        const capyRatio = 0.45;
        const capyTargetWidth = 0.25 * backdropWidth;
        let capySize = capyTargetWidth / capyRatio;
        let remainingSpace = (1 - questBoxRatio) * backdropWidth;
        
        let capyX = questBoxX + (questBoxWidth * 0.5) + (remainingSpace * 0.5);
        let capyY = (gameHeight * 0.5) - (backdropHeight * 0.5) - (capySize * 0.1666);
        
        this.capy = new GameObjects.Sprite(scene, capyX, capyY, 'base_capy_cropped');
        this.capy.setDisplaySize(capySize, capySize);

        this.add(this.capy);
        this.add(this.backdrop);
        this.add(this.questBox);
        this.add(this.board);

        let inventoryPosition = scene.toolBar.getPlayButtonPosition();

        this.add(createSquircle(scene, inventoryPosition.x, inventoryPosition.y, scene.toolBar.iconSize, scene.toolBar.iconSize, 0xDDE6E5, 1));

        this.inventoryItem = new InventoryItem(scene, this.board, inventoryPosition.x, inventoryPosition.y, this.board.itemSize, this.board.itemSize);
        this.add(this.inventoryItem);

        /*
        const items : ItemDataDictionary = this.scene.game.registry.get('items');
        let inventory: ItemData[] = this.scene.game.registry.get('inventory');
        inventory.push(items[stringHash('wood_plank')])
        inventory.push(items[stringHash('wood_plank')])
        inventory.push(items[stringHash('wood_plank')])
        inventory.push(items[stringHash('wood_plank')])
        this.scene.game.registry.set('inventory', inventory);
        */

        this.board.questBox = this.questBox;

        /*
        const cards: CardDataDictionary = scene.registry.get('cards');

        const card1 = stringHash('debug_card_1');
        const card2 = stringHash('debug_card_2');
        const card3 = stringHash('debug_card_3');
        const cardSet: CardSet = new CardSet(scene, 0, gameWidth, 0, gameWidth, 200, 140, 190, [cards[card1], cards[card2], cards[card3]]);
        this.add(cardSet);

        scene.input.keyboard?.on('keydown-S', () => cardSet.shuffleSet(), this);
        */

        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => scene.hideMergeModal()));
        
        this.quests = this.scene.registry.get('quests');
        this.loadQuest(stringHash('windmill_restoration'));
    }
    
    loadQuest(quest: QuestID) {
        //TODO this seems like an awful way to do this but I'm too tired to think of a better way at this point [MJ]
        if(quest === -1) return;
        this.questBox.loadQuest(this.quests[quest], (id) => this.loadQuest(id));
    }

    findItem(itemID: ItemID) : Item | null {
        return this.board.findItem(itemID);
    }

    show(duration: number): void {
        super.show(duration);
        this.inventoryItem.updateItem(true);
    }
}



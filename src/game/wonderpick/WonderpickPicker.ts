import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { TextButton } from '../ui/TextButton';
import {CardSet} from "../shop/CardSet";
import {stringHash} from "$lib/utils/Hashes";
import type {CardData, CardDataDictionary} from "../shop/Data";
import {BoxedItem} from "../ui/BoxedItem";
import type {ItemData, ItemDataDictionary} from "../merge/Data";
import type { MainScene } from '../scenes/MainScene';
import { generateItem } from '../GenerateBlockchainData';

export class WonderpickPicker extends GameObjects.Container {
    backdrop: GameObjects.NineSlice;
    mover: GameObjects.Container;

    uiWidth: number;
    uiHeight: number;
    gameWidth: number;
    gameHeight: number;

    itemTextLeft: GameObjects.Text;
    itemLeftCount: number;
    itemLeftTotal: number;
    itemTextRight: GameObjects.Text;
    itemRightCount: number;
    itemRightTotal: number;
    cardSet: CardSet;

    userName: string;

    constructor(scene: Scene, userName: string) {
        let x = scene.game.canvas.width * 0.5;
        let y = scene.game.canvas.height * 0.325;

        super(scene, x, y);
        this.addToUpdateList();

        let gameWidth = scene.game.canvas.width;
        let gameHeight = scene.game.canvas.height;
        
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.uiWidth = gameWidth * 0.9;
        this.uiHeight = gameHeight * 0.45;

        this.backdrop = createBackdrop(scene, 0, 0, this.uiWidth, this.uiHeight);
        this.add(this.backdrop);

        this.mover = new GameObjects.Container(scene, 0, 0);
        this.add(this.mover);

        //TODO actually have multiple festivals [MJ]
        let text = new GameObjects.Text(scene, 0, -gameHeight * 0.15, `A gift from ${userName}!`, { fontSize: '40px', fontFamily: "Quantico", color: "#000" });
        text.setOrigin(0.5);
        this.add(text);
        this.itemLeftCount = 23;
        this.itemLeftTotal = 24;
        this.itemRightCount = 40;
        this.itemRightTotal = 40;

        let card1:CardData = {
            id: stringHash("pick1"),
            name: "pick1",
            displayName: "",
            front: 'high_tech_telescope_item',
            back: 'box_item_banner'
        };

        let card2:CardData = {
            id: stringHash("pick2"),
            name: "pick1",
            displayName: "",
            front: 'tree_fruiting_item',
            back: 'box_item_banner'
        };

        let card3:CardData = {
            id: stringHash("pick3"),
            name: "pick1",
            displayName: "",
            front: 'sail_boat_item',
            back: 'box_item_banner'
        };
        this.cardSet = new CardSet(scene, -gameWidth * 0.5, -gameHeight * 0.08, 0, gameWidth, 200, 158, 190, [card1, card2, card3], (data) => this.flipCorrectCard(data));
        this.add(this.cardSet);

        this.add(new TextButton(scene, "PICK for ↯5", "30px", 0, gameHeight * 0.15, gameWidth * 0.6, () => this.shuffleCardSet()));

        this.userName = userName;
    }
    
    resetCards(items: ItemData[], userName: string) {
        this.remove(this.cardSet);
        this.cardSet.destroy();

        let card1: CardData = {
            id: stringHash("pick1"),
            name: "pick1",
            displayName: "",
            front: items[0].icon,
            back: 'box_item_banner'
        };

        let card2: CardData = {
            id: stringHash("pick2"),
            name: "pick1",
            displayName: "",
            front: items[1].icon,
            back: 'box_item_banner'
        };
        
        let card3: CardData = {
            id: stringHash("pick3"),
            name: "pick1",
            displayName: "",
            front: items[2].icon,
            back: 'box_item_banner'
        };

        this.cardSet = new CardSet(this.scene, -this.gameWidth * 0.5, -this.gameHeight * 0.08, 0, this.gameWidth, 200, 158, 190, [card1, card2, card3], (data) => this.flipCorrectCard(data));
        this.add(this.cardSet);

        this.userName = userName;
    }
    
    flipCorrectCard(data: CardData) {
        if (this.cardSet.shuffling) {
            return;
        }

        //TODO temp hack [MJ]
        this.cardSet.flipCard(stringHash("pick1"));

        let inventory : ItemData[] = this.scene.game.registry.get('inventory');
        let item = this.itemForIconName('high_tech_telescope_item');
        inventory.splice(0, 0, item);
        this.scene.game.registry.set('inventory', inventory);

        if (item.major) {
            (<MainScene>this.scene).eventMenuLayer.ledger.uploadItem(generateItem(item.name, this.userName, 'capyguy22', 'PICK'), true);
        }
    }

    itemForIconName(iconName: string) {
        //TODO make global? Seems useful [MJ]

        const items: ItemDataDictionary = this.scene.game.registry.get('items');
        const itemsList = Object.values(items);
        let itemName = '';
        for (let item of itemsList) {
            if(item.icon === iconName){
                itemName = item.name;
                break;
            } 
        }
        const desiredItem = items[stringHash(itemName)];
        return desiredItem === null ? Object.values(items)[0] : desiredItem;
    }
    
    shuffleCardSet() {
        if (this.cardSet.picking) {
            return;
        }

        this.cardSet.shuffleSet();
    }
}
import { GameObjects, Scene } from 'phaser';
import { MergeItemType, QuestBoxType } from '../GameObjectTypes';
import {
    type Level,
    type ItemDataDictionary,
    type ItemData,
    CalculateRecipeId,
    type QuestData,
    type ItemID,
    type QuestID
} from './Data';
import { createSquircle } from '../ui/Squircle';
import { ItemRequirement } from './ItemRequirement';
import { SpriteFocusModal } from '../ui/SpriteFocusModal';
import type { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import { stringHash } from '$lib/utils/Hashes';

export class QuestBox extends GameObjects.Container {
    gameLayer: GameLayer;

    boxWidth: number;
    boxHeight: number;
    boxMargin: number;

    squircle: GameObjects.NineSlice;
    flavorText: GameObjects.Text;

    requirements: GameObjects.Container;

    donated: Record<string, number>;

    quest: QuestData;
    
    scene: MainScene;
    
    onCompleted: (nextQuest: QuestID)=> void;

    constructor(scene: Scene, layer: GameLayer, x: number, y: number, width: number, height: number, margin: number, flavorText: string) {
        super(scene, x, y);

        this.gameLayer = layer;
        
        this.scene = scene as MainScene;
        
        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: true,
            useHandCursor: false,
        }

        this.donated = {};

        this.setInteractive(hitArea);

        this.squircle = createSquircle(scene, 0, 0, width, height, 0xDDE6E5, 1);
        this.add(this.squircle);

        this.boxMargin = margin;
        this.boxWidth = width;
        this.boxHeight = height;

        const left = -this.boxWidth * 0.5 + margin;
        const top = -this.boxHeight * 0.5 + margin;
        const fixedWidth = this.boxWidth - (margin * 2);

        this.flavorText = new GameObjects.Text(scene, left, top, flavorText, { fontSize: "20px", fontFamily: "Quantico", color: "#000", fixedWidth: fixedWidth, maxLines: 2 });
        this.flavorText.setOrigin(0, 0);
        this.add(this.flavorText);

        this.type = QuestBoxType;
    }

    loadQuest(quest: QuestData, onCompleted: (nextQuest: QuestID) => void) {
        this.quest = quest;
        
        if (this.requirements !== undefined) {
            this.requirements.destroy();
        }

        this.requirements = new GameObjects.Container(this.scene, 0, (this.boxHeight * 0.5) - (this.boxHeight * 0.3));
        this.add(this.requirements);

        let requirementCount = 0;

        for (const requirement in quest.requirements) {
            requirementCount++;
            this.donated[requirement] = 0;
        }
        
        let itemWidth = (this.boxWidth - this.boxMargin) / Math.max(requirementCount, 2);

        let spacing = (this.boxWidth - this.boxMargin) / (requirementCount * 2);
        let x = (-this.boxWidth * 0.5) + (this.boxMargin * 0.5) + spacing;
        for (const requirement in quest.requirements) {
            this.requirements.add(
                new ItemRequirement(this.scene, x, 0, itemWidth, this.boxHeight * 0.6, this.quest, Number.parseInt(requirement))
            );

            x += spacing * 2;
        }

        let scene = <MainScene>this.scene;
        scene.mapLayer.locations[this.quest.upgradeLocation].markAsCurrent();
        
        this.onCompleted = onCompleted;
    }

    isQuestItem(itemID: ItemID) {
        if (this.quest === undefined) {
            return false;
        }

        let count = this.quest.requirements[itemID];
        return count !== undefined && count > 0;
    }

    donateItem(itemID: ItemID, callback: () => void) {
        if (!this.isQuestItem(itemID)) {
            return;
        }

        const items : ItemDataDictionary = this.scene.registry.get('items');
        const item = items[itemID];

        let spriteWidth = this.scene.game.canvas.width * 0.6;
        new SpriteFocusModal(<MainScene>this.scene, this.gameLayer, item.icon, spriteWidth, 'DONATE', () => this.finishDonation(itemID, callback));
    }

    finishDonation(itemID: ItemID, callback: () => void) {
        this.donated[itemID.toString()]++;

        for (const child of this.requirements.list) {
            const requirement = <ItemRequirement>child;
            if (requirement.itemID == itemID) {
                requirement.updateCount(this.donated[itemID.toString()]);
            }
        }

        callback();
        this.checkQuestStatus();
    }

    checkQuestStatus() {
        if (this.quest === undefined) {
            return;
        }

        for (const itemID in this.quest.requirements) {
            if (this.donated[itemID] < this.quest.requirements[Number.parseInt(itemID)]) {
                return;
            }
        }

        console.log('huh?');

        const fanfareHeight = this.scene.game.canvas.height;
        var fanfare = new GameObjects.Video(this.scene, this.scene.game.canvas.width * 0.5, fanfareHeight * 0.5, 'fanfare');
        fanfare.setPlaybackRate(1.5);
        fanfare.play();
        fanfare.scale = fanfareHeight / 1280;
        fanfare.alpha = 0;

        let scene = <MainScene>this.scene;

        scene.mergeModalLayer.add(fanfare);

        let postFanFare = () => {
            const upgradeLocation = scene.mapLayer.locations[this.quest.upgradeLocation];
            upgradeLocation.markForUpgrading();
            
            if(this.onCompleted === null || this.onCompleted === undefined) {
                return;
            }

            const nextQuestID = this.quest.nextQuest == null ? -1 : this.quest.nextQuest;
            this.onCompleted(nextQuestID);
            scene.hideMergeModal();
        };
        
        this.scene.tweens.add({
            targets: fanfare,
            props: {
                alpha: 1,
            },
            duration: 333,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                scene.tweens.add({
                    targets: fanfare,
                    props: {
                        alpha: 0,
                    },
                    duration: 333,
                    delay: 4000,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        fanfare.destroy();
                        postFanFare();
                    }
                });
            }
        });
    }
}
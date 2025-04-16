
import { GameObjects, Scene } from 'phaser';
import {GameLayer} from "../GameLayer";
import type {MainScene} from "../scenes/MainScene";
import {createBackdrop} from "../ui/Backdrop";
import {TextButton} from "../ui/TextButton";
import {IconButton} from "../ui/IconButton";
import type {CapyStat} from "../GenerateBlockchainData";

//TODO probably try to kill this for IconButton [MJ]
export class CapyAssignmentModal extends GameLayer {
    backdrop: GameObjects.NineSlice;
    spawningLayer: GameLayer;
    capySprite: GameObjects.Sprite;
    itemOneSprite: string;
    itemTwoSprite: string;
    capyName: string;
    capyStatOne: CapyStat;
    capyStatTwo: CapyStat;

    callback: () => void;
    cleanupCallback?: () => void;

    spriteWidth: number;
    spriteHeight: number;

    constructor(
        scene: MainScene,
        spawningLayer: GameLayer, 
        capySprite: string, 
        itemOneSprite: string,
        itemTwoSprite: string,
        capyName: string,
        capyStatOne: CapyStat,
        capyStatTwo: CapyStat,
        buttonText: string, 
        onClick: () => void, 
        onBackCallback?: ()=>void
    ) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, false);

        this.callback = onClick;
        this.cleanupCallback = onBackCallback;
        this.itemOneSprite = itemOneSprite;
        this.itemTwoSprite = itemTwoSprite;
        this.capyName = capyName;
        this.capyStatOne = capyStatOne;
        this.capyStatTwo = capyStatTwo;

        const backdropWidth = gameWidth * 0.9;
        const backdropHeight = gameHeight * 0.6;

        const spriteTexture = scene.game.textures.get(capySprite);
        const texWidth = spriteTexture.source[0].width;
        const texHeight = spriteTexture.source[0].height;
        
        const capySpriteSize = this.scene.game.canvas.width * 0.6;

        let scalar = texWidth > texHeight ? (capySpriteSize / texWidth) : (capySpriteSize / texHeight);

        this.spriteWidth = texWidth * scalar;
        this.spriteHeight = texHeight * scalar;

        const spriteY = gameHeight * 0.45 - backdropHeight * 0.333;
        this.capySprite = new GameObjects.Sprite(scene, gameWidth * 0.7, spriteY, spriteTexture);
        this.capySprite.setDisplaySize(this.spriteWidth, this.spriteHeight);
        this.add(this.capySprite);
        
        this.backdrop = createBackdrop(scene, gameWidth * 0.5, gameHeight * 0.6, backdropWidth, backdropHeight);
        this.add(this.backdrop);
        
        let nameText = new GameObjects.Text(scene, gameWidth * 0.29, gameHeight * 0.35, `${capyName} has arrived!`, { fontSize: "40px", fontFamily: "Quantico", color: "#000" });
        nameText.setOrigin(0, 0);
        this.add(nameText);

        let flavorText = new GameObjects.Text(scene, gameWidth * 0.25, gameHeight * 0.4, "A new capy has joined your village", { fontSize: "25px", fontFamily: "Quantico", color: "#000", fontStyle: "italic" });
        flavorText.setOrigin(0, 0);
        this.add(flavorText);

        let skillText = new GameObjects.Text(scene, gameWidth * 0.43, gameHeight * 0.45, "SKILLS", { fontSize: "30px", fontFamily: "Quantico", color: "#000", maxLines: 2 });
        skillText.setOrigin(0, 0);
        this.add(skillText);

        let skillOneText = new GameObjects.Text(scene, gameWidth * 0.2, gameHeight * 0.5, this.capyStatOne.name, { fontSize: "20px", fontFamily: "Quantico", color: "#000", maxLines: 2 });
        skillOneText.setOrigin(0, 0);
        this.add(skillOneText);

        let skillOneStars = new GameObjects.Text(scene, gameWidth * 0.7, gameHeight * 0.5, this.makeStarText(this.capyStatOne.rating), { fontSize: "20px", fontFamily: "Quantico", color: "#000",  maxLines: 2 });
        skillOneStars.setOrigin(0, 0);
        this.add(skillOneStars);

        let skillTwoText = new GameObjects.Text(scene, gameWidth * 0.2, gameHeight * 0.55, this.capyStatTwo.name, { fontSize: "20px", fontFamily: "Quantico", color: "#000", maxLines: 2 });
        skillTwoText.setOrigin(0, 0);
        this.add(skillTwoText);

        let skillTwoStars = new GameObjects.Text(scene, gameWidth * 0.7, gameHeight * 0.55, this.makeStarText(this.capyStatTwo.rating), { fontSize: "20px", fontFamily: "Quantico", color: "#000", maxLines: 2 });
        skillTwoStars.setOrigin(0, 0);
        this.add(skillTwoStars);
        
        let equipmentText = new GameObjects.Text(scene, gameWidth * 0.35, gameHeight * 0.6, "EQUIPMENT", { fontSize: "40px", fontFamily: "Quantico", color: "#000", maxLines: 2 });
        equipmentText.setOrigin(0, 0);
        this.add(equipmentText);

        const itemOneSpriteTexture = scene.game.textures.get(itemOneSprite);
        let itemOneSpriteObject = new GameObjects.Sprite(scene, gameWidth * 0.35, gameHeight * 0.7, itemOneSpriteTexture);
        itemOneSpriteObject.setDisplaySize(this.spriteWidth * 0.25, this.spriteHeight * 0.25);
        this.add(itemOneSpriteObject);

        const itemTwoSpriteTexture = scene.game.textures.get(itemTwoSprite);
        let itemTwoSpriteObject = new GameObjects.Sprite(scene, gameWidth * 0.65, gameHeight * 0.7, itemTwoSpriteTexture);
        itemTwoSpriteObject.setDisplaySize(this.spriteWidth * 0.25, this.spriteHeight * 0.25);
        this.add(itemTwoSpriteObject);

        this.spawningLayer = spawningLayer;

        const textButtonY = gameHeight * 0.65 + backdropHeight * 0.25;
        this.add(new TextButton(scene, buttonText, "40px", gameWidth * 0.5, textButtonY, gameWidth * 0.6, () => this.onClick()));

        spawningLayer.blur(0.333);
        scene.toolBarLayer.blur(0.333);
        this.show(0.333);

        scene.addLayer(this, false);
        this.initLayer();
        scene.updateLayers();
    }
    
    makeStarText(level: number){
        let result = '';
        for(let i = 0; i < level; i++){
            result += '★';
        }
        for(let j = level; j < 5; j++){
            result += '☆';
        }
        return result;
    }

    onClick() {
        this.callback();
        this.closeModal();
    }

    closeModal() {
        console.log("?")
        this.spawningLayer.focus(0.333);
        this.mainScene.toolBarLayer.focus(0.333);
        this.hide(0.333);
        this.scene.time.delayedCall(400, () => this.mainScene.destroyLayer(this), [], this);
        if(this.cleanupCallback === null || this.cleanupCallback === undefined) return;
        this.cleanupCallback();
    }
}



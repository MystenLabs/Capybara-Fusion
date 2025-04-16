import { GameObjects, Scene } from 'phaser';
import { ShopCardType } from '../GameObjectTypes';
import { type CardData } from './Data';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';

export class Card extends GameObjects.Container {
    id: number;
    tilt: boolean;
    move: boolean;

    front: GameObjects.Sprite;
    back: GameObjects.Sprite;
    flipper: GameObjects.Container;
    
    cardWidth: number;
    cardHeight: number;

    targetSide: number;
    side: number;
    sideDynamics: SecondOrderDynamics;

    xDynamics: SecondOrderDynamics;
    yDynamics: SecondOrderDynamics;
    angleDynamics: SecondOrderDynamics;

    previousX: number;
    previousY: number;
    targetX: number;
    targetY: number;

    targetDepth: number;
    depthScalar: number;

    tiltScalar: number;
    shuffleProgress: number;
    onClick?: (data:CardData) => void;
    
    cardData: CardData;

    constructor(scene: Scene, data: CardData, x: number, y: number, depth: number, width: number, height: number, move: boolean = true, tilt: boolean = true, depthScalar: number = 0.01, tiltScalar: number = .01, onClick?: (data: CardData)=>void) {
        super(scene, x, y);
        this.addToUpdateList();

        this.cardWidth = width;
        this.cardHeight = height;
        
        this.cardData = data;

        this.name = data.name;
        this.id = data.id;

        this.move = move;
        this.tilt = tilt;

        this.depth = depth;
        this.depthScalar = depthScalar;
        this.scale = 1.0 + this.depth * this.depthScalar;

        this.tiltScalar = tiltScalar;
        this.angleDynamics = new SecondOrderDynamics(2.75, 1, 0, 0);
        
        this.front = new GameObjects.Sprite(scene, 0, 0, data.front);
        this.front.depth = 0.5;
        this.front.scaleX = 1;
        this.front.setDisplaySize(width, height * 0.75);

        this.back = new GameObjects.Sprite(scene, 0, 0, data.back);
        this.back.depth = -0.5;
        this.back.scaleX = -1;
        this.back.setDisplaySize(width, height);
        
        this.onClick = onClick;

        this.flipper = new GameObjects.Container(scene, 0, 0, [this.front, this.back]);
        this.flipper.sort("depth");

        this.add(this.flipper);

        this.targetSide = 1;
        this.side = 1;
        this.sideDynamics = new SecondOrderDynamics(2.75, 0.6, 0, 1);

        this.xDynamics = new SecondOrderDynamics(2.75, 1, 0, x);
        this.yDynamics = new SecondOrderDynamics(2.75, 1, 0, y);

        this.previousX = x;
        this.previousY = y;
        this.targetX = x;
        this.targetY = y;

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.cardWidth * 0.5, -this.cardHeight * 0.5, this.cardWidth, this.cardHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: false,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);

        this.type = ShopCardType;
    }

    flip() {
        this.targetSide = this.targetSide > 0 ? -1 : 1;
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if(this.side === 1) return;
        //TODO temp hack for demo [MJ]
        //this.flip();
        if(this.onClick !== null && this.onClick !== undefined) this.onClick!(this.cardData);
    }

    updateFlip(dt: number) {
        this.side = this.sideDynamics.update(this.targetSide, dt);

        let flippingScale = this.side;
        if (this.side > 0) {
            if (this.front.depth < 0) {
                this.front.depth = 0.5;
                this.back.depth = -0.5;
                this.flipper.sort("depth");
            }

            if (this.side > 1) {
                flippingScale = 1 - (this.side - 1);
            }
        }
        else {
            if (this.back.depth < 0) {
                this.front.depth = -0.5;
                this.back.depth = 0.5;
                this.flipper.sort("depth");
            }

            if (this.side < -1) {
                flippingScale = -1 - (this.side + 1);
            }
        }

        this.flipper.scaleX = flippingScale;
    }

    updatePosition(dt: number) {
        if (this.move) {
            this.x = this.xDynamics.update(this.targetX, dt);
            this.y = this.yDynamics.update(this.targetY, dt);
        }

        if (this.tilt) {
            this.angle = this.angleDynamics.update(-(this.x - this.previousX) / (dt + 1e-6) * this.tiltScalar, dt);
        }
        else {
            this.angle = this.angleDynamics.update(0, dt);
        }

        this.previousX = this.x;
        this.previousY = this.y;
    }

    preUpdate(time: number, delta: number) {
        let dt = delta / 1000;

        this.updateFlip(dt);
        this.updatePosition(dt);

        this.scale = 1.0 + this.depth * this.depthScalar;
    }

    shuffleCard(duration: number, direction: number, targetDepth: number) {
        let originalX = this.x;
        let xTravel = this.cardWidth * 1.2;
        let yTravel = this.cardHeight * -0.2;
        let originalDepth = this.depth;
        let originalY = this.y;
        this.shuffleProgress = 0;

        let tween = this.scene.tweens.add({
            targets: this,
            duration: duration * 1000,
            shuffleProgress: '+=1',
            onStart: function (tween, targets: Card[]) {
                targets[0].move = false;
            },
            onUpdate: function (tween, target, key, current, previous) {
                let twn : Phaser.Tweens.Tween = tween;
                let p = Phaser.Math.Clamp(twn.elapsed / twn.duration, 0, 1);

                let tW = 1 - Math.pow(2 * (p - 0.5), 2);
                target.x = originalX + (tW * xTravel * direction);
                target.y = originalY + (tW * yTravel);

                let dW = Math.tanh(16 * (p - 0.75)) * 0.5 + 0.5;
                let dW2 = Phaser.Math.Clamp(1 - Math.pow(4 * (p - 0.75), 2), 0, 1);
                target.depth = Phaser.Math.Linear(Phaser.Math.Linear(originalDepth, targetDepth, dW), 50, dW2);
            },
            onComplete(tween, targets: Card[]) {
                let card = targets[0];
                card.move = true;

                card.x = originalX;
                card.y = originalY;
                card.depth = targetDepth;

                card.xDynamics.reset(originalX);
                card.yDynamics.reset(originalY);
            }
        });
    }

    moveCard(x: number, y: number) {
        this.move = true;
        
        this.xDynamics.reset(this.x);
        this.yDynamics.reset(this.y);

        this.targetX = x;
        this.targetY = y;
    }

    elevate(duration: number, targetDepth: number) {
        this.scene.tweens.add({
            targets: this,
            duration: duration * 1000,
            ease: 'Circ.easeOut',
            depth: targetDepth,
        });
    }
}
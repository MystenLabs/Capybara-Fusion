import { GameObjects, Scene } from 'phaser';
import { ShopCardType } from '../GameObjectTypes';
import { type CardData } from './Data';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import { Card } from './Card';

export class CardSet extends GameObjects.Container {

    setWidth: number;
    setHeight: number;
    setSpacing: number;
    shuffling: boolean;
    picking: boolean;

    constructor(scene: Scene, x: number, y: number, depth: number, width: number, height: number, cardWidth: number, cardHeight: number, cards: CardData[], onClick?: (data: CardData) => void) {
        super(scene, x, y);
        this.addToUpdateList();

        this.setWidth = width;
        this.setHeight = height;
        this.depth = depth;

        this.setSpacing = width / (cards.length + 1);

        for (let i = 0; i < cards.length; i++) {
            const card: Card = new Card(this.scene, cards[i], this.setSpacing * (i + 1), this.setHeight * 0.5, 0, 140, 190, true,true,0.01,0.01,onClick);
            this.add(card);
        }

        this.shuffling = false;
        this.picking = false;
    }

    preUpdate(time: number, delta: number) {
        let dt = delta / 1000;

        this.sort('depth');
    }

    shuffleSet() {
        for (let i = 0; i < this.list.length; i++) {
            this.scene.time.delayedCall(i * 200, (<Card>this.list[i]).flip, [0.25, 0], this.list[i]);
        }

        this.scene.time.delayedCall(1000, this.shuffleStart, [this.list], this);
    }
    
    flipCard(cardId: number) {
        if (this.shuffling) {
            return;
        }

        let list = <Card[]>this.list;

        for(let i = 0; i < list.length; i++){
            let card = list[i];
            if(card.cardData.id === cardId) {
                card.flip();
            }
            else {
                this.scene.time.delayedCall(1000, card.flip, [], card);
            }
        }

        this.scene.time.delayedCall(1000, () => { this.picking = false; }, [], this);
    }

    shuffleStart(list: Card[]) {
        this.picking = true;
        this.shuffling = true;

        for (let i = 0; i < this.list.length; i++) {
            let card = <Card>this.list[i];
            card.moveCard(this.setWidth * 0.5, this.setHeight * 0.5);
            card.elevate(0.25, i + 1);
        }

        this.scene.time.delayedCall(1000, this.shuffleUpdate, [this.list, 9], this);
    }

    shuffleUpdate(list: Card[], remaining: number) {
        const selected = Math.floor(Math.random() * (list.length - 1));

        for (let i = selected + 1; i < list.length; i++) {
            list[i].elevate(0.25, i);
        }

        list[selected].shuffleCard(.25, remaining % 2 == 0 ? 1 : -1, list.length);

        if (remaining > 0) {
            this.scene.time.delayedCall(300, this.shuffleUpdate, [list, remaining - 1], this);
        }
        else {
            this.scene.time.delayedCall(1000, this.shuffleFinish, [list], this);
        }
    }

    shuffleFinish(list: Card[]) {
        for (let i = 0; i < list.length; i++) {
            let card = list[i];
            card.moveCard(this.setSpacing * (i + 1), this.setHeight * 0.5);
            this.scene.time.delayedCall(333, card.elevate, [0.25, 0], card);
        }

        this.scene.time.delayedCall(1000, () => { this.shuffling = false; }, [], this);
    }
}
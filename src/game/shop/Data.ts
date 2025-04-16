import CardList from '$lib/shop/cards.json';
import { stringHash } from '$lib/utils/Hashes';

type SerializedCardData = {
    name: string;
    displayName: string;
    front: string;
    back: string;
};

export type CardID = number;
export type CardData = {
    id: CardID;
    name: string;
    displayName: string;
    front: string;
    back: string;
}
export type CardDataDictionary = Record<number, CardData>;

export function LoadShopData(game: Phaser.Game) {
    const serializedCards: SerializedCardData[] = CardList;

    let cardDict: CardDataDictionary = {};
    for (const serializedCard of serializedCards) {
        const card : CardData = {
            id: stringHash(serializedCard.name),
            name: serializedCard.name,
            displayName: serializedCard.displayName,
            front: serializedCard.front,
            back: serializedCard.back,
        };

        cardDict[card.id] = card;
    }

    game.registry.set('cards', cardDict);
    //TODO this should be being set by a server [MJ]
    game.registry.set('timeRemaining', 10800000);
}
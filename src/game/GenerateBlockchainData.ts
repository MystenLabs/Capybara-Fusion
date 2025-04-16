const capyNames = [
    'Max', 'Lucas', 'Arbor', 'Felix', 'Sonny', 'Pluto', 'Danny', 'Corrin', 'Morgan', 'Marty',
    'Zeke', 'Tori', 'Tami', 'Otis', 'Oliver', 'Wendy', 'Selah', 'Sumi', 'Dina', 'Raf',
    'Tia', 'Marty', 'Nova', 'Nina', 'Remy', 'Cole', 'Carla', 'Copi', 'Hunter', 'Hope',
    'Kira', 'Pete', 'Rollo', 'Vic', 'Barty', 'Eli', 'Vinny', 'Sasha', 'Graham', 'Gupta'
]

const secondaryStatNames = [
    "Dexterity", "Charm", "Efficiency"
];

export type BlockchainItem = {
    type: string;

    itemId: string;
    itemType: string;

    fromUser: string | number;
    toUser: string;

    itemEventType: string,
    chainID?: string;
}

export type CapyStat = {
    name: string;
    rating: number;
}

export type BlockchainCapy = {
    type: string;

    name: string;
    stats: CapyStat[];
    items: {type: string, fromUser: string, toUser: string}[];
    
    fromUser: string | number;
    toUser: string;
    
    chainID?: string;
    capyID: string;
}

export function generateItem(itemName: string, fromUser: string | null, toUser: string, itemEventType: string): BlockchainItem {

    return <BlockchainItem> {
        type: 'item',
        itemType: itemName,
        itemId: itemName,
        fromUser: fromUser || 0,
        toUser: toUser,
        itemEventType: itemEventType,
    }
}

export function generateCapy(primaryStat: CapyStat, secondaryStat: CapyStat, itemA: BlockchainItem, itemB: BlockchainItem, fromUser: string | null, toUser: string): BlockchainCapy {

    return <BlockchainCapy> {
        type: 'capy',
        name: capyNames[Math.floor(Math.random() * capyNames.length)],
        fromUser: fromUser || 0,
        toUser: toUser,
        items: [
            {type: itemA.itemType, fromUser: fromUser, toUser: toUser},
            {type: itemB.itemType, fromUser: fromUser, toUser: toUser}
        ],
        stats: [primaryStat, secondaryStat],
        capyID: crypto.randomUUID()
    }
}
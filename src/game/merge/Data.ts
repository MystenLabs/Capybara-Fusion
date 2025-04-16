import ItemList from '$lib/merge/items.json';
import RecipeList from '$lib/merge/recipes.json';
import QuestList from '$lib/merge/quests.json';
import ItemChains from '$lib/merge/chains.json';
import MVPLevel from '$lib/merge/levels/mvp_level.json';
import { stringHash, numberHash } from '$lib/utils/Hashes';
import type {LocationID} from "../overworld/Data";

type SerializedItemData = {
    name: string;
    displayName: string;
    icon: string;
    major?: boolean;
    chain?: string;
};

type SerializedRecipe = {
    name: string,
    draggedItem: string;
    targetItem: string;
    resultItem: string;
    reversible?: boolean;
};

type SerializedLevel = {
    name: string;
    grid: (string | null)[][];
};

type SerializedQuest = {
    name: string;
    displayName: string;
    requirements: Record<string, number>;
    allowedRecipes: string[];
    upgradeLocation: string;
    nextQuest: string | null;
};

export type ItemID = number;
export type ItemData = {
    id: ItemID;
    name: string;
    displayName: string;
    icon: string;
    major?: boolean;
    chain?: number;
};
export type ItemDataDictionary = Record<ItemID, ItemData>;

export type RecipeID = number;
export type Recipe = {
    id: RecipeID;
    name: string;
    draggedItem: ItemID;
    targetItem: ItemID;
    resultItem: ItemID;
    reversible: boolean;
};

export type RecipeBook = Record<RecipeID, Recipe>;
export type RecipeLookup = Record<ItemID, Recipe>;

export type ItemChainDictionary = Record<number, ItemData[]>;

export type Level = {
    name: string;
    grid: (ItemID | null)[][];
};

export type QuestID = number;

export type QuestData = {
    id: QuestID;
    name: string;
    displayName: string;
    requirements: Record<ItemID, number>;
    allowedRecipes: RecipeBook;
    upgradeLocation: LocationID;
    nextQuest: QuestID | null;
};
export type QuestDataDictionary = Record<QuestID, QuestData>;

export function CalculateRecipeId(draggedItemID: ItemID, targetItemID: ItemID) {
    return numberHash(targetItemID, draggedItemID);
}

export function LoadMergeData(game: Phaser.Game) {
    const serializedItems : SerializedItemData[] = ItemList;
    const serializedRecipes : SerializedRecipe[] = RecipeList;
    const serializedLevels : SerializedLevel[] = [ MVPLevel ];
    const serializedQuests : SerializedQuest[] = <any>QuestList;
    const serializedChains : Record<string, string[]> = ItemChains;

    let itemDict : ItemDataDictionary = {};
    for (const serializedItem of serializedItems) {
        let item : ItemData = {
            id: stringHash(serializedItem.name),
            name: serializedItem.name,
            displayName: serializedItem.displayName,
            icon: serializedItem.icon
        };

        if (serializedItem.major) {
            item.major = serializedItem.major;
        }

        if (serializedItem.chain) {
            item.chain = stringHash(serializedItem.chain);
        }

        itemDict[item.id] = item;
    }

    let chainDict : ItemChainDictionary = {};
    for (const chain in serializedChains) {
        let chainID = stringHash(chain);

        let items : ItemData[] = [];
        for (const item of serializedChains[chain]) {
            items.push(itemDict[stringHash(item)]);
        }

        chainDict[chainID] = items;
    }

    let recipeLookup: RecipeLookup = {}
    let recipeBook : RecipeBook = {};
    let recipeDict : Record<string, RecipeID> = {};
    for (const serializedRecipe of serializedRecipes) {
        let draggedID = stringHash(serializedRecipe.draggedItem);
        let targetID = stringHash(serializedRecipe.targetItem);
        let resultID = stringHash(serializedRecipe.resultItem);
        let reversible = serializedRecipe.reversible !== undefined ? serializedRecipe.reversible : true;

        const recipe : Recipe = {
            id: CalculateRecipeId(draggedID, targetID),
            name: serializedRecipe.name,
            draggedItem: draggedID,
            targetItem: targetID,
            resultItem: resultID,
            reversible: reversible,
        }

        recipeLookup[resultID] = recipe;
        recipeBook[recipe.id] = recipe;
        recipeDict[recipe.name] = recipe.id;
    }

    let levels : Record<string, Level> = {};
    for (const serializedLevel of serializedLevels) {
        let grid : (ItemID | null)[][] = [];

        for (const serializedRow of serializedLevel.grid) {
            let row: (ItemID | null)[] = [];
            grid.push(row);

            for (const itemName of serializedRow) {
                if (itemName != null) {
                    row.push(stringHash(itemName));
                }
                else {
                    row.push(null);
                }
            }
        }

        const level : Level = {
            name: serializedLevel.name,
            grid: grid,
        };

        levels[level.name] = level;
    }

    let questDict: QuestDataDictionary = {};
    for (const serializedQuest of serializedQuests) {
        let requirements : Record<QuestID, number> = {};
        for (const requirement in serializedQuest.requirements) {
            requirements[stringHash(requirement)] = serializedQuest.requirements[requirement];
        }

        let allowedRecipes : RecipeBook = {};
        for (const recipeName of serializedQuest.allowedRecipes) {
            const recipeID = recipeDict[recipeName];
            allowedRecipes[recipeID] = recipeBook[recipeID];
        }

        const quest : QuestData = {
            id: stringHash(serializedQuest.name),
            name: serializedQuest.name,
            displayName: serializedQuest.displayName,
            requirements: requirements,
            upgradeLocation: stringHash(serializedQuest.upgradeLocation),
            nextQuest: serializedQuest.nextQuest === null ? -1 : stringHash(serializedQuest.nextQuest),
            allowedRecipes: allowedRecipes,
        };

        questDict[quest.id] = quest;
    }
    
    let inventory: ItemData[] = [ itemDict[stringHash('wood_plank')] ];

    game.registry.set('items', itemDict);
    game.registry.set('recipes', recipeBook);
    game.registry.set('recipe_lookup', recipeLookup);
    game.registry.set('levels', levels);
    game.registry.set('quests', questDict);
    game.registry.set('inventory', inventory);
    game.registry.set('chains', chainDict);
}
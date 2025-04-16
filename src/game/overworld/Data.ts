import LocationList from '$lib/overworld/locations.json';
import CapySkillList from '$lib/overworld/capy_skills.json';
import CapyNameList from '$lib/overworld/capy_names.json';
import CapyItemList from '$lib/overworld/capy_items.json';
import { stringHash } from '$lib/utils/Hashes';

type SerializedLocation = {
    name: string;
    displayName: string;
    texture: string;
    position: { x: number, y: number };
    scale: { x: number, y: number };
    upgrade: string | null;
    capyTexture: string | null;
    capyAnimated: boolean;
    capyTextureCropped: string | null;
    capySkillID: number;
    capyOffset: { x: number, y: number } | null;
    capyScale: { x: number, y: number } | null;
    generatedItem: string | null;
    itemGenerationDelayMS: number;
};

type SerializedCapySkill = {
    skillId: number;
    displayName: string;
    pairedLocation: string | null;
    maxLevel: number;
}

type SerializedCapyNames = {
    names: string[];
}

type SerializedCapyItem = {
    itemName: string;
}

export type LocationID = number;
export type Location = {
    id: LocationID;
    name: string;
    displayName: string;
    texture: string;
    position: { x: number, y: number };
    scale: { x: number, y: number };
    upgrade: number
    capyTexture: string;
    capyAnimated: boolean;
    capyTextureCropped: string;
    capySkillID: CapySkillID;
    capyOffset: { x: number, y: number };
    capyScale: { x: number, y: number };
    generatedItem: string;
    itemGenerationDelayMS: number;
}
export type LocationDictionary = Record<number, Location>;

export type CapySkillID = number;
export type CapySkillInfo = {
    id: CapySkillID;
    displayName: string;
    maxLevel: number;
    pairedLocation: LocationID; // -1 = "boon location" (no location)
}

export type CapySkillDictionary = Record<CapySkillID, CapySkillInfo>;

export function LoadLocations(game: Phaser.Game) {
    const serializedLocations: SerializedLocation[] = LocationList;

    let locationDict: LocationDictionary = {};
    //TODO handle nulls in a way that actually makes sense sometime down the line [MJ]
    //TODO handle -1 ID for nonexistent skill
    for (const serializedLocation of serializedLocations) {
        const location : Location = {
            id: stringHash(serializedLocation.name),
            name: serializedLocation.name,
            displayName: serializedLocation.displayName,
            texture: serializedLocation.texture,
            position: serializedLocation.position,
            scale: serializedLocation.scale,
            upgrade: serializedLocation.upgrade === null ? -1 : stringHash(serializedLocation.upgrade), 
            capyTexture: serializedLocation.capyTexture == null ? "base_capy" : serializedLocation.capyTexture,
            capyAnimated: serializedLocation.capyAnimated,
            capyTextureCropped: serializedLocation.capyTextureCropped == null ? "base_capy_cropped" : serializedLocation.capyTextureCropped,
            capySkillID: serializedLocation.capySkillID,                                              
            capyOffset: serializedLocation.capyOffset === null ? { x: 0, y: 0 } : serializedLocation.capyOffset,                                    
            capyScale: serializedLocation.capyScale === null ? { x: 0, y: 0 } : serializedLocation.capyScale,
            generatedItem: serializedLocation.generatedItem == null ? "item_1" : serializedLocation.generatedItem,
            itemGenerationDelayMS: serializedLocation.itemGenerationDelayMS
        };

        locationDict[location.id] = location;
    }

    game.registry.set('locations', locationDict);
}

export function LoadCapyData(game: Phaser.Game) {
    //TODO basically all this data should go on a backend [MJ]
    const serializedCapySkills: SerializedCapySkill[] = CapySkillList;
    const serializedCapyNames: SerializedCapyNames = CapyNameList;
    const serializedCapyItems: SerializedCapyItem[] = CapyItemList; 

    let capySkillDict: CapySkillDictionary = {};
    let capyBoonSkillDict: CapySkillDictionary = {};
    for (const serializedCapySkill of serializedCapySkills) {
        const capySkill : CapySkillInfo = {
            id: serializedCapySkill.skillId,
            displayName: serializedCapySkill.displayName,
            maxLevel: serializedCapySkill.maxLevel,
            pairedLocation: serializedCapySkill.pairedLocation == null ? 0 : stringHash(serializedCapySkill.pairedLocation)
        };
        //TODO this is horrible, think of a better way to do this later [MJ]
        capySkill.id <= 1000 ? capySkillDict[capySkill.id] = capySkill : capyBoonSkillDict[capySkill.id] = capySkill;
        
    }
    let capyNameList: string[];
    capyNameList = serializedCapyNames.names;
    let capyItemList: string[] = [];
    for (const serializedCapyItem of serializedCapyItems) {
        capyItemList.push(serializedCapyItem.itemName);
    }

    game.registry.set('capySkills', capySkillDict);
    game.registry.set('capyBoonSkills', capyBoonSkillDict);
    game.registry.set('capyNames', capyNameList);
    game.registry.set('capyItems', capyItemList);
}
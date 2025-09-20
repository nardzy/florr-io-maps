
export enum RarityColor {
    Common = "#7eef6d",
    Unusual = "#ffe65d",
    Rare =  "#4d52e3",
    Epic = "#861fde",
    Legendary = "#de1f1f",
    Mythic = "#1fdbde",
    Ultra = "#ff2b75",
    Super = "#2bffa3",
    Unique = "#555555"
}

export enum Rarity {
    Common,
    Unusual,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Ultra,
    Super,
    Unique
}

export const color_from_diff = (diff: number) => {

    if (isNaN(diff)) return RarityColor.Common;

    if (diff <= 0) return RarityColor.Common;
    if (diff > 0 && diff <= 10) return RarityColor.Unusual;
    if (diff > 10 && diff <= 20) return RarityColor.Rare;
    if (diff > 20 && diff <= 30) return RarityColor.Epic;
    if (diff > 30 && diff <= 45) return RarityColor.Legendary;
    if (diff > 45 && diff <= 55) return RarityColor.Mythic;
    if (diff > 55) return RarityColor.Ultra;

    return RarityColor.Unique;

};
import { maps } from "./tilemap";

export interface TiledLayer {
    encoding?: string,
    compression?: string,
    id: number;
    name: string;
    type: "tilelayer" | "objectgroup" | "imagelayer" | "group";
    x: number;
    y: number;
    width?: number;
    height?: number;
    data?: Uint32Array | string;
    objects?: TiledObject[];
    opacity?: number;
    visible?: boolean;
    properties?: TiledProperty[];
}

export interface TiledTileset {
    firstgid: number;
    source?: string;
    name: string;
    image?: string;
    imagewidth?: number;
    imageheight?: number;
    tilewidth: number;
    tileheight: number;
    margin?: number;
    spacing?: number;
    tilecount?: number;
    columns?: number;
    tiles?: TiledTile[];
    properties?: TiledProperty[];
}

export interface TiledTile {
    id: number;
    image?: string;
    imagewidth?: number;
    imageheight?: number;
    properties?: TiledProperty[];
    animation?: TiledAnimation[];
}

export interface TiledAnimation {
    tileid: number;
    duration: number;
}

export interface TiledObject {
    id: number;
    name: string;
    type?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    gid?: number;
    visible?: boolean;
    properties?: TiledProperty[];
    point?: boolean;
    ellipse?: boolean;
    polygon?: { x: number; y: number }[];
    polyline?: { x: number; y: number }[];
}

export interface TiledProperty {
    name: string;
    type: "string" | "int" | "float" | "bool" | "color" | "file" | "object";
    value: string | number | boolean;
}

export interface TiledMap {
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    orientation: "orthogonal" | "isometric" | "staggered" | "hexagonal";
    layers: TiledLayer[];
    tilesets: TiledTileset[];
    backgroundcolor?: string;
    properties?: TiledProperty[];
    version: string | number;
    tiledversion?: string;
    nextlayerid?: number;
    nextobjectid?: number;
}

export const parse_tmj = (sid: string): TiledMap => {

    const data = maps.get(sid);

    if (!data) throw new Error(`Map not found. ${sid}`);

    return JSON.parse(data);

};
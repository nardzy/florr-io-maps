import { svg_to_canvas } from "../rendering/svg2sprite";
import { tiles } from "./tileasset";
import { parse_tmj, TiledMap } from "./tiled";
import {
    ungzip
} from "pako";

export class Room {

    data!: TiledMap;
    gw!: number;
    gh!: number;
    wf!: number;
    hf!: number;
    width!: number;
    height!: number;
    name!: string;
    sprites: Map<number, OffscreenCanvas> = new Map;

    constructor() {

        this.select("garden");

    }

    select(map: string) {

        this.data = parse_tmj(map);

        this.gw = this.data.width;
        this.gh = this.data.height;

        this.width = this.gw * this.data.tilewidth;
        this.height = this.gh * this.data.tileheight;

        this.wf = 1 / this.data.tilewidth;
        this.hf = 1 / this.data.tileheight;

        this.name = this.data.properties?.find(x => x.name === "display_name")?.value as string ?? "";

    }

    async load() {

        for (const family of ["Ubuntu", "Game"]) {

            const font = new FontFace(family, "url(./font/Ubuntu-Bold.ttf)");

            await font.load();

            document.fonts.add(font);

        }

        for (const [id, svg] of tiles) {

            const canvas = svg_to_canvas(
                svg,
                512,
                512
            );

            if (!canvas) {
                continue;
            }

            this.sprites.set(id, canvas);

        }

        for (const layer of this.data.layers) {

            if (
                layer.encoding !== "base64" ||
                layer.compression !== "gzip"
            ) continue;

            if (typeof layer.data !== "string") continue;

            const s = atob(layer.data);
            const len = s.length;
            const bin = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
                bin[i] = s.charCodeAt(i);
            }

            layer.data = new Uint32Array(ungzip(bin).buffer);

        }

        return true;

    }

}
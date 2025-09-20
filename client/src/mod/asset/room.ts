import { FLIP_HORIZONTAL, FLIP_VERTICAL, FLIP_DIAGONAL } from "../const";
import { color_from_diff } from "../rendering/colorget";
import { svg_to_canvas } from "../rendering/svg2sprite";
import { get_mob_by_sid, revmap } from "./game/mobs";
import { mobs } from "./mobmap";
import { tiles } from "./tileasset";
import { parse_tmj, TiledMap, TiledProperty } from "./tiled";
import {
    ungzip
} from "pako";

const get_property = (
    name: string,
    p?: TiledProperty[]
) => {
    return Number(p?.find(x => x.name === name)?.value ?? NaN);
};


const get_property_str = (
    name: string,
    p?: TiledProperty[]
) => {
    return p?.find(x => x.name === name)?.value.toString();
};

const SPECIAL_IDS = new Set([93, 115]);

class MobSpawner {

    color: string;
    big: boolean;

    constructor(
        public id: number,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public mobs: number[],
        public points: Path2D,
        public difficulty: number,
        public density: number,
        public extra_spawn_delay: number,
        public force_rarity: number,
        public team: number,
    ) {

        this.color = color_from_diff(difficulty);
        this.big = width > 25252 && height > 25252;
        
    }

}

class CheckPoint {

    points = new Path2D();

    constructor(
        public id: number,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public level: number
    ) {
        this.points.rect(0, 0, width, height);
    }

}

class SpecialSprite {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public id: number
    ) {}
}

export class Room {

    mob_spawner: MobSpawner[] = [];
    special_sprites: SpecialSprite[] = [];
    check_points: CheckPoint[] = [];

    data!: TiledMap;
    gw!: number;
    gh!: number;
    wf!: number;
    hf!: number;
    width!: number;
    height!: number;
    name!: string;
    tilewidth!: number;
    tileheight!: number;
    sprites: Map<number, OffscreenCanvas> = new Map;
    mob_sprites: Map<number, OffscreenCanvas> = new Map;

    constructor() {

        this.select(localStorage.getItem("visited_map") ?? "garden");

    }

    /*
    difficulty 70, 0 luck:
    Mythic 26.15%
    Ultra 73.85%
    */

    last_map = "";

    select(map: string) {

        if (map === this.last_map) return;

        this.mob_spawner.splice(0);
        this.special_sprites.splice(0);
        this.check_points.splice(0);

        this.data = parse_tmj(map);

        this.last_map = map;

        localStorage.setItem("visited_map", map);

        for (const layer of this.data.layers) {

            if (layer.objects) for (const object of layer.objects) {

                object.x *= 0.75;
                object.y *= 0.75;

                const w = (object.width ?? 1) * 0.75;
                const h = (object.height ?? 1) * 0.75;

                if (object.gid) {

                    this.special_sprites.push(
                        new SpecialSprite(
                            object.x,
                            object.y,
                            w,
                            h,
                            object.gid
                        )
                    );
                    continue;
                }

                if (
                    object.type === "checkpoint"
                ) {

                    //console.log(object);

                    const level = get_property("level", object.properties);

                    this.check_points.push(
                        new CheckPoint(
                            object.id,
                            object.x,
                            object.y,
                            w,
                            h,
                            isNaN(level) ? 0 : level
                        )
                    );

                    continue;
                }

                if (
                    object.type !== "spawn_mobs"
                ) continue;

                const points = new Path2D;

                const difficulty = get_property("difficulty", object.properties);
                const density = get_property("density", object.properties);
                const extra_spawn_delay = get_property("extra_spawn_delay", object.properties);
                const force_rarity = get_property("force_rarity", object.properties);
                const team = get_property("team", object.properties);
                const mobstr = get_property_str("mobs", object.properties);

                const mobs = mobstr?.replaceAll("\n", "").split(";").map(x => revmap.get(x.replace(";", "").split(":")[0]) ?? -1) ?? [];

                console.log(mobs, mobstr);

                if (!object.polygon) {

                    points.rect(
                        0,
                        0,
                        w,
                        h
                    );

                    const spawner = new MobSpawner(
                        object.id,
                        object.x,
                        object.y,
                        w,
                        h,
                        mobs,
                        points,
                        difficulty,
                        density,
                        extra_spawn_delay,
                        force_rarity,
                        team
                    );

                    this.mob_spawner.push(spawner);

                    continue;
                }

                let first = true;

                let width = 0;
                let height = 0;

                for (const polygon of object.polygon) {

                    polygon.x *= 0.75;
                    polygon.y *= 0.75;
    
                    if (width < polygon.x) width = polygon.x;
                    if (height < polygon.y) height = polygon.y;

                    if (first) {
                        first = false;
                        points.moveTo(polygon.x, polygon.y);
                        continue;
                    }

                    points.lineTo(polygon.x, polygon.y);

                }

                points.closePath();

                const spawner = new MobSpawner(
                    object.id,
                    object.x,
                    object.y,
                    w || width,
                    h || height,
                    mobs,
                    points,
                    difficulty,
                    density,
                    extra_spawn_delay,
                    force_rarity,
                    team
                );

                this.mob_spawner.push(spawner);

            }

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

        const w = this.data.tilewidth * 0.75;
        const h = this.data.tileheight * 0.75;

        this.gw = this.data.width;
        this.gh = this.data.height;

        this.width = this.gw * w;
        this.height = this.gh * h;

        this.wf = 1 / w;
        this.hf = 1 / h;

        this.tilewidth = w;
        this.tileheight = h;

        this.name = this.data.properties?.find(x => x.name === "display_name")?.value as string ?? "";

    }

    private async load_font(title: string, url: string, v?: string) {

        const v2 = v ?? "";

        for (const family of [title + v2, "Game" + v2]) {

            const font = new FontFace(family, `url(${url})`);

            await font.load();

            document.fonts.add(font);

        }

    }

    async load() {

        await this.load_font("Ubuntu", "./font/Ubuntu-Bold.ttf");
        await this.load_font("Ubuntu", "./font/UbuntuMono-Bold.ttf", "Mono");

        for (const [id, svg] of tiles) {

            const s = SPECIAL_IDS.has(id) ? 2048 : 512;

            const canvas = svg_to_canvas(
                svg,
                s,
                s
            );

            if (!canvas) {
                continue;
            }

            this.sprites.set(id, canvas);

        }

        for (const [id, svg] of mobs) {

            const s = 256;

            const canvas = svg_to_canvas(
                svg,
                s,
                s
            );

            if (!canvas) {
                console.log(id, svg);
                continue;
            }

            this.mob_sprites.set(id, canvas);

        }

        return true;

    }

}
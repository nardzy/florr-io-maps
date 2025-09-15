import { PaintId } from "../../types/code";
import { VIEW_H, VIEW_W } from "../config";
import { UserInterface } from "../gui/button";
import { Loading } from "../gui/loading";
import { ViewEntity } from "./view";

const create_canvas = () => {

    const canvas = document.createElement("canvas");

    canvas.className = "canvas";
    canvas.addEventListener("contextmenu", event => {
        return event.preventDefault();
    });

    document.body.prepend(canvas);

    return canvas;

};

class OffCvs {

    canvas = new OffscreenCanvas(1, 1);
    ctx: OffscreenCanvasRenderingContext2D;

    constructor() {

        const ctx = this.canvas.getContext("2d");

        if (!ctx) throw new Error("Cannnot get OffscreenCanvasRenderingContext2D in Drawer constructor.");

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        this.ctx = ctx;

    }

}

export class Painter {

    loading = new Loading();
    pixel = 1;

    canvas = create_canvas();
    ctx: CanvasRenderingContext2D;

    private wrap_alpha = 1.0;
    private fps_max_len = 120;

    delta_time = 0.0;
    delta_min = 1000.0;
    delta_max = 0.0;
    delta_last_time = 0.0;
    time = 0.0;

    scale = 1.0;
    view_x = 1.0;
    view_y = 1.0;
    view_width = 1.0;
    view_height = 1.0;

    camera_scale = 1.0;
    camera_x = 0.0;
    camera_y = 0.0;
    camera_cx = 0.0;
    camera_cy = 0.0;
    camera_width = 1.0;
    camera_height = 1.0;

    total_scale = 1.0;

    cursor = "default";
    cursor_x = 0;
    cursor_y = 0;
    fps = 0.0;
    fps_sum = 0.0;
    fps_v: number[] = [];

    mdframe = false;
    muframe = false;
    grab = false;

    ui = new UserInterface();
    
    toggle: Set<string> = new Set;
    pressed: Set<string> = new Set;
    viewer = new ViewEntity();

    private offscreen: Map<PaintId, OffCvs> = new Map;

    constructor(paints: PaintId[]) {

        const ctx = this.canvas.getContext("2d");

        if (!ctx) throw new Error("Cannnot get CanvasRenderingContext2D in Drawer constructor.");

        for (const paint of paints) {
            this.offscreen.set(
                paint,
                new OffCvs()
            );
        }

        this.ctx = ctx;
        this.resize_to_screen();

    }

    get(index: PaintId) {

        return this.offscreen.get(index);

    }

    clear() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const [id, canvas] of this.offscreen) {

            canvas.ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
            canvas.ctx.lineCap = "round";
            canvas.ctx.lineJoin = "round";

        }

    }

    resize_to_screen() {

        const width = innerWidth * devicePixelRatio;
        const height = devicePixelRatio * innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;

        const scale = Math.max(
            width / VIEW_W,
            height / VIEW_H
        );

        this.scale = scale;

        this.view_width = width / scale;
        this.view_height = height / scale;

        this.view_x = this.view_width * .5;
        this.view_y = this.view_height * .5;

        for (const [id, canvas] of this.offscreen) {
            canvas.canvas.width = width;
            canvas.canvas.height = height;
        }

    }

    set_cursor_style(cursor: string) {

        this.cursor = cursor;

    }

    set_cursor_position(x: number, y: number, s?: boolean) {

        if (s) {
            this.cursor_x = x;
            this.cursor_y = y;
            return;
        }

        this.cursor_x = x * devicePixelRatio;
        this.cursor_y = devicePixelRatio * y;

    }

    set_camera_position(x: number, y: number) {

        const camera_x = x - this.camera_cx;
        const camera_y = y - this.camera_cy;

        this.camera_x = camera_x;
        this.camera_y = camera_y;

    }

    camera_view(ctx: RenderingContext2D) {

        ctx.translate(
            -this.camera_x,
            -this.camera_y
        );

    }

    scale_view(ctx: RenderingContext2D) {

        ctx.scale(this.scale, this.scale);

    }

    scale_game(ctx: RenderingContext2D) {

        ctx.scale(this.camera_scale, this.camera_scale);

    }

    update_game_scale(fov: number) {

        this.camera_scale = 1.2 * fov;
        this.camera_width = this.view_width / this.camera_scale;
        this.camera_height = this.view_height / this.camera_scale;

        this.camera_cx = this.camera_width * .5;
        this.camera_cy = this.camera_height * .5;
        this.total_scale = 1 / (this.scale * this.camera_scale);
        this.pixel = Math.ceil(1 / this.total_scale);

    }

    private remove_fps_fv(del: boolean) {

        if (this.fps_v.length > (del ? 0 : this.fps_max_len)) {
            this.fps_sum -= this.fps_v.shift()!;
        }

    }

    private calculate_fps() {

        return 1000 / (this.fps_sum / this.fps_v.length);

    }

    frame(time: number, debug: boolean) {

        this.cursor = "default";
        this.delta_time = Math.max(0, time - this.time);
        this.time = time;

        if (!debug) {
            this.remove_fps_fv(true);
            return this.delta_time;
        }

        this.fps_sum += this.delta_time;
        this.fps_v.push(this.delta_time);
        this.remove_fps_fv(false);

        this.fps = this.calculate_fps();

        if (time - this.delta_last_time < 200) return this.delta_time;

        this.delta_min = 1000;
        this.delta_max = 0.0;
        this.delta_last_time = time;

        for (const delta of this.fps_v) {

            if (this.delta_min > delta) {
                this.delta_min = delta;
                continue;
            }

            if (this.delta_max < delta) {
                this.delta_max = delta;
            }

        }

        return this.delta_time;

    }

    draw() {

        for (const [id, canvas] of this.offscreen) {
            this.ctx.drawImage(canvas.canvas, 0, 0);
        }

    }

    end() {

        if (
            this.loading.main &&
            this.wrap_alpha > 0
        ) {

            this.ctx.globalAlpha = this.wrap_alpha;
            this.ctx.fillStyle = "#191919";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


            this.wrap_alpha -= 0.001 * this.delta_time;

        }

        this.ctx.globalAlpha = 1.0;

        this.mdframe = false;
        this.muframe = false;
        if (this.canvas.style.cursor === this.cursor) return;
        this.canvas.style.cursor = this.cursor;
    }

}
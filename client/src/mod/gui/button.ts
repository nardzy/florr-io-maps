
import { Painter } from "../rendering/painter";
import { blend, darkened, lightened } from "../utility";

const PAD = 10;

export enum PositionAt {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
}

interface ButtonConfig {
    tooltip: string,
    size: number,
    position: PositionAt,
    color: string,
    icon: Path2D,
    content?: Content,
    rot?: boolean,
    fill: boolean,
    stroke: boolean,
    pad: number,
    toggle?: string,
    margin: number,
    onclick?: () => void
}

interface ContentConfig {
    width: number,
    height: number,
    toggles?: ToggleButton[],
    texts?: TextContent[]
}

interface ToggleConfig {
    text: string,
    callback: (bool: boolean) => void
    def: boolean
}

interface TextConfig {
    head: string,
    content: string
}

export class TextContent {

    head: string;
    content: string[];
    
    private head_size = 20;
    private content_size = 14;

    constructor(config: TextConfig) {
        this.head = config.head;
        this.content = config.content.split("\n");
    }

    render(painter: Painter, ctx: RenderingContext2D) {

        ctx.save();
        ctx.translate(2.5, PAD);

        ctx.font = `${this.head_size}px Game`;
        ctx.lineWidth = this.head_size * .11;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";

        ctx.strokeText(this.head, 0, 0);
        ctx.fillText(this.head, 0, 0);
        ctx.restore();

        ctx.font = `${this.content_size}px Game`;
        ctx.lineWidth = this.content_size * .125;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";

        ctx.translate(0, PAD);

        for (const text of this.content) {

            ctx.strokeText(text, PAD, this.content_size + 20);
            ctx.fillText(text, PAD, this.content_size + 20);
            ctx.translate(0, this.head_size);

        }

        ctx.translate(0, this.head_size + PAD);

    }

}

export class ToggleButton {

    private text: string;
    private callback: (bool: boolean) => void;
    active: boolean;

    size = 32;

    private path = new Path2D;

    color_def = "666666";
    color_act = "dddddd";
    color_v: number;

    stroke = darkened(this.color_def, .5);
    linew = this.size * .25;

    texts = this.size * .5;
    private pressed = false;

    constructor(config: ToggleConfig) {
        this.text = config.text;
        this.callback = config.callback;
        this.active = config.def;
        this.path.roundRect(0, 0, this.size, this.size, 3);
        this.color_v = this.active ? 1.0 : 0.0;
    }

    private update(collide: boolean, painter: Painter) {

        if (collide) {
            painter.set_cursor_style("pointer");

            if (painter.mdframe) {
                this.pressed = true;
                return;
            }

            if (painter.muframe && this.pressed) {
                this.pressed = false;
                this.active = !this.active;
                this.callback(this.active);
                return;
            }

            return;
        }

        this.pressed = false;

    }

    render(delta_time: number, painter: Painter, ctx: RenderingContext2D) {

        const collide = ctx.isPointInPath(
            this.path,
            painter.cursor_x,
            painter.cursor_y
        );

        this.update(collide, painter);

        const f = delta_time * 0.02;
        this.color_v += (
            (this.active ? 1.0 : 0.0) - this.color_v
        ) * f;

        const fill = blend(this.color_def, this.color_act, this.color_v);

        ctx.save();
        ctx.fillStyle = fill;
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = this.linew;
        ctx.fill(this.path);
        ctx.clip(this.path);
        ctx.stroke(this.path);
        ctx.restore();

        ctx.save();
        ctx.translate(this.size + PAD, this.size * .5);

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = this.texts * .125;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `${this.texts}px Game`;

        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);

        ctx.restore();

        ctx.translate(0, this.size + PAD);

    }

}

export class UserInterface {

    open = false;

    private buttons: Button[] = [];
    private position_len = new Map<PositionAt, number>;

    create(button: Button) {

        const i = this.position_len.get(button.position) ?? 0;

        button.index = this.buttons.length;
        button.index_pos = i;
        button.index_offset = i * (button.size + button.margin);
        this.buttons.push(button);

        this.position_len.set(button.position, i + 1);

    }

    render(delta_time: number, painter: Painter, ctx: RenderingContext2D) {

        this.open = false;

        for (const button of this.buttons) {

            if (!this.open && button.open) {
                this.open = true;
            }

            button.render(delta_time, painter, ctx);

        }

    }

    toggle(at: number, lazy?: boolean) {

        if (!lazy) {

            for (const button of this.buttons) {

                if (at === button.index) {
                    button.open = !button.open;
                    continue;
                }

                button.open = false;

            }

            return;
        }

        let open = false;

        for (const button of this.buttons) {

            if (at === button.index) continue;

            if (button.open) {
                button.open = false;
                open = true;
            }

        }

        if (open) return;

        const button = this.buttons.at(at);

        if (!button) return;

        button.open = !button.open;

    }

    shortcut(code: string) {

        for (const button of this.buttons) {

            if (!button.toggle) continue;
            
            const key = `Key${button.toggle}`;

            if (key !== code) continue;

            this.toggle(button.index);

            return true;

        }

        return false;

    }

}

export class Content {

    x: number;
    y: number;
    width: number;
    height: number;

    scroll = 0;
    private path = new Path2D;

    private alpha = 0;
    private linescl = 14;
    private font_size = 23;
    private toggles: ToggleButton[];
    private texts: TextContent[];

    constructor(config: ContentConfig) {

        this.width = config.width;
        this.height = config.height;
        this.x = -this.width;
        this.y = -this.height;
        this.toggles = config.toggles ?? [];
        this.texts = config.texts ?? [];
        this.path.roundRect(0, 0, this.width, this.height, 5);

    }

    private get_position(pos: PositionAt, s: number, open: boolean, offset: number): [x: number, y: number] {

        if (open) {

            switch (pos) {
                case PositionAt.TopLeft: {
                    return [
                        -this.x - offset,
                        s - this.y
                    ];
                }
                case PositionAt.TopRight: {
                    return [
                        0,
                        0
                    ];
                }
                case PositionAt.BottomLeft: {
                    return [
                        s - this.x,
                        -this.height + s - PAD - this.y + offset
                    ];
                }
                case PositionAt.BottomRight: {
                    return [
                        0,
                        0
                    ];
                }
            }
        }

        switch (pos) {
            case PositionAt.TopLeft: {
                return [
                    -this.width - s - this.x,
                    s - this.y
                ];
            }
            case PositionAt.TopRight: {
                return [
                    0,
                    0
                ];
            }
            case PositionAt.BottomLeft: {
                return [
                    s - this.x,
                    this.height - this.y
                ];
            }
            case PositionAt.BottomRight: {
                return [
                    0,
                    0
                ];
            }
        }

    }

    private update_alpha(f: number) {

        if (f < 0) {

            if (this.alpha > 0) {
                this.alpha += f;
                if (this.alpha < 0) {
                    this.alpha = 0;
                }
            }
            return;

        }

        if (this.alpha < 1) {
            this.alpha += f;
            if (this.alpha > 1) {
                this.alpha = 1;
            }
        }

    }

    private update(delta_time: number, parent: Button) {

        const f = Math.min(1, delta_time * (parent.open ? .02 : .01));

        const [
            x,
            y
        ] = this.get_position(
            parent.position,
            parent.content_y,
            parent.open,
            parent.index_offset
        );

        this.x += x * f;
        this.y += y * f;
        this.update_alpha(parent.open ? f : -f);

    }

    render(delta_time: number, painter: Painter, ctx: RenderingContext2D, parent: Button) {

        this.update(delta_time, parent);

        if (this.alpha === 0) {
            return false;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        const collide = ctx.isPointInPath(this.path, painter.cursor_x, painter.cursor_y);
        ctx.globalAlpha = this.alpha;

        ctx.fillStyle = parent.def_fill;
        ctx.strokeStyle = parent.stroke;
        ctx.lineWidth = this.linescl;

        ctx.fill(this.path);
        ctx.clip(this.path);
        ctx.stroke(this.path);

        ctx.translate(0, this.font_size + PAD);

        ctx.save();
        ctx.translate(this.width * .5, 0);
        ctx.lineWidth = this.font_size * .125;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${this.font_size}px Game`;
        ctx.letterSpacing = "0.5px";

        ctx.strokeText(parent.tooltip, 0, 0);
        ctx.fillText(parent.tooltip, 0, 0);
        ctx.restore();

        const x = PAD + 5;
        ctx.translate(x, this.font_size + x);

        for (let i = 0; i < this.texts.length; i++) {

            const text = this.texts[i];

            text.render(painter, ctx);

            ctx.lineWidth = 6;
            ctx.strokeStyle = parent.stroke;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.width - 50, 0);
            ctx.stroke();

            ctx.translate(0, x);

        }

        for (let i = 0; i < this.toggles.length; i++) {

            const toggle = this.toggles[i];
            toggle.render(delta_time, painter, ctx);

        }

        ctx.restore();

        return collide;

    }

}

export class Button {
    
    index = -1;
    index_pos = -1;

    x = 0;
    y = 0;
    rx: number;
    ry: number;
    rot = 0;
    size: number;
    icon: Path2D;
    rot_bool: boolean;
    position: PositionAt;
    toggle: string | null;

    path = new Path2D;
    color: string;

    private pressed = false;
    open = false;
    private collide = false;

    content: Content | null;

    def_fill: string;
    fill = "#ffffff";
    stroke = "#000000";

    use_fill: boolean;
    use_stroke: boolean;

    pad_icon: number;

    content_y: number;
    tooltip: string;

    index_offset = 0;
    margin = 0;

    onclick: (() => void) | null;

    constructor(config: ButtonConfig) {
        this.rx = -config.size;
        this.ry = -config.size;
        this.color = config.color.substring(1);
        this.size = config.size;
        this.icon = config.icon;
        this.rot_bool = !!config.rot;
        this.position = config.position;
        this.path.roundRect(0, 0, this.size, this.size, this.size * .1);
        this.content = config.content ?? null;
        this.content_y = this.size + PAD;
        this.def_fill = config.color;
        this.stroke = darkened(this.color, 0.185);
        this.use_fill = config.fill;
        this.use_stroke = config.stroke;
        this.pad_icon = config.pad;
        this.tooltip = config.tooltip;
        this.toggle = config.toggle ?? null;
        this.margin = config.margin;
        this.onclick = config.onclick ?? null;
    }

    /*private aabb(x: number, y: number) {
        return (
            x > this.rx &&
            x < this.size &&
            y > this.ry &&
            y < this.size
        )
    }*/
    
    private get_position(pos: PositionAt, w: number, h: number): [x: number, y: number] {

        this.index_pos * (this.size + PAD + 5)

        switch(pos) {
            case PositionAt.TopLeft: {
                return [
                    PAD + this.index_offset,
                    PAD
                ];
            }
            case PositionAt.TopRight: {
                return [
                    w - PAD - this.size,
                    PAD
                ];
            }
            case PositionAt.BottomLeft: {
                return [
                    PAD,
                    h - PAD - this.size - this.index_offset
                ];
            }
            case PositionAt.BottomRight: {
                return [
                    w - PAD - this.size,
                    h - PAD - this.size
                ];
            }
        }

    }

    private update(collide: boolean, collide_content: boolean, painter: Painter) {

        this.collide = collide;

        if (collide) {
            painter.set_cursor_style("pointer");

            if (painter.mdframe) {
                this.pressed = true;
                return;
            }

            if (painter.muframe && this.pressed) {
                this.pressed = false;

                if (this.content) this.open = !this.open;

                if (this.onclick) {
                    this.onclick();
                }

                return;
            }

            return;
        }

        this.pressed = false;

        if (painter.mdframe && this.open && !collide_content) {
            this.open = false;
        }

    }

    private update_rot(delta_time: number) {

        if (this.open || this.collide) {
            this.rot += 0.001 * delta_time;
            return;
        }

        this.rot += -this.rot * 0.01 * delta_time;

    }

    render(delta_time: number, painter: Painter, ctx: RenderingContext2D) {

        [
            this.x,
            this.y
        ] = this.get_position(
            this.position,
            painter.view_width,
            painter.view_height
        );

        const f = Math.min(1, delta_time * .02);
        this.rx += (this.x - this.rx) * f;
        this.ry += (this.y - this.ry) * f;

        ctx.save();
        ctx.translate(this.rx, this.ry);

        const collide = ctx.isPointInPath(this.path, painter.cursor_x, painter.cursor_y);
        const content_collide = this.content ?
        this.content.render(delta_time, painter, ctx, this) :
        false;

        this.update(collide, content_collide, painter);

        this.fill = lightened(this.color, this.pressed || this.open ? -0.1 : collide ? 0.05 : 0.0);

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = this.fill;
        ctx.strokeStyle = this.stroke;

        ctx.beginPath();
        ctx.lineWidth = this.size * .075;
        ctx.fill(this.path);
        ctx.stroke(this.path);

        ctx.save();

        const hsize = this.size * .5;
        const isize = this.size - this.pad_icon;

        ctx.translate(hsize, hsize);

        if (this.rot_bool) {
            this.update_rot(delta_time);
            ctx.rotate(this.rot);
        }

        ctx.scale(isize, isize);

        if (this.use_fill) {
            ctx.fillStyle = "#fff";
            ctx.fill(this.icon);
        }

        if (this.use_stroke) {
            ctx.lineWidth = 0.05;
            ctx.strokeStyle = "#fff";
            ctx.stroke(this.icon);
        }

        ctx.restore();

        if (this.toggle) {

            const text = `[${this.toggle}]`;
            const size = this.size * .225;

            ctx.save();

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = size * .15;
            ctx.letterSpacing = "0.25px";
            ctx.font = `${size}px Game`;

            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.translate(this.size - 3, this.size - 5);
            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);
            ctx.restore();

        }

        ctx.restore();

    }

}
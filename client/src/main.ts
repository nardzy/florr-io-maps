import { Room } from "./mod/asset/room";
import { Button, Content, PositionAt, TextContent, ToggleButton } from "./mod/gui/button";
import { BackGroundGl2 } from "./mod/rendering/background";
import { Painter } from "./mod/rendering/painter";
import { svg_to_path_2d } from "./mod/rendering/svg2sprite";
import { PaintId } from "./types/code";

import cog from "./mod/asset/svg/gui/gear-30.svg";
import expander from "./mod/asset/svg/gui/expander.svg";
import paper from "./mod/asset/svg/gui/scroll-unfurled.svg";
import discord from "./mod/asset/svg/gui/discord_icon.svg";
import github from "./mod/asset/svg/gui/github-mark.svg";
import { change_log } from "./mod/log/changelog";
import { check_mobile, darkened } from "./mod/utility";
import { RarityColor } from "./mod/rendering/colorget";
import { maps } from "./mod/asset/tilemap";
import { ToolTip } from "./mod/gui/tooltip";
import { difficulty_rate } from "./mod/asset/game/diffspawn";

const main = async () => {

    console.log(difficulty_rate(-5));

    //return;

    const room = new Room();

    await room.load();

    const painter = new Painter(
        [
            {
                id: PaintId.BackGround
            },
            {
                id: PaintId.Game
            },
            {
                id: PaintId.UI
            }
        ]
    );
    const background = new BackGroundGl2(
        painter.canvas.width,
        painter.canvas.height,
        room.sprites
    );

    painter.viewer.x = room.width * 0.5;
    painter.viewer.y = room.height * 0.5;
    painter.viewer.rx = room.width * 0.5;
    painter.viewer.ry = room.height * 0.5;

    painter.ui.create(
        new Button({
            size: 45,
            pad: 11,
            tooltip: "Settings",
            position: PositionAt.TopLeft,
            color: "#aaaaaa",
            icon: svg_to_path_2d(cog, 1024)!,
            fill: true,
            stroke: true,
            rot: true,
            margin: 10,
            content: new Content({
                width: 400,
                height: 200,
                toggles: [
                    new ToggleButton({
                        text: "Imo",
                        def: false,
                        callback: bool => {
                            alert("himo");
                        },
                    }),

                    new ToggleButton({
                        text: "Imoon",
                        def: false,
                        callback: bool => {
                            console.info("imo");
                        },
                    }),


                    new ToggleButton({
                        text: "ndskvn",
                        def: false,
                        callback: bool => {
                            console.info("imovn");
                        },
                    })
                ]
            })
        })
    );

    painter.ui.create(
        new Button({
            size: 45,
            pad: 15,
            tooltip: "Changelog",
            position: PositionAt.TopLeft,
            color: "#9bb56b",
            icon: svg_to_path_2d(paper, 512)!,
            fill: true,
            stroke: false,
            margin: 10,
            content: new Content({
                width: 400,
                height: 200,
                texts: [...change_log].flatMap(x => {

                    const [
                        head,
                        content
                    ] = x;

                    return new TextContent({ head, content });

                })
            })
        })
    );

    painter.ui.create(
        new Button({
            size: 45,
            pad: 17,
            tooltip: "Join our Discord community!",
            position: PositionAt.TopLeft,
            color: "#5865f2",
            icon: svg_to_path_2d(discord, 256)!,
            fill: true,
            stroke: false,
            margin: 10,
            onclick: () => {

                if (check_mobile()) {

                    const link = document.createElement("a");
                    link.href = "https://discord.gg/XYwpkNth29";
                    link.click();
                    return;

                }

                open("https://discord.gg/XYwpkNth29");

            }
        })
    );

    painter.ui.create(
        new Button({
            size: 45,
            pad: 15,
            tooltip: "View Github Repository!",
            position: PositionAt.TopLeft,
            color: "#555555",
            icon: svg_to_path_2d(github, 98)!,
            fill: true,
            stroke: false,
            margin: 10,
            onclick: () => {

                if (check_mobile()) {

                    const link = document.createElement("a");
                    link.href = "https://github.com/nardzy/florr-io-maps";
                    link.click();
                    return;

                }

                open("https://github.com/nardzy/florr-io-maps");

            }
        })
    );

    /*painter.ui.create(
        new Button({
            size: 60,
            pad: 20,
            tooltip: "Craft",
            position: PositionAt.BottomLeft,
            color: "#db9d5a",
            icon: svg_to_path_2d(vibrate, 512)!,
            fill: true,
            stroke: false,
            toggle: "C",
            margin: 15,
            content: new Content({
                width: 600,
                height: 700
            })
        })
    );

    painter.ui.create(
        new Button({
            size: 60,
            pad: 20,
            tooltip: "Talents",
            position: PositionAt.BottomLeft,
            color: "#db5a5a",
            icon: svg_to_path_2d(vibrate, 512)!,
            fill: true,
            stroke: false,
            toggle: "X",
            margin: 15,
            content: new Content({
                width: 600,
                height: 650
            })
        })
    );*/

    painter.ui.create(
        new Button({
            size: 60,
            pad: 20,
            tooltip: "Viewer",
            position: PositionAt.BottomLeft,
            color: "#8a34e0",
            icon: svg_to_path_2d(expander, 512)!,
            fill: true,
            stroke: false,
            toggle: "Z",
            margin: 15,
            content: new Content({
                width: 400,
                height: 850,

                toggles: [...maps.keys()].map(id => {

                    const button = new ToggleButton({
                        text: id,
                        def: localStorage.getItem("visited_map") === id,
                        callback: bool => {


                            room.select(id);
                            painter.tooltips.clear();

                        }
                    });

                    return button;

                })
            })
        })
    );

    addEventListener("resize", () => {

        painter.resize_to_screen();

        background.resize(
            painter.canvas.width,
            painter.canvas.height
        );

    });

    addEventListener("keydown", event => {

        if (painter.pressed.has(event.code)) return;

        painter.pressed.add(event.code);

        if (!painter.toggle.delete(event.code)) {
            painter.toggle.add(event.code);
        }

        if (event.code === "Escape") {
            painter.ui.toggle(0, true);
            return;
        }

        if (painter.ui.shortcut(event.code)) {
            return;
        }

    });
    addEventListener("keyup", event => {

        if (!painter.pressed.delete(event.code)) return;

    });
    addEventListener("mousemove", event => {

        const x = event.clientX * devicePixelRatio;
        const y = devicePixelRatio * event.clientY;

        if (painter.grab) {

            painter.viewer.x += (painter.cursor_x - x) / painter.viewer.fov_r;
            painter.viewer.y += (painter.cursor_y - y) / painter.viewer.fov_r;

            const x2 = Math.max(
                painter.camera_cx,
                Math.min(
                    room.width - painter.camera_cx,
                    painter.viewer.x
                )
            );
            const y2 = Math.max(
                painter.camera_cy,
                Math.min(
                    room.height - painter.camera_cy,
                    painter.viewer.y
                )
            );

            painter.viewer.x = x2;
            painter.viewer.y = y2;

        }

        painter.set_cursor_position(
            x,
            y,
            true
        );

    });
    addEventListener("mousedown", event => {

        if (event.button === 0) {
            painter.mdframe = true;
            painter.grab = true;
        }

    });
    addEventListener("mouseup", event => {

        if (event.button === 0) {
            painter.muframe = true;
            painter.grab = false;
        }

    });

    addEventListener("touchstart", event => {

        const touch = event.touches.item(
            0
        );

        if (!touch) return;

        painter.set_cursor_position(
            touch.clientX,
            touch.clientY
        );

        painter.mdframe = true;
        painter.grab = true;

    });
    addEventListener("touchend", event => {

        const touch = event.changedTouches.item(
            0
        );

        if (!touch) return;

        painter.set_cursor_position(
            touch.clientX,
            touch.clientY
        );

        painter.muframe = true;
        painter.grab = false;
        painter.last_pdist = 0.0;

    });
    addEventListener("touchmove", event => {

        const touch = event.changedTouches.item(
            0
        );

        if (!touch) return;

        const x = touch.clientX * devicePixelRatio;
        const y = devicePixelRatio * touch.clientY;

        if (event.touches.length === 2) {

            const a = event.touches.item(0)!;
            const b = event.touches.item(1)!;

            const x = a.clientX * devicePixelRatio;
            const y = a.clientY * devicePixelRatio;
            const x2 = b.clientX * devicePixelRatio;
            const y2 = b.clientY * devicePixelRatio;

            const dx = x - x2;
            const dy = y - y2;

            const dist = Math.sqrt(
                dx ** 2.0 +
                dy ** 2.0
            );

            const diff = dist - painter.last_pdist;

            const power = 1.0 + (!painter.last_pdist ? 0.0 : (
                diff
            ) * 0.005);

            painter.last_pdist = dist;

            painter.viewer.fov *= power;
            painter.viewer.fov = Math.max(0.1, painter.viewer.fov);
            painter.viewer.fov = Math.min(1, painter.viewer.fov);

            return;
            
            
        }

        if (painter.grab) {

            painter.viewer.x += (painter.cursor_x - x) / painter.viewer.fov_r;
            painter.viewer.y += (painter.cursor_y - y) / painter.viewer.fov_r;

            const x2 = Math.max(
                painter.camera_cx,
                Math.min(
                    room.width - painter.camera_cx,
                    painter.viewer.x
                )
            );
            const y2 = Math.max(
                painter.camera_cy,
                Math.min(
                    room.height - painter.camera_cy,
                    painter.viewer.y
                )
            );

            painter.viewer.x = x2;
            painter.viewer.y = y2;

        }

        painter.last_pdist = 0.0;

        painter.set_cursor_position(
            x,
            y,
            true
        );

    });
    addEventListener("wheel", event => {

        if (event.deltaY > 0.0) {
            painter.viewer.fov *= 0.5;
            painter.viewer.fov = Math.max(0.1, painter.viewer.fov);
        } else {
            painter.viewer.fov *= 2.0;
            painter.viewer.fov = Math.min(1, painter.viewer.fov);
        }

        if (event.ctrlKey) {
            return event.preventDefault();
        }

    }, {
        passive: false
    });
    addEventListener("load", () => {

        painter.loading.main = false;
        painter.loading.remove_status();

    });

    const render_loop = (time: number) => {

        const show_debug = painter.toggle.has("Quote");

        const delta_time = painter.frame(time, show_debug);
        painter.clear();
        painter.viewer.update(delta_time);

        {

            const bg_canvas = painter.get(PaintId.BackGround);

            if (!bg_canvas) throw new Error("cannot get bg_canvas.");

            const ctx = bg_canvas.ctx;

            painter.update_game_scale(painter.viewer.fov_r);

            const x = Math.max(
                painter.camera_cx,
                Math.min(
                    room.width - painter.camera_cx, painter.viewer.rx
                )
            );
            const y = Math.max(
                painter.camera_cy,
                Math.min(
                    room.height - painter.camera_cy, painter.viewer.ry
                )
            );

            painter.set_camera_position(
                x,
                y
            );

            background.render(
                painter.total_scale,
                painter.camera_x,
                painter.camera_y,
                painter.camera_width,
                painter.camera_height,
                room.gw,
                room.gh,
                room.wf,
                room.hf,
                room.tilewidth,
                room.tileheight,
                room.data.layers,
                room.data.tilesets[0].firstgid,
                //room.sprites
            );

            ctx.drawImage(background.canvas, 0, 0);

        }

        {


            const game_canvas = painter.get(PaintId.Game);

            if (!game_canvas) throw new Error("cannot get game_canvas.");

            const ctx = game_canvas.ctx;

            ctx.save();

            painter.scale_view(ctx);
            painter.scale_game(ctx);
            painter.camera_view(ctx);

            for (const s of room.special_sprites) {

                const sprite = room.sprites.get(s.id - room.data.tilesets[0].firstgid);

                if (!sprite) continue;

                ctx.save();
                ctx.translate(s.x, s.y);

                ctx.drawImage(sprite, 0, -s.height, s.width, s.height);

                ctx.restore();

            }

            const lw = 25;

            for (const spawner of room.mob_spawner) {

                ctx.save();
                ctx.translate(spawner.x, spawner.y);

                ctx.fillStyle = spawner.color;
                ctx.strokeStyle = darkened(spawner.color.substring(1), 0.2);
                ctx.lineWidth = lw;
                ctx.beginPath();

                const collision = ctx.isPointInPath(
                    spawner.points,
                    painter.cursor_x,
                    painter.cursor_y
                );

                ctx.globalAlpha = collision ? spawner.big ? 0.0 : 0.1 : 0.0;
                ctx.fill(spawner.points);
                ctx.globalAlpha = 1.0;
                ctx.stroke(spawner.points);

                ctx.restore();

                if (!collision) {
                    painter.tooltips.delete(spawner.id);
                    continue;
                }
                if (painter.tooltips.has(spawner.id)) continue;

                const contents: [string, string][] = [];

                if (!isNaN(spawner.difficulty)) contents.push(["difficulty:" + spawner.difficulty, "#fff"]);
                if (!isNaN(spawner.density)) contents.push(["density:" + spawner.density, "#fff"]);
                if (!isNaN(spawner.extra_spawn_delay)) contents.push(["extra_spawn_delay:" + spawner.extra_spawn_delay, "#facbcb"]);
                if (!isNaN(spawner.force_rarity)) contents.push(["force_rarity:" + spawner.force_rarity, "#facbcb"]);
                if (!isNaN(spawner.team)) contents.push(["team:" + spawner.team, "#facbcb"]);

                painter.tooltips.set(spawner.id, new ToolTip(
                    contents,
                    spawner.mobs
                ));

            }

            for (const check of room.check_points) {

                ctx.save();
                ctx.translate(check.x, check.y);

                ctx.fillStyle = "#ff00ff";
                ctx.strokeStyle = "#ff00ff";
                ctx.lineWidth = lw;
                ctx.beginPath();

                const collision = ctx.isPointInPath(
                    check.points,
                    painter.cursor_x,
                    painter.cursor_y
                );

                ctx.globalAlpha = collision ? 0.1 : 0.0;
                ctx.fill(check.points);
                ctx.globalAlpha = 1.0;
                ctx.stroke(check.points);

                ctx.restore();


                if (!collision) {
                    painter.tooltips.delete(check.id);
                    continue;
                }
                if (painter.tooltips.has(check.id)) continue;

                const contents: [string, string][] = [[
                    "checkpoint",
                    "#ccffcf"
                ]];

                if (!isNaN(check.level)) contents.push(["level:" + check.level, "#fff"]);

                painter.tooltips.set(check.id, new ToolTip(
                    contents,
                ));

            }

            ctx.restore();

        }

        {

            const ui_canvas = painter.get(PaintId.UI);

            if (!ui_canvas) throw new Error("cannot get ui_canvas.");

            const ctx = ui_canvas.ctx;

            ctx.save();

            painter.scale_view(ctx);

            const x = painter.cursor_rx;
            const y = painter.cursor_ry;
            
            const pad = 5;
            const width = 230;
            const height = 300;

            const x2 = x + (-painter.tooltips.size * width * .5);

            const rx = Math.max(pad, Math.min(x2, painter.view_width - (width + pad) * painter.tooltips.size));
            const ry = Math.max(pad, Math.min(y, painter.view_height - height - pad));
            
            ctx.save();
            ctx.translate(rx, ry);

            const rw = 50;
            const rh = 50;

            const bgpath = new Path2D;

            bgpath.roundRect(0, 0, rw, rh, 5);

            for (const [id, tooltip] of painter.tooltips) {

                ctx.save();
                ctx.fillStyle = "#000";
                ctx.globalAlpha = 0.2;

                ctx.beginPath();
                ctx.roundRect(0, 0, width, height, 10);
                ctx.fill();

                ctx.globalAlpha = 1.0;
                ctx.fillStyle = "#fff";
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.font = "20px GameMono";
                ctx.textAlign = "left";
                ctx.textBaseline = "top"; 

                ctx.translate(pad, pad);

                for (const [text, fill] of tooltip.contents) {

                    ctx.fillStyle = fill;
                    ctx.strokeText(text, 0, 0);
                    ctx.fillText(text, 0, 0);
                    ctx.translate(0, 20);

                }

                if (tooltip.mobs) {


                    ctx.lineWidth = rw * .15;
                    ctx.translate(0, pad);

                    let i = 0;
                    for (const id of tooltip.mobs) {

                        const sprite = room.mob_sprites.get(id);

                        if (!sprite) continue;

                        ctx.save();
                        ctx.fillStyle = RarityColor.Common;
                        ctx.strokeStyle = darkened(RarityColor.Common.substring(1), 0.2);

                        ctx.fill(bgpath);
                        ctx.clip(bgpath);

                        ctx.drawImage(sprite, 0, 0, rw, rh);

                        ctx.stroke(bgpath);
                        ctx.restore();
                        ctx.translate(rw + pad, 0);

                        i++;

                        if (i % 4 === 0) {
                            ctx.translate(-(rw + pad) * 4, rh + pad);
                        }

                    }

                }

                ctx.restore();

                ctx.translate(width + pad, 0);
            }
            ctx.restore();

            painter.ui.render(
                delta_time,
                painter,
                ctx
            );

            if (show_debug || painter.testlog) {

                ctx.fillStyle = "#fff";
                ctx.strokeStyle = "#000";
                ctx.globalAlpha = 1.0;

                const b = `${painter.canvas.width}x${painter.canvas.height} - ${painter.delta_min.toFixed(1)}/${delta_time.toFixed(1)}/${painter.delta_max.toFixed(1)} ms (min/avg/max) - ${painter.fps.toFixed(1)} fps`;

                ctx.save();
                ctx.translate(
                    painter.view_width - 8,
                    painter.view_height - 5
                );
                ctx.font = "11.75px Game";
                ctx.textBaseline = "bottom";
                ctx.textAlign = "right";
                ctx.lineWidth = 1.75;
                ctx.letterSpacing = "0.1px";
                ctx.strokeText(b, 0, 0);
                ctx.fillText(b, 0, 0);

                if (painter.testlog) {

                    const s = painter.testlog;

                    ctx.translate(
                        0,
                        -15
                    );

                    ctx.strokeText(s, 0, 0);
                    ctx.fillText(s, 0, 0);
                }

                ctx.restore();

            }

            ctx.restore();

        }

        painter.draw();
        painter.end();

        requestAnimationFrame(render_loop);

    };

    requestAnimationFrame(render_loop);

    painter.time = performance.now();

    console.info(painter);

};

main();
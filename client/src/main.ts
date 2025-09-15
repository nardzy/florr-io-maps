import { Room } from "./mod/asset/room";
import { Button, Content, PositionAt, TextContent, ToggleButton } from "./mod/gui/button";
import { BackGround } from "./mod/rendering/background";
import { Painter } from "./mod/rendering/painter";
import { svg_to_path_2d } from "./mod/rendering/svg2sprite";
import { PaintId } from "./types/code";

import cog from "./mod/asset/svg/gui/gear-30.svg";
import bag from "./mod/asset/svg/gui/swap-bag.svg";
import vibrate from "./mod/asset/svg/gui/vibrating-ball.svg";
import paper from "./mod/asset/svg/gui/scroll-unfurled.svg";
import discord from "./mod/asset/svg/gui/discord_icon.svg";
import github from "./mod/asset/svg/gui/github-mark.svg";
import { change_log } from "./mod/log/changelog";
import { PI2 } from "./mod/const";
import { check_mobile } from "./mod/utility";

const main = async () => {

    const room = new Room();

    await room.load();

    const painter = new Painter(
        [PaintId.Game, PaintId.Title, PaintId.UI]
    );
    const background = new BackGround(
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
            tooltip: "Inventory",
            position: PositionAt.BottomLeft,
            color: "#5a9fdb",
            icon: svg_to_path_2d(bag, 512)!,
            fill: true,
            stroke: false,
            toggle: "Z",
            margin: 15,
            content: new Content({
                width: 400,
                height: 600
            })
        })
    );

    // import data
    /*window.showOpenFilePicker().then(x => console.log(x[0].getFile().then(x => x.text().then(x => {

        if (x.length !== 2047) {
            alert("invalid data");
            return;
        }

        const a = new Uint8Array(x.length);

        for (let i = 0; i < x.length; i++) {
            a[i] = x.charCodeAt(i);
        }

        console.log(a);

    }))));*/

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

    });
    addEventListener("touchmove", event => {

        const touch = event.changedTouches.item(
            0
        );

        if (!touch) return;

        const x = touch.clientX * devicePixelRatio;
        const y = devicePixelRatio * touch.clientY;

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
    addEventListener("wheel", event => {

        if (event.deltaY > 0.0) {
            painter.viewer.fov *= 0.5;
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

        const c = painter.ctx;

        (() => {

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
                room.data.layers,
                room.data.tilesets[0].firstgid,
                room.data.tilewidth,
                room.data.tileheight
            );

            c.drawImage(background.canvas, 0, 0);

        })();

        (() => {

            const ui_canvas = painter.get(PaintId.UI);

            if (!ui_canvas) throw new Error("cannot get ui_canvas.");

            const ctx = ui_canvas.ctx;

            ctx.save();

            painter.scale_view(ctx);

            painter.ui.render(
                delta_time,
                painter,
                ctx
            );

            if (show_debug) {

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
                ctx.restore();

            }

            ctx.restore();

        })();

        painter.draw();
        painter.end();

        requestAnimationFrame(render_loop);

    };

    requestAnimationFrame(render_loop);

    painter.time = performance.now();

    console.info(painter);

};

main();
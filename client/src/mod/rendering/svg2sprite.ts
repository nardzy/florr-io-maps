import { PI2 } from "../const";

export const svg_to_path_2d = (
    svg: string,
    size: number
) => {

    const s = document.createElement("div");
    s.innerHTML = svg;

    const temp = document.createElement("div");
    temp.innerHTML = svg;

    const el = s.getElementsByTagName("svg").item(0);

    if (!el) return null;

    const [x, y] = (() => {

        const view = el.getAttribute("viewBox")
            ?.split(" ")
            .map(x => Number(x));

        if (!view) return [0, 0];

        return view;
        
    })();

    const paths = s.querySelectorAll("path");

    for (const path of paths) {

        const d = path.getAttribute("d");
        if (!d) continue;

        const f = 1 / size;
        const s = size * f;

        const x2 = x / size;
        const y2 = y / size;

        const p2d = new Path2D;
        const hsize = -s * .5;

        p2d.addPath(
            new Path2D(d),
            new DOMMatrix([f, 0, 0, f, hsize - x2, hsize - y2])
        );

        return p2d;

    }

    return null;

};

const valid = (p: string) => {
    return p !== "none";
};

export const svg_to_canvas = (
    svg: string,
    width: number,
    height: number
) => {

    const temp = document.createElement("div");
    temp.innerHTML = svg;

    const s = temp.firstElementChild;

    if (!(s instanceof SVGElement)) return null;

    const view = s.getAttribute("viewBox")
        ?.split(" ")
        .map(x => Number(x)) ?? [
            0,
            0,
            Number(s.getAttribute("width")),
            Number(s.getAttribute("height"))
        ];

    const [
        x,
        y,
        w,
        h
    ] = view;

    const canvas = new OffscreenCanvas(
        width,
        height
    );
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.save();
    ctx.scale(
        width / w,
        height / h
    );

    const wirte = (
        t: Element
    ) => {

        const opacity = t.getAttribute("stroke-opacity") ?? t.getAttribute("fill-opacity") ?? t.getAttribute("opacity") ?? "none";
        const fill = t.getAttribute("fill") ?? "#000000";
        const stroke = t.getAttribute("stroke") ?? "none";
        const line_width = t.getAttribute("stroke-width") ?? "none";
        const line_cap = t.getAttribute("stroke-linecap") ?? "none";
        const line_join = t.getAttribute("stroke-linejoin") ?? "none";
        const miter_limit = t.getAttribute("stroke-miterlimit") ?? "none";

        ctx.save();

        ctx.fillStyle = fill;
        if (valid(opacity)) ctx.globalAlpha = Number(opacity);
        if (valid(stroke)) ctx.strokeStyle = stroke;
        if (valid(line_width)) ctx.lineWidth = Number(line_width);
        if (valid(line_cap)) ctx.lineCap = line_cap as CanvasLineCap;
        if (valid(line_join)) ctx.lineJoin = line_join as CanvasLineJoin;
        if (valid(miter_limit)) ctx.miterLimit = Number(miter_limit);

        switch (t.tagName) {
            case "rect": {

                const x = Number.parseInt(
                    t.getAttribute("x") ?? "0"
                );
                const y = Number.parseInt(
                    t.getAttribute("y") ?? "0"
                );
                const width = Number.parseInt(
                    t.getAttribute("width") ?? "0"
                );
                const height = Number.parseInt(
                    t.getAttribute("height") ?? "0"
                );

                if (valid(fill)) ctx.fillRect(x, y, width, height);
                if (valid(stroke)) ctx.stroke();
                break;
            }
            case "path": {

                const d = t.getAttribute("d");
                if (!d) break;

                const p2d = new Path2D(d);

                if (valid(fill)) {
                    ctx.fill(p2d);
                }
                if (valid(stroke)) {
                    ctx.stroke(p2d);
                }

                break;
            }
            case "polyline": {

                /*
                <polyline fill="#69462e" points="128,0 128,5.6 150.18,38.13 149.74,86.87 125.45,122.06 114.74,138.37 75.09,126.33 49.69,126.99 
    18.33,139.8 5,128 0,128 0,0 "/>
                */

                const points = t.getAttribute("points")
                    ?.split(" ")
                    ?.map(x => x.split(",").map(x => Number(x)));
                if (!points) break;

                let first = true;

                ctx.beginPath();

                for (const [x, y] of points) {

                    if (first) {
                        ctx.moveTo(x, y);
                        first = false;
                        continue;
                    }
                    ctx.lineTo(x, y);

                }

                if (valid(fill)) ctx.fill();
                if (valid(stroke)) ctx.stroke();

                break;
            }
            case "polygon": {

                const points = t.getAttribute("points")
                    ?.split(" ")
                    ?.map(x => x.split(",").map(x => Number(x)));
                if (!points) break;

                let first = true;

                ctx.beginPath();

                for (const [x, y] of points) {

                    if (first) {
                        ctx.moveTo(x, y);
                        first = false;
                        continue;
                    }
                    ctx.lineTo(x, y);

                }

                ctx.closePath();

                if (valid(fill)) ctx.fill();
                if (valid(stroke)) ctx.stroke();

                break;
            }
            case "circle": {

                const x = Number.parseInt(
                    t.getAttribute("cx") ?? "0"
                );
                const y = Number.parseInt(
                    t.getAttribute("cy") ?? "0"
                );
                const radius = Number.parseInt(
                    t.getAttribute("r") ?? "0"
                );

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, PI2);
                if (valid(fill)) ctx.fill();
                if (valid(stroke)) ctx.stroke();

                break;
            }
            case "ellipse": {

                const x = Number.parseInt(
                    t.getAttribute("cx") ?? "0"
                );
                const y = Number.parseInt(
                    t.getAttribute("cy") ?? "0"
                );
                const rx = Number.parseInt(
                    t.getAttribute("rx") ?? "0"
                );
                const ry = Number.parseInt(
                    t.getAttribute("ry") ?? "0"
                );

                ctx.beginPath();
                ctx.ellipse(x, y, rx, ry, 0, 0, PI2);
                if (valid(fill)) ctx.fill();
                if (valid(stroke)) ctx.stroke();

                break;
            }
            default:
                break;
        }
        ctx.restore();

    };

    const clip_paths: Map<string, Path2D> = new Map();

    for (const clip of s.getElementsByTagName("clipPath")) {
        
        for (const p of clip.children) {

            const path = p.getAttribute("d");
            if (!path) continue;
            const p2d = new Path2D(path);

            clip_paths.set(`url(#${clip.id})`, p2d);

        }

    }

    const loop = (elem: Element) => {

        for (const t of elem.children) {

            wirte(t);

            if (t.tagName === "g") {

                ctx.save();

                const clip_path = clip_paths.get(
                    t.getAttribute("clip-path") ?? ""
                );

                if (clip_path) {
                    ctx.clip(clip_path);
                }

                loop(t);

                ctx.restore();

            }

        }

    };

    loop(s);

    ctx.restore();

    return canvas;

};
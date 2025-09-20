import vert_source from "./glsl/background.vert";
import frag_source from "./glsl/background.frag";
import { clamp2 } from "../utility";
import { FLIP_HORIZONTAL, FLIP_VERTICAL, FLIP_DIAGONAL } from "../const";
import { TiledLayer } from "../asset/tiled";

export class BackGroundGl2 {

    canvas = new OffscreenCanvas(1, 1);
    private gl: WebGL2RenderingContext;

    private textures: Map<number, WebGLTexture> = new Map;
    private resolution!: WebGLUniformLocation | null;
    private hori!: WebGLUniformLocation | null;
    private vert!: WebGLUniformLocation | null;
    private diag!: WebGLUniformLocation | null;
    private data!: WebGLUniformLocation | null;
    private offset!: WebGLUniformLocation | null;

    constructor(
        width: number,
        height: number,
        sprites: Map<number, OffscreenCanvas>
    ) {

        const gl = this.canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("Your browser does not supporing webgl2.");
        }

        this.gl = gl;
        this.setup(sprites);
        this.resize(width, height);

    }

    private setup(sprites: Map<number, OffscreenCanvas>) {

        const gl = this.gl;

        const vertex = gl.createShader(gl.VERTEX_SHADER);
        if (!vertex) throw new Error("Vertex Error");

        gl.shaderSource(vertex, vert_source);
        gl.compileShader(vertex);

        const fragment = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragment) throw new Error("Fragment Error");

        gl.shaderSource(fragment, frag_source);
        gl.compileShader(fragment);

        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.useProgram(program);

        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        const vbo = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        const ibo = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            0, 1, 2,
            1, 2, 3
        ]), gl.STATIC_DRAW);

        this.resolution = gl.getUniformLocation(program, "resolution");
        this.hori = gl.getUniformLocation(program, "hori");
        this.vert = gl.getUniformLocation(program, "vert");
        this.diag = gl.getUniformLocation(program, "diag");
        this.data = gl.getUniformLocation(program, "data");
        this.offset = gl.getUniformLocation(program, "offset");

        for (const [id, sprite] of sprites) {

            const texture = gl.createTexture();
            
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                sprite
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            this.textures.set(id, texture);

        }

    }

    resize(width: number, height: number) {

        const gl = this.gl;

        this.canvas.width = width;
        this.canvas.height = height;
        gl.viewport(0, 0, width, height);

        gl.uniform2f(
            this.resolution,
            width,
            height
        );

    }

    render(

        scale: number,

        x: number,
        y: number,
        w: number,
        h: number,

        gw: number,
        gh: number,
        wf: number,
        hf: number,

        width: number,
        height: number,

        layers: TiledLayer[],
        first_id: number

    ) {

        const max_x = clamp2(gw - 1, (x + w) * wf | 0);
        const min_x = clamp2(gw - 1, x * hf | 0);
        const max_y = clamp2(gh - 1, (y + h) * wf | 0);
        const min_y = clamp2(gh - 1, y * hf | 0);

        const gl = this.gl;

        gl.uniform3f(
            this.offset,
            x,
            y,
            scale
        );

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (let x = min_x; x <= max_x; x++) {

            for (let y = min_y; y <= max_y; y++) {

                const index = x + y * gw;
                for (const layer of layers) {

                    if (!layer.data) continue;

                    const tid = Number(layer.data[index]);

                    if (tid === 0) continue;

                    const hori = (tid & FLIP_HORIZONTAL) !== 0;
                    const vert = (tid & FLIP_VERTICAL) !== 0;
                    const diag = (tid & FLIP_DIAGONAL) !== 0;

                    const id = tid & ~(
                        FLIP_HORIZONTAL |
                        FLIP_VERTICAL |
                        FLIP_DIAGONAL
                    );

                    const texture = this.textures.get(id - first_id);

                    if (!texture) continue;

                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    gl.uniform1ui(this.hori, hori ? 1 : 0);
                    gl.uniform1ui(this.vert, vert ? 1 : 0);
                    gl.uniform1ui(this.diag, diag ? 1 : 0);

                    gl.uniform4f(
                        this.data,
                        x,
                        y,
                        width,
                        height
                    );

                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

                }

            }
        }

        gl.flush();
        
    }

}

export class BackGround2D {

    canvas = new OffscreenCanvas(1, 1);
    ctx: RenderingContext2D;
    renderset = new Set<number>;

    constructor(
        width: number,
        height: number
    ) {

        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("ctxttttxttxct");
        }

        this.ctx = ctx;
        this.resize(width, height);

    }

    resize(width: number, height: number) {

        this.canvas.width = width;
        this.canvas.height = height;
        this.renderset.clear();

    }

    render(

        scale: number,
        x: number,
        y: number,
        w: number,
        h: number,

        gw: number,
        gh: number,
        wf: number,
        hf: number,

        width: number,
        height: number,

        layers: TiledLayer[],
        first_id: number,

        sprites: Map<number, OffscreenCanvas>

    ) {

        const max_x = clamp2(gw - 1, (x + w) * wf | 0);
        const min_x = clamp2(gw - 1, x * hf | 0);
        const max_y = clamp2(gh - 1, (y + h) * wf | 0);
        const min_y = clamp2(gh - 1, y * hf | 0);

        const ctx = this.ctx;

        const renderkeys = new Set(this.renderset.keys());

        for (let x = min_x; x <= max_x; x++) {

            for (let y = min_y; y <= max_y; y++) {

                const index = x + y * gw;

                if (this.renderset.has(index)) {
                    renderkeys.delete(index);
                    continue;
                }

                for (const layer of layers) {

                    if (!layer.data) continue;

                    const tid = Number(layer.data[index]);

                    if (tid === 0) continue;

                    const hori = (tid & FLIP_HORIZONTAL) !== 0;
                    const vert = (tid & FLIP_VERTICAL) !== 0;
                    const diag = (tid & FLIP_DIAGONAL) !== 0;

                    const id = tid & ~(
                        FLIP_HORIZONTAL |
                        FLIP_VERTICAL |
                        FLIP_DIAGONAL
                    );

                    const sprite = sprites.get(id - first_id);

                    if (!sprite) continue;

                    const x2 = x * width;
                    const y2 = y * height;

                    const cw = width * .5;
                    const ch = height * .5;

                    ctx.save();
                    ctx.translate(
                        x2 + cw,
                        y2 + ch
                    );

                    const fox = hori ? -1 : 1;
                    const f_y = vert ? -1 : 1;

                    if (diag) {

                        ctx.rotate(Math.PI * .5);
                        ctx.scale(f_y, -fox);

                    } else {

                        ctx.scale(fox, f_y);

                    }

                    ctx.drawImage(
                        sprite,
                        -cw,
                        -ch,
                        width,
                        height
                    );
                    ctx.restore();

                }

                //this.renderset.add(index);

            }
        }

        for (const del of renderkeys) {
            this.renderset.delete(del);
        }

    }

}
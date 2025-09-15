
export const sleep = (
    time: number
) => new Promise(
    res => {
        setTimeout(res, time)
    }
);

export const clamp2 = (x: number, min: number) => {
    return Math.min(min, Math.max(0, x));
}

export const darkened = (base: string, v: number) => {

    const x = Number.parseInt(base, 16);
    const f = 1 - v;
    const r = (x >>> 16) & 255;
    const g = (x >>> 8) & 255;
    const b = x & 255;
    const out_r = r * f | 0;
    const out_g = g * f | 0;
    const out_b = b * f | 0;
    const blend = (out_r << 16) | (out_g << 8) | out_b;
    const s = blend.toString(16);

    return `#${s.padStart(6, "0")}`;

};

export const lightened = (base: string, v: number) => {

    const x = Number.parseInt(base, 16);
    const f = 1 + v;
    const r = (x >>> 16) & 255;
    const g = (x >>> 8) & 255;
    const b = x & 255;
    const out_r = r * f | 0;
    const out_g = g * f | 0;
    const out_b = b * f | 0;
    const blend = (out_r << 16) | (out_g << 8) | out_b;
    const s = blend.toString(16);

    return `#${s.padStart(6, "0")}`;

};

export const blend = (base: string, ride: string, v: number) => {

    const x = Number.parseInt(base, 16);
    const x2 = Number.parseInt(ride, 16);

    const r = (x >>> 16) & 255;
    const g = (x >>> 8) & 255;
    const b = x & 255;

    const r2 = (x2 >>> 16) & 255;
    const g2 = (x2 >>> 8) & 255;
    const b2 = x2 & 255;

    const rd = r2 - r;
    const gd = g2 - g;
    const bd = b2 - b;

    const out_r = Math.min(255, r + rd * v);
    const out_g = Math.min(255, g + gd * v);
    const out_b = Math.min(255, b + bd * v);

    const blend = (out_r << 16) | (out_g << 8) | out_b;
    const s = blend.toString(16);

    return `#${s.padStart(6, "0")}`;

}

export const easein = (n: number) => {

    const ext = n > .5 ? (
        .5 - ((1 - n) ** 2)
    ) : n ** 2;

    return ext * 2.0;

};


export const check_mobile = () => {

    if (navigator.userAgentData?.mobile) {
        return true;
    }

    return !!navigator.userAgent.includes("Mobile");

};
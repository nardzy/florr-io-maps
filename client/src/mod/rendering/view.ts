export class ViewEntity {

    x = 0;
    y = 0;
    rx = 0;
    ry = 0;
    fov = 1;
    fov_r = 100;

    update(delta_time: number) {

        const rate = Math.min(1, delta_time * 0.01);

        this.rx += (this.x - this.rx) * rate;
        this.ry += (this.y - this.ry) * rate;
        this.fov_r += (this.fov - this.fov_r) * rate;

    }
    
}
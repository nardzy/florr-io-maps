export class ViewEntity {

    x = 0;
    y = 0;
    rx = 0;
    ry = 0;
    fov = 1;
    fov_r = 1;

    update(delta_time: number) {

        const rate = Math.max(1, delta_time * 0.01);

        this.rx += (this.x - this.rx) * rate * 0.1;
        this.ry += (this.y - this.ry) * rate * 0.1;
        this.fov_r += (this.fov - this.fov_r) * rate * 0.1;

    }
    
}
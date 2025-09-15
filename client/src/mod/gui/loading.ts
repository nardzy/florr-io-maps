
export class Loading {
    main: boolean;
    socket: boolean;

    constructor() {

        this.main = document.readyState === "complete";
        this.socket = true;

        this.main && this.remove_status();

    }

    remove_status() {
        document.querySelector("#status")?.remove();
    }

}
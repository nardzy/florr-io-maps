
export class Mob {

    constructor(
        public id: number,
        public perc: number
    ) {

    }

}

export class ToolTip {

    constructor(
        public contents: [string, string][],
        public mobs?: number[]
    ) {

    }

    render() {

        

    }

}
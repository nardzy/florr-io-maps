
export enum PaintId {
    BackGround,
    Game,
    Title,
    UI
}

export interface PaintConfig {
    frame?: boolean
}

export interface PaintArg {
    id: PaintId,
    config?: PaintConfig
}
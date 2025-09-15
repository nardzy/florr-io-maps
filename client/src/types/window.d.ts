interface Brand {
    brand: string,
    version: string
}

interface NavigatorUAData {
    brands: Brand[],
    mobile: boolean,
    platform: string
}

interface Navigator {
    userAgentData?: NavigatorUAData
}

/*interface FlorrUtils {

    get_petals: () => Map<number, PetalData>
    get_mobs: () => Map<number, MobData>
    darkened: (base: string, v: number) => string
    lightened: (base: string, v: number) => string

}

interface Florrio {
    utils: FlorrUtils
}

interface Window {
    florrio: Florrio
}*/
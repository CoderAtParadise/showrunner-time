import { IClockSource } from "./IClockSource.js";

export interface ClockManager {
    play: (id: string) => void;
    pause: (id: string) => void;
    stop: (id: string) => void;
    reset: (id: string) => void;
    setTime: (id: string, time: string) => void;
    request: (id: string) => IClockSource<any>;
    list: () => string[];
    add: (clock: IClockSource<any>) => void;
    update: (id:string,settings: object) => object;
}

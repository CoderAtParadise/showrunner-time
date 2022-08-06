import EventEmitter from "events";
import { ClockLookup, IClockSource } from "./IClockSource.js";

export interface ClockManager {
    id: () => string;
    play: (id: string) => boolean;
    pause: (id: string) => boolean;
    stop: (id: string) => boolean;
    reset: (id: string) => boolean;
    setTime: (id: string, time: string) => boolean;
    request: (id: string) => IClockSource;
    list: () => ClockLookup[];
    add: (clock: IClockSource) => boolean;
    remove: (id:string) => boolean;
    update: (id: string, settings: object) => object;
    eventHandler: () => EventEmitter;
}

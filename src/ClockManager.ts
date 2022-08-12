import EventEmitter from "events";
import { ClockLookup, IClockSource } from "./IClockSource.js";
import { SMPTE } from "./SMPTE.js";

export interface ClockManager {
    id: () => string;
    play: (id: ClockLookup) => Promise<boolean>;
    pause: (id: ClockLookup) => Promise<boolean>;
    stop: (id: ClockLookup) => Promise<boolean>;
    reset: (id: ClockLookup, override: boolean) => Promise<boolean>;
    setTime: (id: ClockLookup, time: SMPTE) => Promise<boolean>;
    request: (id: ClockLookup) => IClockSource;
    list: () => ClockLookup[];
    add: (clock: IClockSource<any>) => boolean;
    remove: (id: ClockLookup) => boolean;
    update: (id: ClockLookup, settings: object) => object;
    eventHandler: () => EventEmitter;
}

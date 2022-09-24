import { IDispatcher } from "@coderatparadise/showrunner-network";
import { ClockLookup, IClockSource } from "./IClockSource.js";
import { SMPTE } from "./SMPTE.js";

export interface IClockManager<T = unknown> extends IDispatcher {
    id: () => string;
    name: () => string;
    cue: (id: ClockLookup) => Promise<boolean>;
    uncue: (id: ClockLookup) => Promise<boolean>;
    play: (id: ClockLookup) => Promise<boolean>;
    pause: (id: ClockLookup, override: boolean) => Promise<boolean>;
    stop: (id: ClockLookup, override: boolean) => Promise<boolean>;
    recue: (id: ClockLookup, override: boolean) => Promise<boolean>;
    setTime: (id: ClockLookup, time: SMPTE) => Promise<boolean>;
    request: (id: ClockLookup) => IClockSource<T> | undefined;
    list: () => ClockLookup[];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    add: (clock: IClockSource<any>) => boolean;
    remove: (id: ClockLookup) => boolean;
    startUpdating: (updateFunction: () => Promise<void>) => void;
    stopUpdating: (updateFunction: () => Promise<void>) => void;
    update: () => void;
}

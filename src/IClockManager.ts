import { IDispatcher } from "@coderatparadise/showrunner-network";
import { IClockSource } from "./IClockSource.js";
import { ClockIdentifier, ClockLookup } from "./identifier/ClockIdentifier.js";
import { ManagerIdentifier } from "./identifier/ManagerIdentifier.js";
import { SMPTE } from "./SMPTE.js";

export interface IClockManager<T = unknown> extends IDispatcher {
    identifier: () => ManagerIdentifier;
    name: () => string;
    cue: (id: ClockIdentifier) => Promise<boolean>;
    uncue: (id: ClockIdentifier) => Promise<boolean>;
    play: (id: ClockIdentifier) => Promise<boolean>;
    pause: (id: ClockIdentifier, override: boolean) => Promise<boolean>;
    stop: (id: ClockIdentifier, override: boolean) => Promise<boolean>;
    recue: (id: ClockIdentifier, override: boolean) => Promise<boolean>;
    setTime: (id: ClockIdentifier, time: SMPTE) => Promise<boolean>;
    request: (id: ClockIdentifier) => IClockSource<T> | undefined;
    chapters: (id: ClockIdentifier) => Promise<ClockIdentifier[]>;
    addChapter: (id: ClockIdentifier, chapter: ClockIdentifier) => Promise<boolean>;
    removeChapter: (id: ClockIdentifier, chapter: ClockIdentifier) => Promise<boolean>;
    list: (filter: string | string[]) => ClockLookup[];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    add: (clock: IClockSource<any>) => boolean;
    remove: (id: ClockLookup) => boolean;
    startUpdating: (
        id: ClockIdentifier,
        updateFunction: () => Promise<void>
    ) => void;
    stopUpdating: (id: ClockIdentifier) => void;
    update: () => void;
    _sortChapters?: (id:ClockIdentifier) => void;
}

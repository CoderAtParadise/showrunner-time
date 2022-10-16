import { ClockStatus, ControlBar } from "../../IClockSource.js";

export type CurrentClockState = {
    time: string;
    status: ClockStatus;
    overrun: boolean;
    incorrectFrameRate: boolean;
};

export type AdditionalData = {
    data: object;
    duration: string;
    frameRate: number;
    name: string;
    controlBar: ControlBar[];
};

export type CreateStructure = {
    name: string;
    type: string;
};

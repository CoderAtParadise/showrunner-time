import { ClockStatus, ControlBar } from "../../IClockSource.js";

export type CurrentClockState = {
    current: string;
    status: ClockStatus;
    overrun: boolean;
    incorrectFrameRate: boolean;
  }
  
  export type AdditionalData = {
    data: object;
    duration: string;
    frameRate: number;
    name: string;
    controlBar: ControlBar[];
  }
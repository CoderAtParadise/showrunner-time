import { registerCodec } from "@coderatparadise/showrunner-network/codec";
import {
    CurrentClockState,
    AdditionalData,
    CreateStructure
} from "./sync/DataStructures.js";
import { ClockDataCodec } from "./sync/ClockDataCodec.js";
import { ClockCurrentStateCodec } from "./sync/ClockCurrentStateCodec.js";
import { ClockConfigCodec } from "./sync/ClockConfigCodec.js";
import { ClockCreateCodec } from "./sync/ClockCreateCodec.js";
import { ClockIdentifierCodec } from "./io/ClockIdentiferCodec.js";

export function registerCodecs(): void {
    registerCodec("sync_clock_data", ClockDataCodec);
    registerCodec("sync_clock_config", ClockConfigCodec);
    registerCodec("sync_clock_current", ClockCurrentStateCodec);
    registerCodec("sync_clock_create", ClockCreateCodec);
    registerCodec("io_clock_identifier", ClockIdentifierCodec);
}

export type { CurrentClockState, AdditionalData, CreateStructure };

export {
    ClockIdentifierCodec,
    ClockDataCodec,
    ClockConfigCodec,
    ClockCurrentStateCodec,
    ClockCreateCodec
};

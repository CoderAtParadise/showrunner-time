import { registerCodec } from "@coderatparadise/showrunner-network/codec";
import {
    CurrentClockState,
    AdditionalData,
    CreateStructure
} from "./sync/DataStructures.js";
import { ClockDataCodec } from "./sync/ClockDataCodec.js";
import { CurrentClockStateCodec } from "./sync/CurrentClockStateCodec.js";
import { ClockConfigCodec } from "./sync/ClockConfigCodec.js";
import { CreateClockCodec } from "./sync/CreateClockCodec.js";

export function registerCodecs(): void {
    registerCodec("sync_clock_data", new ClockDataCodec());
    registerCodec("sync_clock_config", ClockConfigCodec);
    registerCodec("sync_clock_current", CurrentClockStateCodec);
    registerCodec("sync_clock_create", CreateClockCodec);
}

export type { CurrentClockState, AdditionalData, CreateStructure };

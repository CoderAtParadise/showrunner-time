import {
    Codec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { IClockSource } from "../../IClockSource.js";
import { CurrentClockState } from "./DataStructures.js";

export const CurrentClockStateCodec: Codec<IClockSource> = {
    serialize(obj: IClockSource): serializeTypes {
        return {
            time: obj.current().toString(),
            status: obj.status(),
            overrun: obj.isOverrun(),
            incorrectFrameRate: obj.hasIncorrectFrameRate()
        };
    },
    deserialize(json: serializeTypes, obj?: IClockSource): IClockSource {
        if (!obj) throw Error("Failed to deserialize due to missing clock");
        obj._syncState(json as CurrentClockState);
        return obj;
    }
};

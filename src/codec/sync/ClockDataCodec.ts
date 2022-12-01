import {
    Codec,
    getCodec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { IClockSource } from "../../IClockSource.js";
import { AdditionalData } from "./DataStructures.js";

export const ClockDataCodec: Codec<IClockSource> = {
    serialize(obj: IClockSource): serializeTypes {
        const codec = getCodec(
            `sync_clock_data_${obj.identifier().type()}`);
        let data = {};
        if (codec !== undefined) data = codec.serialize(obj.data()) as object;
        return {
            duration: obj.duration(),
            frameRate: obj.frameRate(),
            name: obj.name(),
            data: data
        };
    },
    deserialize(json: serializeTypes, obj?: IClockSource): IClockSource {
        if (!obj) throw Error("Failed to deserialize due to missing clock");
        if (obj._syncData) obj._syncData(json as AdditionalData);
        return obj;
    }
};

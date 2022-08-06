import {
    Codec,
    getCodec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { IClockSource } from "../../IClockSource.js";
import { AdditionalData } from "./DataStructures.js";

export class ClockDataCodec implements Codec<IClockSource> {
    serialize(obj: IClockSource): serializeTypes {
        const codec = getCodec(
            `sync_clock_data_${obj.identifier().type}`,
            false
        );
        let data = {};
        if (codec !== undefined) data = codec.serialize(obj) as object;
        return {
            duration: obj.duration().toString(),
            frameRate: obj.frameRate(),
            name: obj.name(),
            controlBar: obj.controlBar(),
            ...data
        };
    }
    deserialize(json: serializeTypes, obj?: IClockSource): IClockSource {
        if (!obj) throw Error("Failed to deserialize due to missing clock");
        obj._syncData(json as AdditionalData);
        return obj;
    }
}
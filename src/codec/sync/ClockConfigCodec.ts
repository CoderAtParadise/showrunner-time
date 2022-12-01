import {
    Codec,
    getCodec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { BaseClockConfig, IClockSource } from "../../IClockSource.js";

export const ClockConfigCodec: Codec<IClockSource> = {
    serialize(obj: IClockSource): serializeTypes {
        const codec = getCodec(
            `sync_clock_config_${obj.identifier().type()}`
        );
        let config = {};
        if (codec !== undefined) config = codec.serialize(obj) as object;
        return {
            name: obj.config().name,
            blacklist: obj.config().blackList,
            ...config
        };
    },

    deserialize(json: serializeTypes, obj?: IClockSource): IClockSource {
        if (!obj) throw Error("Failed to deserialize due to missing clock");
        obj.updateConfig(json as BaseClockConfig & unknown).then(
            () => {
                /* NOOP */
            },
            () => {
                /* NOOP */
            }
        );
        return obj;
    }
};

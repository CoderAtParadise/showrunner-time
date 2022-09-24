import {
    Codec,
    getCodec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { IClockSource } from "../../IClockSource.js";
import { CreateStructure } from "./DataStructures.js";

export const ClockCreateCodec: Codec<CreateStructure & unknown, IClockSource> =
    {
        serialize(obj: CreateStructure & unknown): serializeTypes {
            const codec = getCodec(`sync_clock_create_${obj.type}`, false);
            if (codec === undefined)
                throw Error(
                    `Failed to serialize clock creation data: ${obj.type}:${obj.name}`
                );
            const clock = codec.serialize(obj) as object;
            return {
                name: obj.name,
                type: obj.type,
                ...clock
            };
        },
        deserialize(json: serializeTypes): IClockSource<unknown> {
            const codec = getCodec(
                `sync_clock_create_${(json as CreateStructure).type}`,
                false
            );
            if (codec === undefined)
                throw Error(
                    `Failed to deserialize clock creation data: ${
                        (json as CreateStructure).type
                    }:${(json as CreateStructure).name}`
                );
            return codec.deserialize(json) as IClockSource<unknown>;
        }
    };

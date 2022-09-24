import {
    Codec,
    serializeTypes
} from "@coderatparadise/showrunner-network/codec";
import { ClockIdentifier } from "../../IClockSource.js";

export const ClockIdentifierCodec: Codec<ClockIdentifier> = {
    serialize(obj: ClockIdentifier): serializeTypes {
        return `${obj.service}:${obj.show}:${obj.session}:${obj.id}:${obj.type}`;
    },
    deserialize(
        json: serializeTypes
    ): ClockIdentifier {
        const split: string[] = (json as string).split(":");
        return {
            service: split[0],
            show: split[1],
            session: split[2],
            id: split[3],
            type: split[4]
        };
    }
}

import {
    Codec,
    serializeTypes
    //@ts-ignore
} from "@coderatparadise/showrunner-network/codec";
import { ClockIdentifier } from "../../identifier/ClockIdentifier.js";
export const CodecDataChapter: Codec<{
    owner: ClockIdentifier;
}> = {
    serialize(obj: { owner: ClockIdentifier }): serializeTypes {
        return obj;
    },
    deserialize(json: serializeTypes): {
        owner: ClockIdentifier;
    } {
        return {
            owner: new ClockIdentifier((json as { owner: string }).owner)
        };
    }
};

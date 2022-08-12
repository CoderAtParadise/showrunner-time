import { ClockIdentifier, ClockLookup } from "./IClockSource.js";

export function createIdentifier(lookup: ClockLookup): ClockIdentifier {
    const split: string[] = lookup.split(":");
    return {
        service: split[0],
        show: split[1],
        session: split[2],
        id: split[3],
        type: split[4]
    };
}

export function createLookup(identifier: ClockIdentifier): ClockLookup {
    return `${identifier.service}:${identifier.show}:${identifier.session}:${identifier.id}:${identifier.type}`;
}

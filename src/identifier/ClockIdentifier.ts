import { ManagerIdentifier } from "./ManagerIdentifier.js";

export type ClockLookup = `${string}:${string}:${string}:${string}:${string}`;

export class ClockIdentifier extends ManagerIdentifier {
    constructor(
        service: string | ManagerIdentifier | ClockIdentifier,
        show?: string,
        session?: string,
        id?: string,
        type?: string
    ) {
        super(service, show, session);
        if (this.isString(service)) {
            if (id !== undefined && type !== undefined) {
                this.m_id = id;
                this.m_type = type;
            } else {
                const ss = (service as string).split(":");
                if (ss.length < 5) throw new Error("Invalid Clock Identifier");
                this.m_id = ss[3];
                this.m_type = ss[4];
            }
        } else {
            if (
                service instanceof ManagerIdentifier &&
                show !== undefined &&
                session !== undefined
            ) {
                this.m_id = show;
                this.m_type = session;
            } else throw new Error("Invalid Clock Identifier");
        }
    }

    id(): string {
        return this.m_id;
    }

    type(): string {
        return this.m_type;
    }

    toJSON(): ClockLookup {
        return this.toString();
    }

    toString(): ClockLookup {
        return `${super.toString()}:${this.id()}:${this.type()}`;
    }

    private m_id: string;
    private m_type: string;
}

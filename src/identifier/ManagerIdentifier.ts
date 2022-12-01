export type ManagerLookup = `${string}:${string}:${string}`;

export class ManagerIdentifier {
    constructor(
        service: string | ManagerIdentifier,
        show?: string,
        session?: string
    ) {
        if (this.isString(service)) {
            if (
                this.isString(service) &&
                show !== undefined &&
                session !== undefined
            ) {
                this.m_service = service as string;
                this.m_show = show;
                this.m_session = session;
            } else {
                const ss = (service as string).split(":");
                if (ss.length < 3)
                    throw new Error("Invalid Manager Identifier");
                this.m_service = ss[0];
                this.m_show = ss[1];
                this.m_session = ss[2];
            }
        } else {
            const other = service as ManagerIdentifier;
            this.m_service = other.service();
            this.m_show = other.show();
            this.m_session = other.session();
        }
    }

    service(): string {
        return this.m_service;
    }

    show(): string {
        return this.m_show;
    }

    session(): string {
        return this.m_session;
    }

    toJSON(): ManagerLookup {
        return this.toString();
    }

    toString(): ManagerLookup {
        return `${this.m_service}:${this.m_show}:${this.m_session}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected isString(value: any): boolean {
        return typeof value === "string" || value instanceof String;
    }

    private m_service: string;
    private m_show: string;
    private m_session: string;
}

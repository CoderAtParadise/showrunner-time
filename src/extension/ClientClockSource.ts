import { SMPTE, FrameRate } from "../SMPTE.js";
import {
    CurrentClockState,
    AdditionalData
} from "../codec/sync/DataStructures.js";
import {
    BaseClockConfig,
    ClockIdentifier,
    IClockSource,
    ClockStatus,
    ControlBar
} from "../IClockSource.js";
import {
    serviceManager,
    TRPCClientProxy
} from "@coderatparadise/showrunner-network";
import { ClockLookup } from "../IClockSource.js";
import { getClockRouter } from "../ClockTRPCRouter.js";
import { createIdentifier, createLookup } from "../ClockIdentifierUtils.js";

type ClockRouter = ReturnType<typeof getClockRouter>;

export class ClientClockSource implements IClockSource<unknown> {
    constructor(lookup: ClockLookup) {
        this._identifier = createIdentifier(lookup);
    }

    config(): BaseClockConfig & unknown {
        return this._config || { name: "" };
    }

    frameRate(): FrameRate {
        return this._additional?.frameRate || FrameRate.F1000;
    }

    identifier(): ClockIdentifier {
        return (
            this._identifier || {
                service: "unknown",
                show: "unknown",
                session: "unknown",
                id: "unknown",
                type: "unknown"
            }
        );
    }

    controlBar(): ControlBar[] {
        return this._additional?.controlBar || [];
    }

    settings(): BaseClockConfig & any {
        return this._config;
    }

    status(): ClockStatus {
        return this._currentState?.status || ClockStatus.INVALID;
    }

    hasIncorrectFrameRate(): boolean {
        return this._currentState?.incorrectFrameRate || false;
    }

    isOverrun(): boolean {
        return this._currentState?.overrun || false;
    }

    duration(): SMPTE {
        try {
            return new SMPTE(
                this._additional?.duration,
                this._additional?.frameRate
            );
        } catch (e) {
            return new SMPTE();
        }
    }

    name(): string {
        if (this._additional?.name !== "") return this._additional!.name;
        return this._config?.name || "";
    }

    current(): SMPTE {
        try {
            return new SMPTE(
                this._currentState?.time,
                this._additional?.frameRate
            );
        } catch (e) {
            return new SMPTE();
        }
    }

    data(): object {
        return this._additional?.data || {};
    }

    async play(): Promise<boolean> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
        if (proxy) {
            return await proxy.play.query(createLookup(this.identifier()));
        }
        return await false;
    }

    async pause(): Promise<boolean> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
        if (proxy) {
            return await proxy.pause.query(createLookup(this.identifier()));
        }
        return await false;
    }

    async stop(): Promise<boolean> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
        if (proxy) {
            return await proxy.stop.query(createLookup(this.identifier()));
        }
        return await false;
    }

    async reset(override: boolean): Promise<boolean> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
        if (proxy) {
            return await proxy.reset.query({
                lookup: createLookup(this.identifier()),
                override: override
            });
        }
        return await false;
    }

    async setTime(time: SMPTE): Promise<boolean> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
        if (proxy) {
            return await proxy.setTime.mutate({
                lookup: createLookup(this.identifier()),
                time: time.toString()
            });
        }
        return await false;
    }

    async updateConfig(
        settings: BaseClockConfig & unknown,
        local?: boolean
    ): Promise<void> {
        this._config = settings;
        if (!local) {
            const proxy = serviceManager.get<
                TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
            >(`trpc:${this.identifier().service}`);
            if (proxy)
                proxy.updateConfig.mutate({
                    lookup: createLookup(this.identifier()),
                    ...settings
                });
        }
    }

    _syncState(state: CurrentClockState): void {
        this._currentState = state;
    }

    _syncData(data: AdditionalData): void {
        this._additional = data;
    }

    async _update(): Promise<void> {
        const proxy = serviceManager.get<
            TRPCClientProxy<ClockRouter["_def"]["record"], ClockRouter>
        >(`trpc:${this.identifier().service}`);
    }

    private _identifier: ClockIdentifier;
    private _currentState: CurrentClockState | undefined;
    private _config: (BaseClockConfig & unknown) | undefined;
    private _additional: AdditionalData | undefined;
}

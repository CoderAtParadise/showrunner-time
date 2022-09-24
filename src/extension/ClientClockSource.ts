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
import { AsyncUtils, IDispatcher } from "@coderatparadise/showrunner-network";
import { ClockLookup } from "../IClockSource.js";
import { ClockIdentifierCodec } from "../codec/index.js";
import {
    MessageClockCommand,
    MessageClockConfig,
    MessageClockCue,
    MessageClockCurrent,
    MessageClockData,
    MessageClockPause,
    MessageClockPlay,
    MessageClockRecue,
    MessageClockSetTime,
    MessageClockStop,
    MessageClockUncue,
    MessageClockUpdateConfig
} from "../ClockMessages.js";
import { IClockManager } from "../IClockManager.js";

export class ClientClockSource implements IClockSource<unknown> {
    constructor(lookup: ClockLookup, manager: IClockManager) {
        this._identifier = ClockIdentifierCodec.deserialize(lookup);
        this._manager = manager;
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
        if (this._additional?.name && this._additional?.name !== "")
            return this._additional.name;
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

    async cue(): Promise<boolean> {
        const cued = await this._manager.dispatch(
            { type: MessageClockCue, handler: "network" },
            this.identifier()
        );
        if (cued.type === MessageClockCommand) {
            return cued.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async uncue(): Promise<boolean> {
        const uncued = await this._manager.dispatch(
            { type: MessageClockUncue, handler: "network" },
            this.identifier()
        );
        if (uncued.type === MessageClockCommand) {
            return uncued.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async play(): Promise<boolean> {
        const play = await this._manager.dispatch(
            { type: MessageClockPlay, handler: "network" },
            this.identifier()
        );
        if (play.type === MessageClockCommand) {
            return play.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async pause(override: boolean): Promise<boolean> {
        const pause = await this._manager.dispatch(
            { type: MessageClockPause, handler: "network" },
            this.identifier(),
            override
        );
        if (pause.type === MessageClockCommand) {
            return pause.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async stop(override: boolean): Promise<boolean> {
        const stop = await this._manager.dispatch(
            { type: MessageClockStop, handler: "network" },
            this.identifier(),
            override
        );
        if (stop.type === MessageClockCommand) {
            return stop.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async recue(override: boolean): Promise<boolean> {
        const recue = await this._manager.dispatch(
            { type: MessageClockRecue, handler: "network" },
            this.identifier(),
            override
        );
        if (recue.type === MessageClockCommand) {
            return recue.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async setTime(time: SMPTE): Promise<boolean> {
        const settime = await this._manager.dispatch(
            { type: MessageClockSetTime, handler: "network" },
            this.identifier(),
            time
        );
        if (settime.type === MessageClockCommand) {
            return settime.ret as boolean;
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async updateConfig(
        settings: BaseClockConfig & unknown,
        local?: boolean
    ): Promise<void> {
        this._config = settings;
        if (!local) {
            await this._manager.dispatch(
                { type: MessageClockUpdateConfig, handler: "network" },
                this.identifier(),
                settings
            );
        }
        return await AsyncUtils.voidReturn();
    }

    _syncState(state: CurrentClockState): void {
        this._currentState = state;
    }

    _syncData(data: AdditionalData): void {
        this._additional = data;
    }

    async _update(): Promise<void> {
        void this.updateConfig(
            await (async () => {
                const config = await this._manager.dispatch(
                    { type: MessageClockConfig, handler: "network" },
                    this.identifier()
                );
                if (config.type === MessageClockConfig)
                    return config.ret as BaseClockConfig & unknown;
                return {
                    name: ""
                };
            })(),
            true
        );
        this._syncData(
            await (async () => {
                const data = await this._manager.dispatch(
                    { type: MessageClockData, handler: "network" },
                    this.identifier()
                );
                if (data.type === MessageClockData)
                    return data.ret as AdditionalData;
                return {
                    data: {},
                    duration: "--:--:--:--",
                    frameRate: FrameRate.F1000,
                    controlBar: [],
                    name: ""
                };
            })()
        );
        this._syncState(
            await (async () => {
                const current = await this._manager.dispatch(
                    { type: MessageClockCurrent, handler: "network" },
                    this.identifier()
                );
                if (current.type === MessageClockCurrent)
                    return current.ret as CurrentClockState;
                return {
                    time: "--:--:--:--",
                    status: ClockStatus.INVALID,
                    overrun: true,
                    incorrectFrameRate: true
                };
            })()
        );
        return await AsyncUtils.voidReturn();
    }

    private _manager: IDispatcher;
    private _identifier: ClockIdentifier;
    private _currentState: CurrentClockState | undefined;
    private _config: (BaseClockConfig & unknown) | undefined;
    private _additional: AdditionalData | undefined;
}

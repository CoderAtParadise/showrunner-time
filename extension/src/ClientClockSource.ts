import {
    BaseClockSettings,
    ClockIdentifier,
    IClockSource,
    ClockStatus,
    ControlBar,
    SMPTE
} from "@coderatparadise/showrunner-time";
import {
    CurrentClockState,
    AdditionalData
} from "@coderatparadise/showrunner-time/codec";
import {
    FlattenRouter,
    serviceManager
} from "@coderatparadise/showrunner-network";

export class ClientClockSource implements IClockSource<any> {
    constructor(
        type: string,
        identifier: ClockIdentifier,
        currentState: CurrentClockState,
        settings: BaseClockSettings & any,
        additional: AdditionalData
    ) {
        this.type = type;
        this.identifier = identifier;
        this._settings = settings;
        this._additional = additional;
        this._currentState = currentState;
    }

    controlBar(): ControlBar[] {
        return this._additional.controlBar;
    }

    settings(): BaseClockSettings & any {
        return this._settings;
    }

    status(): ClockStatus {
        return this._currentState.status;
    }

    hasIncorrectFrameRate(): boolean {
        return this._currentState.incorrectFrameRate;
    }

    isOverrun(): boolean {
        return this._currentState.overrun;
    }

    duration(): SMPTE {
        try {
            return new SMPTE(
                this._additional.duration,
                this._additional.frameRate
            );
        } catch (e) {
            return new SMPTE();
        }
    }

    name(): string {
        if (this._additional.name !== "") return this._additional.name;
        return this._settings.name;
    }

    current(): SMPTE {
        try {
            return new SMPTE(
                this._currentState.current,
                this._additional.frameRate
            );
        } catch (e) {
            return new SMPTE();
        }
    }

    data(): object {
        return this._additional.data;
    }

    play(): void {
        const proxy = serviceManager.get<FlattenRouter<>>(
            `trpc:${this.identifier.service}`
        );
        if (proxy) {
            proxy.play.query({ identifier: this.identifier });
        }
    }

    setTime(time: SMPTE): void {
        const proxy = serviceManager.get<FlattenRouter<>>(
            `trpc:${this.identifier.service}`
        );
        if (proxy) {
            proxy.setTime.query({
                identifier: this.identifier,
                time: time.toString()
            });
        }
    }

    pause(): void {
        const proxy = serviceManager.get<FlattenRouter<>>(
            `trpc:${this.identifier.service}`
        );
        if (proxy) {
            proxy.pause.query({ identifier: this.identifier });
        }
    }

    stop(): void {
        const proxy = serviceManager.get<FlattenRouter<>>(
            `trpc:${this.identifier.service}`
        );
        if (proxy) {
            proxy.stop.query({ identifier: this.identifier });
        }
    }

    reset(): void {
        const proxy = serviceManager.get<FlattenRouter<>>(
            `trpc:${this.identifier.service}`
        );
        if (proxy) {
            proxy.reset.query({ identifier: this.identifier });
        }
    }

    update(): void {
        // NOOP
    }

    updateSettings(settings: any): void {
        if (settings.currentState) {
            this._currentState = settings.currentState.state;
        }
        if (settings.settings)
            this._settings = { ...this._settings, ...settings.settings };
        if (settings.additional)
            this._additional = { ...this._additional, ...settings.additional };
    }

    identifier: ClockIdentifier;
    type: string;
    private _currentState: CurrentClockState;
    private _settings: BaseClockSettings & any;
    private _additional: AdditionalData;
}

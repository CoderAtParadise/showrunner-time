import {
    BaseClockConfig,
    IClockSource,
    ClockStatus,
    ClockIdentifier,
    ClockLookup
} from "./IClockSource.js";
import { FrameRate, SMPTE } from "./SMPTE.js";
import { AsyncUtils } from "@coderatparadise/showrunner-network";
import { IClockManager } from "./IClockManager.js";
import { MessageClockCurrent } from "./ClockMessages.js";
import { ClockIdentifierCodec } from "./codec/index.js";

let initialized: IClockSource;

/**
 * Implementation of {@link ClockSource} for System Time
 * @public
 */
export function createSystemTimeClockSource(
    host: string,
    manager: IClockManager
): IClockSource {
    if (initialized !== undefined) return initialized;
    else {
        initialized = {
            identifier(): ClockIdentifier {
                return {
                    service: host,
                    show: "system",
                    session: manager.id(),
                    id: "time",
                    type: "sync"
                };
            },
            config(): BaseClockConfig {
                return {
                    name: "System Time",
                    blackList: ["name"]
                };
            },
            status(): ClockStatus {
                return ClockStatus.RUNNING;
            },
            frameRate(): FrameRate {
                return FrameRate.F1000;
            },
            isOverrun(): boolean {
                return false;
            },
            hasIncorrectFrameRate(): boolean {
                return false;
            },
            name(): string {
                return this.config().name;
            },
            current(): SMPTE {
                return new SMPTE(new Date(), FrameRate.F1000);
            },
            duration(): SMPTE {
                return new SMPTE();
            },
            async cue(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async uncue(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async play(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async pause(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async stop(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async recue(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async setTime(): Promise<boolean> {
                return await AsyncUtils.booleanReturn(false);
            },
            async updateConfig(): Promise<void> {
                // NOOP
            },
            data(): object {
                return {};
            },
            async _update(): Promise<void> {
                void manager.dispatch({
                    type: MessageClockCurrent,
                    handler: "event"
                });
                return await AsyncUtils.voidReturn();
            }
        };
        manager.startUpdating(
            ClockIdentifierCodec.serialize(initialized.identifier()) as ClockLookup,
            initialized._update
        );
    }
    return initialized;
}

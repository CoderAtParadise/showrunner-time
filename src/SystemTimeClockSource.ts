import {
    BaseClockConfig,
    IClockSource,
    ClockStatus,
    ControlBar,
    ClockIdentifier
} from "./IClockSource.js";
import { FrameRate, SMPTE } from "./SMPTE.js";

let initialized: IClockSource;
const falseReturn = async () => Promise.resolve(false);
const voidReturn = async () => Promise.resolve();

/**
 * Implementation of {@link ClockSource} for System Time
 * @public
 */
export function createSystemTimeClockSource(host: string): IClockSource {
    if (initialized !== undefined) return initialized;
    else {
        initialized = {
            identifier(): ClockIdentifier {
                return {
                    service: host,
                    show: "system",
                    session: "system",
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
            controlBar(): ControlBar[] {
                return [];
            },
            current(): SMPTE {
                return new SMPTE(new Date(), FrameRate.F1000);
            },
            duration(): SMPTE {
                return new SMPTE();
            },
            async play(): Promise<boolean> {
                return await falseReturn();
            },
            async pause(): Promise<boolean> {
                return await falseReturn();
            },
            async stop(): Promise<boolean> {
                return await falseReturn();
            },
            async reset(): Promise<boolean> {
                return await falseReturn();
            },
            async setTime(): Promise<boolean> {
                return await falseReturn();
            },
            async updateConfig(): Promise<void> {
                // NOOP
            },
            data(): object {
                return {};
            },
            _syncState(): void {
                // NOOP
            },
            _syncData(): void {
                // NOOP
            },
            async _update(): Promise<void> {
                return await voidReturn();
            }
        };
    }
    return initialized;
}

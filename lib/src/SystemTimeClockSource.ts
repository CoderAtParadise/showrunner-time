import {
    BaseClockSettings,
    IClockSource,
    ClockStatus,
    ControlBar
} from "./IClockSource.js";
import { SMPTE } from "./SMPTE.js";

let initialized: IClockSource;

/**
 * Implementation of {@link ClockSource} for System Time
 * @public
 */
export function createSystemTimeClockSource(host: string): IClockSource {
    if (initialized !== undefined) return initialized;
    else {
        initialized = {
            type: "sync",
            identifier: {
                service: host,
                show: "system",
                session: "system",
                id: "time"
            },
            settings(): BaseClockSettings {
                return {
                    name: "System Time",
                    blackList: ["name"]
                };
            },
            status(): ClockStatus {
                return ClockStatus.RUNNING;
            },
            isOverrun(): boolean {
                return false;
            },
            hasIncorrectFrameRate(): boolean {
                return false;
            },
            name(): string {
                return this.settings().name;
            },
            controlBar(): ControlBar[] {
                return [];
            },
            current(): SMPTE {
                return new SMPTE(new Date());
            },
            duration(): SMPTE {
                return new SMPTE();
            },
            play(): void {
                // NOOP
            },
            setTime() {
                // NOOP
            },
            pause(): void {
                // NOOP
            },
            stop(): void {
                // NOOP
            },
            reset(): void {
                // NOOP
            },
            update(): void {
                // NOOP
            },
            updateSettings(): BaseClockSettings {
                return this.settings();
            },
            data(): object {
                return {};
            }
        };
    }
    return initialized;
}

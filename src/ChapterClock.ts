import { AsyncUtils } from "@coderatparadise/showrunner-network";
import { v4 as uuid } from "uuid";
import {
    MessageClockConfig,
    MessageClockCue,
    MessageClockCurrent,
    MessageClockData,
    MessageClockPause,
    MessageClockPlay,
    MessageClockStop,
    MessageClockUncue
} from "./ClockMessages.js";
import { IClockManager } from "./IClockManager.js";
import { BaseClockConfig, ClockStatus, IClockSource } from "./IClockSource.js";
import { FrameRate, Offset, SMPTE } from "./SMPTE.js";
import { ClockIdentifier } from "./identifier/ClockIdentifier.js";

export type ChapterSettings = {
    time: SMPTE;
};

export class ChapterClock implements IClockSource<ChapterSettings> {
    constructor(
        manager: IClockManager,
        owner: ClockIdentifier,
        settings: BaseClockConfig & ChapterSettings,
        id?: string
    ) {
        this.m_config = settings;
        this.m_manager = manager;
        this.m_owner = owner;
        this.m_id = id ? id : uuid();
    }

    identifier(): ClockIdentifier {
        return new ClockIdentifier(
            this.m_manager.identifier(),
            this.m_id,
            "chapter"
        );
    }

    config(): BaseClockConfig & ChapterSettings {
        return this.m_config;
    }

    status(): ClockStatus {
        return this.m_status;
    }

    frameRate(): FrameRate {
        return this.cache()?.frameRate() || FrameRate.F1000;
    }

    hasIncorrectFrameRate(): boolean {
        return false;
    }

    isOverrun(): boolean {
        return false;
    }

    name(): string {
        return this.config().name;
    }

    current(): SMPTE {
        if (this.cache()) {
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const otime = this.cache()!.current();
            if (otime.lessThan(this.config().time))
                return this.config()
                    .time.subtract(otime, true)
                    .setOffset(Offset.END);
            else return SMPTE.ZERO;
        }
        return SMPTE.INVALID;
    }

    duration(): SMPTE {
        return this.config().time;
    }

    async cue(): Promise<boolean> {
        if (
            this.m_status === ClockStatus.UNCUED &&
            this.cache()?.status() !== ClockStatus.UNCUED
        ) {
            this.m_status = ClockStatus.CUED;
            this.m_manager.startUpdating(
                this.identifier(),
                this._update.bind(this)
            );
            void this.m_manager.dispatch(
                { type: MessageClockCurrent, handler: "event" },
                this.identifier()
            );
            void this.m_manager.dispatch(
                { type: MessageClockCue, handler: "notify" },
                this.identifier()
            );
            return await AsyncUtils.booleanReturn(true);
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async uncue(): Promise<boolean> {
        if (
            this.m_status !== ClockStatus.UNCUED &&
            this.m_status !== ClockStatus.INVALID
        ) {
            this.m_manager.stopUpdating(this.identifier());
            this.m_status = ClockStatus.UNCUED;
            void this.m_manager.dispatch(
                { type: MessageClockCurrent, handler: "event" },
                this.identifier()
            );
            void this.m_manager.dispatch(
                { type: MessageClockUncue, handler: "notify" },
                this.identifier()
            );
            return await AsyncUtils.booleanReturn(true);
        }
        return AsyncUtils.booleanReturn(false);
    }

    async play(): Promise<boolean> {
        if (this.status() === ClockStatus.STOPPED) void (await this.recue());
        if (
            this.m_status === ClockStatus.CUED ||
            this.m_status === ClockStatus.PAUSED
        ) {
            this.m_status = ClockStatus.RUNNING;
            void this.m_manager.dispatch(
                { type: MessageClockCurrent, handler: "event" },
                this.identifier()
            );
            void this.m_manager.dispatch(
                { type: MessageClockPlay, handler: "notify" },
                this.identifier()
            );
            return await AsyncUtils.booleanReturn(true);
        }
        return await AsyncUtils.booleanReturn(false);
    }

    // Pause is not needed
    async pause(): Promise<boolean> {
        if (this.status() === ClockStatus.RUNNING) {
            this.m_status = ClockStatus.PAUSED;
            void this.m_manager.dispatch(
                { type: MessageClockCurrent, handler: "event" },
                this.identifier()
            );
            void this.m_manager.dispatch(
                { type: MessageClockPause, handler: "notify" },
                this.identifier()
            );
            return await AsyncUtils.booleanReturn(true);
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async stop(): Promise<boolean> {
        if (
            this.m_status === ClockStatus.RUNNING ||
            this.m_status === ClockStatus.PAUSED
        ) {
            this.m_status = ClockStatus.STOPPED;
            void this.m_manager.dispatch(
                { type: MessageClockCurrent, handler: "event" },
                this.identifier()
            );
            void this.m_manager.dispatch(
                {
                    type: MessageClockStop,
                    handler: "notify"
                },
                this.identifier()
            );
            return await AsyncUtils.booleanReturn(true);
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async recue(): Promise<boolean> {
        if (
            this.status() !== ClockStatus.UNCUED &&
            this.status() !== ClockStatus.INVALID
        ) {
            if (await this.uncue()) return await this.cue();
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async setTime(time: SMPTE): Promise<boolean> {
        if (this.cache()) {
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (time.lessThanOrEqual(this.cache()!.duration(), true)) {
                this.m_config.time = time;
                if (this.m_manager._sortChapters)
                    this.m_manager._sortChapters(this.m_owner);
                void this.m_manager.dispatch(
                    { type: MessageClockData, handler: "event" },
                    this.identifier()
                );
                return await AsyncUtils.booleanReturn(true);
            }
        }
        return await AsyncUtils.booleanReturn(false);
    }

    async chapters(): Promise<ClockIdentifier[]> {
        return await AsyncUtils.typeReturn<ClockIdentifier[]>([]);
    }

    async addChapter(): Promise<boolean> {
        return await AsyncUtils.booleanReturn(false);
    }

    async removeChapter(): Promise<boolean> {
        return await AsyncUtils.booleanReturn(false);
    }

    _sortChapters(): void {
        //NOOP
    }

    async updateConfig(
        newConfig: BaseClockConfig & ChapterSettings
    ): Promise<void> {
        void this.m_manager.dispatch(
            { type: MessageClockConfig, handler: "event" },
            this.m_owner
        );
        await AsyncUtils.voidReturn();
    }

    data(): object {
        return { owner: this.m_owner };
    }

    cache(): IClockSource<unknown> | undefined {
        if (!this.m_cache) {
            this.m_cache = this.m_manager.request(this.m_owner);
        }
        return this.m_cache;
    }

    async _update(): Promise<void> {
        if (this.cache()?.status() !== ClockStatus.UNCUED) {
            if (this.current().equals(SMPTE.ZERO)) {
                void (await this.stop());
            } else if (
                (this.current().greaterThan(SMPTE.ZERO, true) &&
                    this.status() === ClockStatus.STOPPED) ||
                this.status() === ClockStatus.CUED
            ) {
                void (await this.play());
            }
        }
        void this.m_manager.dispatch({
            type: MessageClockCurrent,
            handler: "event"
        });
        return await AsyncUtils.voidReturn();
    }

    private m_manager: IClockManager;
    private m_owner: ClockIdentifier;
    private m_cache: IClockSource<unknown> | undefined = undefined;
    private m_status: ClockStatus = ClockStatus.UNCUED;
    private m_config: BaseClockConfig & ChapterSettings;
    private m_id: string;
}

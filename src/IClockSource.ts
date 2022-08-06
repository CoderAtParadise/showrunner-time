import { AdditionalData, CurrentClockState } from "./codec/index.js";
import { FrameRate, SMPTE } from "./SMPTE.js";

/**
 * Enum defining all possible control bar options
 */
export enum ControlBar {
    PLAY = "play",
    PLAY_PAUSE = "play_pause",
    PAUSE = "pause",
    STOP = "stop",
    RESET = "reset",
    FORWARD = "forward",
    BACK = "back",
    POSITION = "position"
}

/**
 * Enum defining all possible status's that of an {@link ClockSource}
 * @public
 */
export enum ClockStatus {
    INVALID = "invalid",
    RESET = "reset",
    STOPPED = "stopped",
    PAUSED = "paused",
    RUNNING = "running"
}

/**
 * Type defining the base settings of an {@link ClockSource}
 * @public
 */
export type BaseClockConfig = {
    name: string;
    blackList?: string[];
};
/**
 * Type used for looup and storage of a clock id
 * @public
 */
export type ClockLookup = `${string}:${string}:${string}`;

/**
 * Type used for the structure of identifying clocks
 * @public
 */
export type ClockIdentifier = {
    service: string;
    show: string;
    session: string;
    id: string;
    type: string;
};
/**
 * Interface implemented by all Clocks
 * @typeParam Settings - Custom Settings for the clock
 * @public
 */
export interface IClockSource<Settings = unknown> {
    /**
     * The identifier used to identifiy the clock
     * @see {@link ClockIdentifier} for the data structure
     * @returns the clockId;
     */
    identifier(): ClockIdentifier;
    /**
     * Returns the config for the clock
     * @see {@link BaseClockConfig} for base settings
     * @returns All Config options
     */
    config: () => BaseClockConfig & Settings;
    /**
     * Returns the status of the clock
     * @see {@link ClockStatus} for all valid states
     * @returns The current status
     */
    status: () => ClockStatus;
    /**
     * Returns the framerate
     * @Returns the framerate
     */
    frameRate: () => FrameRate;
    /**
     * Returns if the source has an incorrect frame rate
     * @returns True, if the source has an incorrect frame rate, otherwise False
     */
    hasIncorrectFrameRate(): boolean;
    /**
     * Returns if the clock has overrun the stop time
     * @returns True, if the clock has overrun the stop time and is allowed to overrun, otherwise False
     */
    isOverrun: () => boolean;
    /**
     * Returns the name of the clock
     * @remarks
     * Returns a customised name otherwise
     *
     * Returns {@link BaseClockConfig.name}
     * @returns The name of the clock
     */
    name: () => string;
    /**
     * Returns the allowed control bar options
     * @see {@link ControlBar} for all valid options
     * @returns An array of all value control bar options
     */
    controlBar: () => ControlBar[];
    /**
     * Returns the current time of the clock
     * @returns The current time of the source
     */
    current: () => SMPTE;
    /**
     * Returns how long the clock runs for
     * @returns the duration of the source
     */
    duration: () => SMPTE;
    /**
     * Starts the clock running and sets the status to {@link ClockStatus.RUNNING}
     */
    play: () => void;
    /**
     * Sets the clock to a specific time
     */
    setTime: (time: SMPTE) => void;
    /**
     * Pause the operation of the clock and sets ths status to {@link ClockStatus.PAUSED}
     */
    pause: (override: boolean) => void;
    /**
     * Stops the operatiion of the clock and sets the status to {@link ClockStatus.STOPPED}
     */
    stop: (override: boolean) => void;
    /**
     * Stops the operation of the clock, Resets the clock to default state and sets the status to {@link ClockStatus.RESET}
     */
    reset: (override: boolean) => void;
    /**
     * Updates the settings for the clock
     * @param settings - The settings to update
     * @returns The updated settings
     */
    updateConfig: (settings: unknown) => void;
    /**
     * Returns any additional data asociated with the clock
     * @returns Additional data associated with the clock
     */
    data: () => object;
    /**
     * Synchronises the current state of the clock
     * @param state - The new state
     * @internal
     */
    _syncState: (state: CurrentClockState) => void;
    /**
     * Synchronises additional data of the clock
     * @param data - {@link AdditionalData}
     * @internal
     */
    _syncData:(data: AdditionalData) => void;
    /**
     * Updates various functionallity of the clock
     *
     * Called automatically by the main update loop
     * @internal
     */
    _update: () => void;
}

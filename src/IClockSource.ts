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
    CUE_PLAY = "cue_play",
    CUE_PLAY_PAUSE = "cue_play_pause",
    CUE = "cue",
    RECUE = "recue",
    UNCUE = "uncue",
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
    UNCUED = "uncued",
    CUED = "cued",
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
 * Type used for looup
 * @public
 */
export type ClockLookup = `${string}:${string}:${string}:${string}:${string}`; // service:show:session:id:type

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
     * Cues the clock to play and sets the status to {@link ClockStatus.CUED}
     * Registers {@link _update} to start updating
     * @returns if the operation took place
     */
    cue: () => Promise<boolean>;
    /**
     * Uncues the clock and set the status to {@link ClockStatus.UNCUED}
     * Unregisters {@link _update} from updating
     * @returns if the operation took place
     */
    uncue: () => Promise<boolean>;
    /**
     * Starts the clock running and sets the status to {@link ClockStatus.RUNNING}
     * @returns if the operation took place
     */
    play: () => Promise<boolean>;
    /**
     * Pause the operation of the clock and sets ths status to {@link ClockStatus.PAUSED}
     * @returns if the operation took place
     */
    pause: (override: boolean) => Promise<boolean>;
    /**
     * Stops the operatiion of the clock and sets the status to {@link ClockStatus.STOPPED}
     * @returns if the operation took place
     */
    stop: (override: boolean) => Promise<boolean>;
    /**
     * Stops the operation of the clock, Resets the clock to default state and sets the status to {@link ClockStatus.CUED}
     * @returns if the operation took place
     */
    recue: (override: boolean) => Promise<boolean>;
    /**
     * Sets the clock to a specific time
     * @returns if the operation took place
     */
    setTime: (time: SMPTE) => Promise<boolean>;
    /**
     * Updates the settings for the clock
     * @param settings - The settings to update
     * @returns The updated settings
     */
    updateConfig: (
        newConfig: BaseClockConfig & Settings,
        local?: boolean
    ) => Promise<void>;
    /**
     * Returns any additional data asociated with the clock
     * @returns Additional data associated with the clock
     */
    data: () => object;
    /**
     * Synchronises the current state of the clock
     * Only used on the client
     * @param state - The new state
     * @internal
     */
    _syncState?: (state: CurrentClockState) => void;
    /**
     * Synchronises additional data of the clock
     * Only used on the client
     * @param data - {@link AdditionalData}
     * @internal
     */
    _syncData?: (data: AdditionalData) => void;
    /**
     * Updates the current state of the clock
     * Once cued updates once per second
     * @internal
     */
    _update: () => Promise<void>;
}

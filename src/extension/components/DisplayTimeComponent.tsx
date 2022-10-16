import {
    Offset,
    ClockDirection,
    ClockStatus,
    zeroPad,
    SMPTE,
    IClockSource
    //@ts-ignore
} from "@coderatparadise/showrunner-time";
import { LooseObject } from "../LooseObject.js";

export const DisplayTimeComponent = (props: {
    className?: string;
    clock: IClockSource;
    show: "current" | "duration";
    showFrames?: boolean;
}) => {
    if (props.show === "current") {
        let time = props.clock.current();
        if (props.clock.config()) {
            const settings = props.clock.config() as LooseObject;
            if (settings.time) {
                const duration = props.clock.duration();
                if (props.clock.status() === ClockStatus.UNCUED)
                    time = duration;
                else if (settings.direction === ClockDirection.COUNTDOWN) {
                    if (time.greaterThan(duration, true))
                        time = time
                            .subtract(duration, true)
                            .setOffset(Offset.END);
                    else time = duration.subtract(time, true);
                }
            }
        }
        if (props.showFrames) {
            if (time.frameCount() === -1)
                return (
                    <p className={props.className}>{new SMPTE().toString()}</p>
                );
            return <p className={props.className}>{time.toString()}</p>;
        } else {
            if (time.frameCount() === -1)
                return <p className={props.className}>{"--:--:--"}</p>;
            return (
                <p className={props.className}>{`${time.offset()}${zeroPad(
                    time.hours(),
                    2
                )}:${zeroPad(time.minutes(), 2)}:${zeroPad(
                    time.seconds(),
                    2
                )}`}</p>
            );
        }
    } else {
        const duration = props.clock.duration();
        if (props.showFrames) {
            return <p className={props.className}>{duration.toString()}</p>;
        } else {
            return (
                <p className={props.className}>{`${duration.offset()}${zeroPad(
                    duration.hours(),
                    2
                )}:${zeroPad(duration.minutes(), 2)}:${zeroPad(
                    duration.seconds(),
                    2
                )}`}</p>
            );
        }
    }
};

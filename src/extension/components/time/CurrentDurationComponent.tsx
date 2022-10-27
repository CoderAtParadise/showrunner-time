import {
    Offset,
    ClockDirection,
    ClockStatus,
    IClockSource
    //@ts-ignore
} from "@coderatparadise/showrunner-time";
import { LooseObject } from "../../LooseObject.js";
import { SMPTEComponent } from "./SMPTEComponent.js";

export const CurrentDurationComponent = (props: {
    className?: string;
    style?: any;
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
        return (
            <SMPTEComponent
                className={props.className}
                style={props.style}
                time={time}
                showFrames={props.showFrames}
            />
        );
    } else {
        return (
            <SMPTEComponent
                className={props.className}
                style={props.style}
                time={props.clock.duration()}
                showFrames={props.showFrames}
            />
        );
    }
};

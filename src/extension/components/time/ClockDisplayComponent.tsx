import {
    IClockSource,
    zeroPad
    //@ts-ignore
} from "@coderatparadise/showrunner-time";
import { SMPTEComponent } from "./SMPTEComponent.js";

export const ClockDisplayComponent = (props: {
    className?: string;
    style?: any;
    clock: IClockSource<any>;
    format: 24 | 12;
    showFrames?: boolean;
}) => {
    if (props.format === 12) {
        let pm = false;
        const time = props.clock.current();
        let hours = time.hours();
        if (hours > 12) {
            hours = hours % 12;
            pm = true;
        }
        if (hours === 0) hours = 12;
        if (props.showFrames) {
            return (
                <p className={props.className} style={props.style}>
                    {`${hours}:${zeroPad(time.minutes(), 2)}:${zeroPad(
                        time.seconds(),
                        2
                    )}:${zeroPad(time.frames(), 2)} ${pm ? "PM" : "AM"}`}
                </p>
            );
        }
        return (
            <p className={props.className} style={props.style}>
                {`${hours}:${zeroPad(time.minutes(), 2)}:${zeroPad(
                    time.seconds(),
                    2
                )} ${pm ? "PM" : "AM"}`}
            </p>
        );
    } else {
        return (
            <SMPTEComponent
                className={props.className}
                style={props.style}
                time={props.clock.current()}
                showFrames={props.showFrames}
            />
        );
    }
};

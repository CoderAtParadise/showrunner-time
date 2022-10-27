import {
    zeroPad,
    SMPTE
    //@ts-ignore
} from "@coderatparadise/showrunner-time";

export const SMPTEComponent = (props: {
    className?: string;
    style?: any;
    time: SMPTE;
    showFrames?: boolean;
}) => {
    if (props.showFrames) {
        return (
            <p className={props.className} style={props.style}>
                {props.time.toString()}
            </p>
        );
    } else {
        if (props.time.frameCount() === -1)
            return (
                <p className={props.className} style={props.style}>
                    {"--:--:--"}
                </p>
            );
        return (
            <p
                className={props.className}
                style={props.style}
            >{`${props.time.offset()}${zeroPad(
                props.time.hours(),
                2
            )}:${zeroPad(props.time.minutes(), 2)}:${zeroPad(
                props.time.seconds(),
                2
            )}`}</p>
        );
    }
};

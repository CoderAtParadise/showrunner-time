/**
 * Returns a formatted number with leading zeros
 * @param num - The number or string to be formated
 * @param places - The number of places to have
 * @returns The formatted string
 */
export function zeroPad(str: number | string, places: number): string {
    if (typeof str === "string") return str.padStart(places, "0");
    else {
        if (isNaN(str)) str = 0;
        return String(Math.floor(str)).padStart(places, "0");
    }
}

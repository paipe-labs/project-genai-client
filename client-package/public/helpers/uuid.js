export function uuidv4() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += "-";
        }
        const randomDigit = (Math.random() * 16) | 0;
        if (i === 12) {
            uuid += "4";
        }
        else if (i === 16) {
            uuid += (randomDigit & 3) | 8;
        }
        else {
            uuid += randomDigit.toString(16);
        }
    }
    return uuid;
}

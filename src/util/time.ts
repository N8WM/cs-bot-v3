import moment from "moment";

export function getDateTime() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

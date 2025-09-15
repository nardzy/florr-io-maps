
export const change_log: [string, string][] = [];

const fmt_month = (month: number) => {

    switch(month) {
        case 1: { return "January" }
        case 2: { return "February" }
        case 3: { return "March" }
        case 4: { return "April" }
        case 5: { return "May" }
        case 6: { return "June" }
        case 7: { return "July" }
        case 8: { return "August" }
        case 9: { return "September" }
        case 10: { return "October" }
        case 11: { return "November" }
        case 12: { return "December" }
        default: {
            return "None";
        }
    }

}

const fmt_day = (day: number) => {

    let ordinal: string | null = null;

    switch (day) {
        case 1:
        case 11: { ordinal = "st"; break; }
        case 2:
        case 12: { ordinal = "nd"; break; }
        case 3:
        case 13: { ordinal = "rd"; break; }
        default: {
            break;
        }
    }

    if (!ordinal) {
        ordinal = "th";
    }

    return `${day}${ordinal}`;

}

const add_changelog = (
    date: string,
    text: string
) => {

    const d = new Date(date);

    const month = fmt_month(d.getMonth() + 1);
    const day = fmt_day(d.getDay());
    const years = d.getFullYear();

    change_log.push([`${month} ${day} ${years}`, text]);

}

const fmt = (s: string[]) => {

    return s.join("\n");

};

add_changelog(
    "2025/9/15",
    "- Published Viewer!"
);

change_log.reverse();
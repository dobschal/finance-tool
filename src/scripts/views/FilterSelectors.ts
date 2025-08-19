import {html} from "@dobschal/html.js";
import Checkbox from "./partials/Checkbox.ts";
import {Computed} from "@dobschal/observable";
import {entries, entryFilter} from "../store.ts";
import {bind, dateStringToMonthDisplay} from "../lib/util.ts";
import Select, {type SelectOption} from "./partials/Select.ts";

export default function () {

    const includeEarnings = bind(entryFilter, "includeEarnings");
    const startMonth = bind(entryFilter, "startMonth");
    const endMonth = bind(entryFilter, "endMonth");

    const months = Computed<Array<SelectOption>>(() => {
        const monthsSet: Array<SelectOption> = [{
            label: "All",
            value: ""
        }];
        entries.value.forEach(entry => {
            const monthDisplay = dateStringToMonthDisplay(entry.date);
            if (!monthsSet.find(month => month.label === monthDisplay)) {
                monthsSet.push({
                    value: entry.date.substring(3), // cut off the day --> e.g. "01.1970"
                    label: monthDisplay
                });
            }
        });
        return monthsSet;
    });

    return html`
        <div class="form-group">
            <div class="horizontal top">
                <div class="card form-group">
                    <label for="start-month-select">
                        From
                        ${Select(months, startMonth)}
                    </label>
                </div>
                <div class="card form-group">
                    <label for="end-month-select">
                        Until
                        ${Select(months, endMonth)}
                    </label>
                </div>
                <div class="card">
                    <label>
                        ${Checkbox(includeEarnings)}
                        Include <br>Earnings?
                    </label>
                </div>
            </div>
        </div>
    `
}




import {updateDom} from "../util.ts";
import {subscribeStore} from "../storage.ts";
import {getEntriesWithCategories} from "../service/entryService.ts";

const template = `
    <h2>Entries</h2>
    <p class="alert"> 
        <span class="number">{{filteredEntries.length}}</span> 
        of 
        <span class="number">{{entries.length}}</span> entries shown.
        <span class="number">{{entriesWithoutCategory.length}}</span> (!!!) entries without category.
    </p>
    <table>
        <thead>
        <tr>
            <th>Date</th>
            <th>Recipient/Sender</th>
            <th>Type</th>
            <th>Description</th>
            <th class="number">Balance</th>
            <th class="number">Value</th>
        </tr>
        </thead>
        <tbody>
            {{#filteredEntries}}
                <tr {{#category}} style="background-color: {{category.color}};" {{/category}}>
                    <td class="date">{{date}}</td>
                    <td class="recipient">{{recipientSender}}</td>
                    <td class="type">{{type}}</td>
                    <td class="description">{{description}}</td>
                    <td class="balance number">{{balanceFormatted}}</td>
                    <td class="value number">{{valueFormatted}}</td>
                </tr>
            {{/filteredEntries}}
        </tbody>
    </table>    
`;

export default function (target: string) {
    subscribeStore("*", _render);

    function _render() {
        const entries = getEntriesWithCategories(true);
        const filteredEntries = entries.filter(entry => !entry.isHidden);
        const entriesWithoutCategory = filteredEntries.filter(entry => !entry.category);
        updateDom(target, template, {filteredEntries, entries, entriesWithoutCategory});
    }
}


import {updateDom} from "../util.ts";
import {subscribeStore} from "../storage.ts";
import {getCategories} from "../service/categoryService.ts";

const template = `
    <h2>Categories</h2>
    <div class="horizontal">
        {{#categories}}
            <div class="circle-badge" style="border-color: {{color}};">
                <span>{{name}}</span>
                <b>{{totalBalanceFormatted}}</b>
                <small>⌀ {{averageBalancePerMonth}}</small>
            </div>
        {{/categories}}
    </div>
`;

export default function (target: string) {

    subscribeStore("*", _render);

    function _render() {
        const categories = getCategories();
        updateDom(target, template, {
            categories,
        });
    }
}

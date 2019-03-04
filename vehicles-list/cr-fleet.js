import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {CrList} from './cr-list.js'
import '../vehicle-item/fleet-item.js';

class CrFleet extends CrList {
    static get contentTemplate() {
        return html`
        <template is="dom-repeat" items="{{filtered}}" delay="300" initial-count="[[pagerPerPage]]" id="vehicleRepeater">
            <fleet-item class="vehicle-item"
                noimg-path="[[noimgPath]]"
                id="vehicle-[[item.id]]"
                item-id="[[item.id]]"
                title="[[item.title]]"
                group-id="[[item.groupId]]"
                group-name="[[item.groupName]]"
                available="[[item.available]]"
                attributes="[[item.attributes]]"
                attributes-ordinal="[[attributesOrdinal]]"
                type-id="[[item.filters.78.0]]"
                images="[[item.images]]"
                verbals="[[verbals]]"
                terms-link="[[termsLink]]"
                terms-target="[[termsTarget]]"
                opened="{{smallDesktop}}">
            </fleet-item>
        </template>
    `;}
}
window.customElements.define('cr-fleet', CrFleet);

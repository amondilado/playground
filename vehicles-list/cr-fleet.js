import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {CrList} from './cr-list.js'
import '../vehicle-item/fleet-item.js';

class CrFleet extends CrList {
    static get contentTemplate() {
        return html`
        <template is="dom-repeat" items="[[pagerData]]" delay="300" initial-count="[[pagerPerPage]]" id="vehicleRepeater">
            <fleet-item class="vehicle-item"
                noimg-path="[[noimgPath]]"
                is-listitem
                id="vehicle-[[item.id]]"
                item-id="[[item.id]]"
                title="[[item.title]]"
                group-id="[[item.groupId]]"
                group-name="[[item.groupName]]"
                available="[[item.available]]" 
                attributes-ordinal="[[attributesOrdinal]]"
                attributes="[[item.attributes]]"
                type-id="[[item.filters.78.0]]"
                images="[[item.images]]"
                verbals="[[verbals]]"
                price="[[item.price]]"
                opened="{{smallDesktop}}"
                terms-link="[[termsLink]]"
                terms-target="[[termsTarget]]"
                terms-title="[[termsTitle]]"
                all-vehicles-common-text="[[allVehiclesCommonText]]">
            </fleet-item>
        </template>
    `;}
}
window.customElements.define('cr-fleet', CrFleet);

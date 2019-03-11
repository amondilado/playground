import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-list/iron-list.js';
import {CrList} from './cr-list.js'
import '../vehicle-item/vehicle-list-item.js';

class CrVehicles extends CrList {
    static get contentTemplate() {
        return html`
<iron-list items="[[sorted]]" scroll-target="document" as="item" id="vironList">
<template>
        <!--template is="dom-repeat" items="[[sorted]]" delay="300" initial-count="[[pagerPerPage]]" id="vehicleRepeater"-->
        <div style="padding-bottom:10px">
            <vehicle-list-item class$="[[getClassForItem(item, selected)]]"
                noimg-path="[[noimgPath]]"
                is-listitem
                id="vehicle-[[item.id]]"
                item-id="[[item.id]]"
                selected-vehicle="{{selectedVehicleId}}"
                title="[[item.title]]"
                group-id="[[item.groupId]]"
                group-name="[[item.groupName]]"
                price="[[item.price]]"
                price-initial="[[item.priceInitial]]"
                price-suggested="[[item.priceSuggested]]"
                price-per-day="[[item.pricePerDay]]"
                discount-percentage="[[item.discountPercentage]]"
                hide-fully-booked="[[item.hideFullyBooked]]"
                available="[[item.available]]"
                availability-title="[[item.availabilityTitle]]"
                attributes-ordinal="[[attributesOrdinal]]"
                attributes="[[item.attributes]]"
                type-id="[[item.filters.78.0]]"
                images="[[item.images]]"
                booking-days="[[bookingDays]]"
                verbals="[[verbals]]"
                terms-link="[[termsLink]]"
                terms-target="[[termsTarget]]"
                terms-title="[[termsTitle]]"
                opened="{{smallDesktop}}"
                all-vehicles-common-text="[[allVehiclesCommonText]]">
            </vehicle-list-item>
            </div>
        </template>
        </iron-list>
    `;}
}
window.customElements.define('cr-vehicles', CrVehicles);

import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '@polymer/iron-icon/iron-icon.js';

import './elements/vehicle-item/vehicle-list-item.js';
import './elements/nm-sort-by/nm-sort-by.js';
import './elements/nm-filter-pane/nm-filter-pane.js';
import './elements/array-filter/array-filter.js';
import './elements/nm-pagination/nm-pagination.js';
import './lazy-resources.js';
import './assets/gomega/shared-styles.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

/**
 * `vehicles-list`
 * @customElement
 * @polymer
 * TODO
 * - @appliesMixin FiltersHelperMixin
 * - @appliesMixin PaginationHelperMixin
 * - Sort localeCompare
 * - Theme tweaks
 */
let paginationLoaded = false;

class VehiclesList extends PolymerElement {
    ready() {
        super.ready();

        console.log('pagerPerPage ', this.pagerPerPage);

        afterNextRender(this, function () {
            this.set('vehicles', window.APP_VEHICLES);
            this.set('filtered', window.APP_VEHICLES);
            this.set('filters', window.APP_FILTERS);
            // Map filters
            if (typeof this.filters !== 'undefined') {
                for (let i = 0, len = this.filters.length; i < len; i++) {
                    this.selectedFilters[this.filters[i].id] = [];
                }
                this.set('filterKeys', Object.keys(this.selectedFilters));
            }

            this.set('itemsTotal',this.vehicles.length);
            // Lazy resources
            // this._ensureLazyLoaded();
        });

        // Set events
        this.$.resetButton.addEventListener('click', this._resetFilters.bind(this), false);
        this.addEventListener('pager-data', function (e) {
            // Original model paged. Update the current view
            console.log('__ready pager-data F: ',e.detail.data);
            this.set('filtered', e.detail.data);
            if(!paginationLoaded) {
                paginationLoaded = true;
            }
        });

        // Anytime our paged set changes, update the template
        this.addEventListener('pager-change', function (e) {
            this.set('filtered', e.detail.data);
            this.displaySpinner();
        });
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host { display: block; }
            a {
                color: var(--secondary);
                text-decoration: none;
            }
            a:hover, a:focus { text-decoration: underline; }
            .display-items {
                width: 120px;
            }
            .display-item {
                background-color: var(--display-item-bg);
                border-radius: 50px;
                color: var(--display-item-color);
                -ms-flex: 0 0 32px;
                flex: 0 0 32px;
                height: 32px;
                width: 32px;
                margin-left: 4px;
                margin-right: 4px;
                padding-bottom: var(--display-item-padding-y, 8px);
                padding-top: var(--display-item-padding-y, 8px);
                cursor: pointer;
            }
            .display-item.selected {
                background-color: var(--display-item-bg-selected);
                color: var(--display-item-color-selected);
            }
            .vehicle-item {
                background-color: #fff;
                overflow: hidden;
            }
            .rental-terms iron-icon {
                --iron-icon-heigth: 1em;
                --iron-icon-width: 1em;
            }
            .filters-inner {
                padding: 1rem;
            }
            .btn-primary {
                border-radius: 50px;
            }

            @media (max-width: 767px) {
                .vehicle-item {
                    max-width: 540px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .aside { position: static; }
                .collapse-md[aria-hidden="true"] { display: none; }
                .filters-outer, .filters-inner {
                    right:0;
                    bottom: 0;
                    left:0;
                }
                .filters-outer {
                    background-color: var(--filters-pane-bg, #f1f1f1);
                    position: fixed;
                    z-index: 500;
                }
                .filters-outer { top: var(--filters-fixed-top, 52px); }
                .filters-inner {
                    position: absolute;
                    top: 0;
                    overflow: auto;
                }
            }
            @media (min-width: 768px) {
                .vehicles-list-container { flex-wrap: nowrap; }
                .vehicles-list-main { -ms-flex: 0 0 75%; flex: 0 0 75%; max-width: 75%; }
                .aside { -ms-flex: 0 0 25%; flex: 0 0 25%; max-width: 25%; order:-1; }
                .list-header { margin-left: 25%; padding-left: var(--grid-gutter-half)}
                .filters-inner {
                    border: 1px solid #ececec;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
            }
        </style>

        <iron-media-query query="max-width: 767px" query-matches="{{smallScreen}}"></iron-media-query>
        <iron-media-query query="max-width: 1339px" query-matches="{{smallDesktop}}"></iron-media-query>
>>> [[itemsTotal]]
        <div class="layout horizontal justified center list-header">
            <div class="d-sm-none vehicles-available">[[verbals.vehiclesAvailable]]</div>
            <!-- Sorting -->
            <nm-sort-by class="mb-1" sort-val="{{sortVal}}" verbals="[[verbals.sort]]"></nm-sort-by>
            <!-- View by -->
            <iron-selector class="mb-1 ff-2 layout horizontal text-center wrap ff-2 d-xs-none display-items" id="displayItems"
            selected="0"
            selected-class="selected"
            on-iron-select="_pagerPerPageChanged">
                <div data-num="3" class="btn-hvr display-item">3</div>
                <div data-num="6" class="btn-hvr display-item">6</div>
                <div data-num="9" class="btn-hvr display-item">9</div>
                <!-- [[pagerPerPage]]
                <div num\$="[[pagerPerPageOptions.0]]" class="btn-hvr display-item">[[pagerPerPageOptions.0]]</div>
                <div num\$="[[pagerPerPageOptions.1]]" class="btn-hvr display-item">[[pagerPerPageOptions.1]]</div>
                <div num\$="[[pagerPerPageOptions.2]]" class="btn-hvr display-item">[[pagerPerPageOptions.2]]</div>
                -->
            </iron-selector>
        </div>

        <div id="vehiclesListContainer" class="layout horizontal row vehicles-list-container">
            <array-filter
                items="{{vehicles}}"
                filtered="{{sorted}}"
                sort="{{_sort(sortVal)}}">
            </array-filter>
            <!-- is-fleetitem -->
            <div id="vehiclesList" class="col col-12 mb-1 vehicles-list-main">
                <template is="dom-repeat" items="{{filtered}}" delay="300" initial-count="[[pagerPerPage]]" id="vehicleRepeater" on-dom-change="_setListProperties">
                    <vehicle-list-item class="mb-2 vehicle-item"
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
                        available="[[item.available]]"
                        availability-title="[[item.availabilityTitle]]"
                        attributes="[[item.attributes]]"
                        images="[[item.images]]"
                        booking-days="[[bookingDays]]"
                        verbals="[[verbals]]"
                        opened="{{smallDesktop}}"
                        all-vehicles-common-text="[[allVehiclesCommonText]]">
                        <a slot="terms-link" href="[[termsLink]]" class="ff-2 strong rental-terms" target\$="[[termsTarget]]">
                            <iron-icon icon="vehicle-icons:chevron-right" aria-hidden="true"></iron-icon>
                            [[termsTitle]]</a>
                    </vehicle-list-item>
                </template>
            </div>

            <aside class="col col-12 aside">
                <iron-collapse class="collapse-md filters-outer" opened="{{!smallScreen}}" id="filtersPane">
                    <div class="filters-inner">
                        <slot name="aside-heading"></slot>
                        <div class="mb-2 filters-group">
                            <template is="dom-repeat" items="{{filters}}">
                                <nm-filter-pane
                                    id="filter-[[index]]"
                                    class$="[[filterPaneClass]]"
                                    data-filter-id="[[item.id]]"
                                    filters-selected="{{selectedFilterValues}}"
                                    filter-event="{{selectEvent}}"
                                    filter-items="[[item.items]]"
                                    filter-title="[[item.title]]">
                                </nm-filter-pane>
                            </template>
                        </div>
                        <button class="mb-2 btn btn-block btn-outlined-primary" id="resetButton">[[verbals.button.reset]]</button>
                    </div>
                </iron-collapse>
                <slot name="aside-bottom"></slot>
            </aside>
        </div>

        <div class="layout horizontal justified center flex-xs-wrap">
            <div class="w-50 mb-1 small">[[verbals.pagination.page]] <strong>{{_pagerIndexPage(pagerCurrentPage)}}</strong> / {{_pagerIndexPage(pagerTotalPages)}}</div>
            <nm-pagination id="pager"
                class\$="ff-2 [[pagerClass]]"
                per-page="{{pagerPerPage}}"
                range-size="{{pagerRangeSize}}"
                data="{{pagerData}}"
                current-page="[[pagerCurrentPage]]"
                total-pages="{{pagerTotalPages}}"
                pager-verbals="[[verbals.pagination]]">
            </nm-pagination>
        </div>
        <slot name="spinner" id="spinner"></slot>
    `;}

    static get properties() {
        return {
            loadComplete: Boolean,
            isSuggested: { type: Boolean, value: false},
            bookingDays: {
                type: Number, value: 0
            },
            itemsTotal: {
                type: Number, value: 0
            },
            vehicles: {
                type: Array,
                value: function () { return [] }
            },
            sorted: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },
            pagerData: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },
            filtered: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },
            filters: {
                type: Array,
                value: function () { return [] }
            },
            filterKeys: {
                type: Object,
                value: function () { return {} }
            },
            sortBySelected: {
                type: String,
                notify: true
            },
            selectEvent: {
                type: Object,
                notify: true
            },
            sortVal: {
                type: String,
                notify: true,
                value: 'priceAsc',
                reflectToAttribute: true
            },
            selectedFilterValues: {
                type: Array,
                notify: true
            },
            selectedFilters: {
                type: Object,
                value: function () { return {} }
            },
            selectedVehicleId: {type: Number, notify: true, reflectToAttribute: true},
            filterPaneClass: String,
            vehicleItemClass: String,
            allVehiclesCommonText: String,

            model: {
                type: Object,
                notify: true,
                value: function () { return {} }
            },
            listItems: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },
            verbals: { type: Object, value: function() { return {} } },
            pagerClass: String,
            pagerPerPage: {
                type: Number,
                notify: true,
                value: 3
            },
            pagerRangeSize: {
                type: Number,
                notify: true,
                value: 5
            },
            pagerCurrentPage: {
                type: Number,
                notify: true,
                value: 0
            },
            pagerTotalPages: {
                type: Number,
                notify: true,
                value: 0
            },
            pagerPerPageOptions: {
                type: Array,
                notify: true,
                reflectToAttribute: true,
                value: function () { return [10, 25, 50]; }
            },
            pagerPerPageOption: {
                type: Number,
                notify: true,
                observer: '_pagerPerPageChanged'
            },
            page: {
                type: String,
                reflectToAttribute: true,
                observer: '_pageChanged',
            },
            smallScreen: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            smallDesktop: {
                type: Boolean,
                reflectToAttribute: true
            },
            termsLink: String,
            termsTitle: String,
            termsTarget: String,
            noimgPath: String
        };
    }

    static get observers() {
        return [
            '_selectedFilterValuesChanged(selectedFilterValues.splices)',
            '_sortedChanged(sorted.*)'
        ]
    }

    displaySpinner() {
        var slotContent = this.$.spinner.assignedNodes()[0];
        if(slotContent) {
            slotContent.classList.add('spin');
            setTimeout(function(){
                slotContent.classList.remove('spin');
            }, 200);
        }
    }

    _pageChanged(page) {
    }

    _pagerIndexPage(i) {
        return i + 1;
    }
    _pagerPerPageChanged(e) {
        this.set('pagerPerPage', e.detail.item.attributes['data-num'].value);
        this.set('pagerCurrentPage', 0);
        this.displaySpinner();
        this.$.pager.perPageChanged();
    }

    _sortedChanged() {
        if(typeof this.sorted !== 'undefined') {
            if(this.sorted.length > 0) {
                // TODO data binding to mixin pagination-helper-mixin.js
                this.set('pagerData', this.sorted);
                this.$.pager.dataChanged(); // Reset pager
            }
        }
    }

    _selectedFilterValuesChanged(e) {
        if (typeof e !== 'undefined') {
            // Get last value
            let len = this.get('selectedFilterValues').length;

            // Toggle filters
            if (len > 0) {
                this._toggleFilters(this.selectEvent.detail.item.filter, this.selectEvent);

                let arr = this._findMatchedItems(this.vehicles, this.filterKeys, this.selectedFilters);
                this.set('filtered', arr);

                // Reset pagination
                // TODO data binding to mixin pagination-helper-mixin.js
                this.set('pagerData', arr);
                this.$.pager.dataChanged();

            } else if ((this.selectEvent.type === 'iron-deselect') && (len === 0)) {
                this._resetFilters();
            }
        }
    }

    _toggleFilters(v, e) {
        let newv, path, key, isDeselect;

        isDeselect = (e.type !== 'iron-select');

        newv = v.split('_');

        path = 'selectedFilters.' + String(newv[0]); // selectedFilters.groupid

        key = newv[0]; // console.log('newv', newv,' | PATH: ', path,' | newv[1]: ', newv[1]);

        if (!isDeselect) {
            this.push(path, newv[1]); // console.log('PUSH: newv', newv,' path ',path);
        } else {
            // console.log('isDeselect: ', isDeselect); console.log('newv[0]', newv[0], 'newv[1]', newv[1]);
            let idx = this.selectedFilters[key].indexOf(newv[1]);
            this.splice(path, idx, 1); // console.log('SPLICE: selectedFilters', this.selectedFilters);
        }
    }

    _findMatchedItems(array, filterKeys, selectedFilters) {
        if (selectedFilters.length === 0) {
            return;
        }
        let key, sf, arr, it; // console.log('selectedFilters: ', selectedFilters);
        return arr = array.filter(function (item) {
            for (var k in filterKeys) { // for each filters key
                key = filterKeys[k]; // assign curr filters key to key
                sf = selectedFilters[key]; // selected filters key
                it = item.filters;

                if (sf.length === 0) {
                    continue;
                }
                // console.log('item: ',item); // console.log('key: ', key, ' | sf: ', sf, ' | it[key]: ', it[key]);
                if (Array.isArray(it[key])) {
                    // console.log('isArray: true | typeof it[key]: ',it[key], (typeof it[key]));
                    if (typeof it[key] === 'undefined' || !it[key].some(function (v) {
                        return !sf.indexOf(String(v));
                    })) {
                        return false; //  console.log('match: ',sf,String(v),!sf.indexOf(String(v)));
                    }
                }
                else {
                    if (typeof it[key] === 'undefined' || !(parseInt(sf) === it[key])) {
                        // console.log('typeof it[key]: ', it[key], (typeof it[key]));
                        return false;
                    }
                }
            }
            return true;
        });
    }

    // String.localeCompare: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_non-ASCII_characters
    // a.localeCompare(b)
    _sort(sortVal) {
        if (this.sortVal === 'priceAsc') {
            return function (a, b) {
                if (a.price === b.price) {
                    return a.title > b.title ? 1 : -1;
                } else
                    return a.price > b.price ? 1 : -1;
            }
        } else if (this.sortVal === 'titleAsc') {
            return function (a, b) {
                if (a.title === b.title) {
                    return a.price > b.price ? 1 : -1;
                }
                return a.title > b.title ? 1 : -1;
            }
        } else if (this.sortVal === 'titleDes') {
            return function (a, b) {
                if (a.title === b.title) {
                    return a.price > b.price ? 1 : -1;
                }
                return a.title < b.title ? 1 : -1;
            }
        } else {
            return function (a, b) {
                if (a.price === b.price) {
                    return a.title > b.title ? 1 : -1;
                } else
                    return a.price < b.price ? 1 : -1;
            }
        }
    }

    _resetFilters(e) {
        for (let i = 0, len = this.filterKeys.length; i < len; i++) {
            this.selectedFilters[this.filterKeys[i]] = [];
        }
        this.set('filtersSelected', []);
        this.set('filtered', this.sorted);

        // Reset pager
        // TODO data binding to mixin pagination-helper-mixin.js
        this.set('pagerData', this.sorted);
        this.$.pager.dataChanged();

        const children = this.shadowRoot.querySelectorAll('nm-filter-pane');
        for (let i = 0, len = children.length; i < len; i++) {
            children[i]._resetFilters();
        }
    }

    // _ensureLazyLoaded() {
    //     // load lazy resources after render and set `loadComplete` when done.
    //     if (!this.loadComplete) {
    //         import('./lazy-resources.js').then(() => {
    //             this.loadComplete = true;
    //             console.log('lazy resources', this.loadComplete)
    //         });
    //     }
    // }

    toggle() {
        this.shadowRoot.querySelector('iron-collapse').toggle();
    }
    _setListProperties(){}
}
window.customElements.define('vehicles-list', VehiclesList);

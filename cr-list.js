import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

import '../array-filter/array-filter.js';
import '../nm-sort-by/nm-sort-by.js';
import '../nm-filter-pane/nm-filter-pane.js';
import '../nm-pagination/nm-pagination.js';

// import '../../assets/app-icons.js';
import '../../assets/gomega/app-icons.js';

import '../../assets/vehicle-icons.js';
import './theme/cr-list-styles.js'

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
// TODO
// - set variable for smallDesktop
// - filter after sort
setPassiveTouchGestures(true);

/**
 * `cr-list`
 * @customElement
 * @polymer
 */

let paginationLoaded = false;

export class CrList extends PolymerElement {
    static get template() {
        return html`
        <style include="cr-list-styles"></style>

        ${this.headerTemplate}

        <div id="vehiclesListContainer" class="layout horizontal row vehicles-list-container">
            <array-filter items="{{filtered}}" filtered="{{sorted}}" sort="{{_sort(sortVal)}}" filter="_filter"></array-filter>

            <div id="vehiclesList" class="col col-12 mb-1 vehicles-list-main">
                <div id="notifications"></div>
                ${this.contentTemplate}

<!-- WIP -->
                <nm-pagination id="pager"
                    per-page="{{pagerPerPage}}"
                    range-size="{{pagerRangeSize}}"
                    data="[[sorted]]"
                    current-page="{{pagerCurrentPage}}"
                    total-pages="{{pagerTotalPages}}"
                    pager-verbals="[[verbals.pagination]]">
                </nm-pagination>
            </div>

            <aside class="col col-12 aside">
                <iron-collapse class="filters-outer" opened="{{!smallScreen}}" id="filtersPane">
                    <div class="filters-inner">
                        <slot name="aside-heading"></slot>
                        <p>[[verbals.results]] <strong>[[itemsTotal]]</strong></p>
                        <div class="mb-2 filters-group">
                            <template is="dom-repeat" items="{{filters}}">
                                <nm-filter-pane
                                    id="filter-[[index]]"
                                    class="filter-pane"
                                    data-filter-id="[[item.id]]"
                                    filters-selected="{{selectedFilterValues}}"
                                    filter-event="{{selectEvent}}"
                                    filter-items="[[item.items]]"
                                    filter-title="[[item.title]]">
                                </nm-filter-pane>
                            </template>
                        </div>
                        <button class="mb-1 btn btn-block btn-default" id="resetButton">
                        [[verbals.button_reset]]<iron-icon icon="app-icons:close" aria-hidden="true"></iron-icon></button>
                        <button class="d-md-none mb-1 btn btn-block btn-default" id="closeFilters">[[verbals.button_close]]</button>
                    </div>
                </iron-collapse>
                <slot name="aside-bottom"></slot>
            </aside>
        </div>

        ${this.footerTemplate}
    `;}

    static get headerTemplate() {
        return html`
        <iron-media-query query="max-width: 767px" query-matches="{{smallScreen}}"></iron-media-query>
        <iron-media-query query="max-width: 1339px" query-matches="{{smallDesktop}}"></iron-media-query>

        <div class="layout horizontal justified center vl-header">
            <slot name="vl-header-l"></slot>
            <nm-sort-by alpha-sort-only="[[alphaSort]]" sort-val="{{sortVal}}" verbals="[[verbals.sort]]"></nm-sort-by>

            <iron-selector class="layout horizontal text-center d-xs-none display-items" id="displayItems"
                selected="0" selected-class="selected" on-iron-select="_pagerPerPageChanged">
                <div data-num\$="[[pagerPerPageOptions.0]]" class="btn display-item">[[pagerPerPageOptions.0]]</div>
                <div data-num\$="[[pagerPerPageOptions.1]]" class="btn display-item">[[pagerPerPageOptions.1]]</div>
                <div data-num\$="[[pagerPerPageOptions.2]]" class="btn display-item">[[pagerPerPageOptions.2]]</div>
            </iron-selector>

            <div class="d-md-none" id="toggleFilters">[[verbals.filters]]<iron-icon icon="app-icons:tune" aria-hidden="true"></iron-icon></div>
        </div>
    `}

    static get contentTemplate() {
        return html`
        <div>...</div>
    `}

    static get footerTemplate() {
        return html`
        <div class="layout horizontal justified center flex-xs-wrap">
            <div class="w-50 mb-1 small"></div>
            <!--nm-pagination id="pager"
                per-page="{{pagerPerPage}}"
                range-size="{{pagerRangeSize}}"
                data="[[sorted]]"
                current-page="{{pagerCurrentPage}}"
                total-pages="{{pagerTotalPages}}"
                pager-verbals="[[verbals.pagination]]">
            </nm-pagination -->
        </div>
        <slot name="spinner" id="spinner"></slot>
    `}

    static get properties() {
        return {
            loadComplete:{type: Boolean, value: !1},
            bookingDays: {type: Number, value: 0},
            vehicles: {
                type: Array,
                value: function () { return [] }
            },
            vehiclesSorted: {
                type: Array,
                notify: true,
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
            itemsTotal: {type: Number,notify: true, value: 0},
            filters: {
                type: Array,
                value: function () { return [] }
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
                notify: true,
                value: function () { return [] }
            },
            selectedFilters: {
                type: Object,
                notify: true,
                value: function () { return {} }
            },
            selectedVehicleId: {type: Number, notify: true, reflectToAttribute: true},
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
            pagerPerPage: {
                type: Number,
                notify: true,
                value: 25
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
                value: function () { return [25, 50, 75]; }
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
            termsTarget: String,
            termsTitle: String,
            noimgPath: String,
            alphaSort: {type:Boolean, value:!1},
            attributesOrdinal: {type: Array,value: function() {return []}}
        };
    }

    static get observers() {
        return [
            '_selectedFilterValuesChanged(selectedFilterValues.splices)',
            '_sortedChanged(sorted.*)',
            '_filteredChanged(filtered.*)'
        ]
    }

    _spin() {
        var slotContent = this.$.spinner.assignedNodes()[0];
        if(slotContent && !slotContent.getAttribute('class')) {
            slotContent.classList.add('spin');
        }
    }
    _spinNot() {
        this.set('loadComplete',!0); // TODO review this
        var slotContent = this.$.spinner.assignedNodes()[0];
        if(slotContent && slotContent.getAttribute('class')) {
            setTimeout(function(){
                slotContent.classList.remove('spin');
            },200);
        }
    }
    _fade() {
        var vl = this.$.vehiclesList.classList;
        vl.add('fade');

        setTimeout(function(){
            vl.remove('fade');
        },200);
    }

    _pageChanged(page) {}
    _pagerIndexPage(i) {
        return i + 1;
    }
    _pagerPerPageChanged(e) {
        let p = e.detail.item.attributes['data-num'];
        p = (typeof p !== 'undefined') ? p.value : this.pagerPerPageOptions[0];
        // console.log('__pagerPerPageChanged e', e.detail.item.attributes['data-num'].value,' --> p: ',p);
        this.set('pagerPerPage', p);
        this.set('pagerCurrentPage', 0);
        this.$.pager.dataChanged();
    }

    _filteredChanged(p) {
        // console.log('_filteredChanged ',typeof this.filtered, 'len: ',this.filtered && this.filtered.length);
        if(typeof this.filtered !== 'undefined' && this.filtered.length > 0) {
            // console.log('_filteredChanged ',p);
            this.set('itemsVisible', this.filtered.length);
            (!this.loadComplete) ? this._spinNot() : this._fade();
        }
    }

    _sortedChanged() {
        if(typeof this.sorted !== 'undefined') {
            // console.log('_sortedChanged', this.sorted.length, 'this.loadComplete: ',this.loadComplete);
            this.$.pager.dataChanged();
        }
    }

    _selectedFilterValuesChanged(e) {
        if (typeof e !== 'undefined') {
            // Get last value
            let len = this.get('selectedFilterValues').length;

            // console.log('_selectedFilterValuesChanged len', len);

            // Toggle filters
            if (len > 0) {
                this._toggleFilters(this.selectEvent.detail.item.filter, this.selectEvent);
                // console.log('this.selectedFilters ',this.selectedFilters);
                let arr = this._filter(this.selectedFilters);

                (this.loadComplete && arr.length === 0) && alert(this.verbals.noFilterResults);

                this.set('filtered', arr);
                this.set('itemsTotal', arr.length);
            } else if ((this.selectEvent.type === 'iron-deselect') && (len === 0)) {
                this._resetFilters();
            }
        }
    }

    _filter(item) {
        if (item) {
            let arr = this._findMatchedItems(this.vehicles, this.selectedFilters);
            // console.log('__filtered arr', arr.length);
            return arr;
        }
    }

    _toggleFilters(v, e) {
        let newv, path, key, isDeselect,nval;

        isDeselect = (e.type !== 'iron-select');

        newv = v.split('_');

        path = 'selectedFilters.' + String(newv[0]); // selectedFilters.groupid
        nval = parseInt(newv[1]);
        key = newv[0]; // console.log('newv', newv,' | PATH: ', path,' | newv[1]: ', typeof nval);

        if (!isDeselect) {
            this.push(path, nval); // console.log('PUSH: newv', newv,' path ',path);
        } else {
            // console.log('isDeselect: ', isDeselect);
            let idx = this.selectedFilters[key].indexOf(nval);
            this.splice(path, idx, 1); // console.log('SPLICE: selectedFilters', this.selectedFilters);
        }
    }

    _findMatchedItems(array, filters) {
        if (filters.length === 0) {return}
        var item, key, sf, itkey;

        // console.log('----\nfilters: ', filters,' vehicles copy: ',array.length);
        return array.filter(function (eachObj) { // array item to compare
            for(key in filters) {
                item = eachObj.filters;
                itkey = item[key];
                sf = filters[key];
                // console.log('\n----key: ',key,' item[key]: ',item[key],'| sf: ',sf);
                //
                if (sf.length === 0) {
                    continue;
                }
                // console.log('check item -> eachObj.filters ', item,'\nitkey: ',itkey,' | key: ', key,' | filters: ',filters[key]);

                if (itkey === undefined || !itkey.some(function(v) {
                    return sf.includes(v);
                })) {
                    return false;
                }
            }
            return true
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
        for (var k in this.selectedFilters) {
            this.selectedFilters[k] = [];
        }
        this.set('filtered', this.vehicles);
        this.set('itemsTotal', this.filtered.length);

        // Reset pager
        /* TODO data binding to mixin pagination-helper-mixin.js
        this.set('pagerData', this.vehiclesSorted);
        this.set('itemsTotal', this.vehiclesSorted.length);
        */
        this.$.pager.dataChanged();

        const children = this.shadowRoot.querySelectorAll('nm-filter-pane');
        for (let i = 0, len = children.length; i < len; i++) {
            children[i]._resetFilters();
        }
    }

    toggle() {
        this.shadowRoot.querySelector('iron-collapse').toggle();
        document.body.classList.toggle('noscroll');
    }
    // WIP
    updatePager(arr) {
        console.log('pager-data > e.data:', arr,' | this.pagerData:',this.pagerData);
        // this.set('pagerData', arr); if sort or filter. if pager then push
        // TODO reset array after sort or filter notify resize handler
        for(var i=0,l=arr.length; i < l; i++){
            this.push('pagerData', arr[i]);
        }
        console.log('pagerData', this.pagerData.length);
    }

    ready() {
        super.ready();

        // Set events
        this.$.resetButton.addEventListener('click', this._resetFilters.bind(this), false);
        this.$.toggleFilters.addEventListener('click', this.toggle.bind(this), false);
        this.$.closeFilters.addEventListener('click', this.toggle.bind(this), false);

        var ironList = this.$.viList;
        console.log('>> ironList._physicalAverage: ', ironList._physicalAverage);

        // Anytime our paged set changes, update the template
        this.addEventListener('pager-change', function(e) {
            // console.log('pager-change e.detail.data: ',e.detail.data);
            // this.set('pagerData', e.detail.data);
            this.updatePager(e.detail.data);
        });

        this.addEventListener('pager-data', function (e) {
            console.log('pager-data > e.data:', e.detail.data);
            this.updatePager(e.detail.data);
            // Original model paged. Update the current view
            if(!paginationLoaded) {
                paginationLoaded = true;
            }
        });

        this.set('vehicles', window.APP_VEHICLES);
        this.set('filtered', window.APP_VEHICLES);

        afterNextRender(this, function () {
            this.set('filters', window.APP_FILTERS);

            // Set num of items
            this.set('itemsTotal',this.vehicles.length);

            // Map filters
            if (typeof this.filters !== 'undefined') {
                for (let i = 0, len = this.filters.length; i < len; i++) {
                    this.selectedFilters[this.filters[i].id] = [];
                }
            }
        });
    }
}
window.customElements.define('cr-list', CrList);

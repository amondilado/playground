import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '@polymer/iron-icon/iron-icon.js';
import '../../assets/gomega/shared-styles.js';

/**
 * @customElement
 * @polymer
 * # Examples
 <nm-pagination perpage="5"></nm-pagination>
 <nm-pagination perpage="10" currentPage="3"></nm-pagination>
 * TODO on next click when no next >> TypeError: this._getEl(...).classList is undefined
 */
class NmPagination extends PolymerElement {
    static get template() {
        return html`
            <style include="shared-styles">
            :host {
                --iron-icon-width: var(--pager-icon-size, 1rem);
                --iron-icon-height: var(--pager-icon-size, 1rem);
                display: block;
            }
            .btn {
                background-color: var(--pager-bg-color, #fff);
                color: var(--pager-color, currentColor);
                height: var(--pager-btn-height, 32px);
                width: var(--pager-btn-width, 32px);
                margin-left: 4px;
                margin-right: 4px;
            }
            .btn-page.active {
                background-color: var(--pager-selected-bg-color, #333);
                color: var(--pager-selected-color, #fff);
                pointer-events: none;
            }
            .btn-icon {
                padding: var(--pager-btn-icon-padding-y, 5px) var(--pager-btn-icon-padding-x, 5px);
            }
            </style>

            <button id="first" class="btn btn-hvr btn-icon" type="button" title\$="[[pagerVerbals.first]]" tabindex="0">
                <iron-icon icon="app-icons:chevron-double-left" class="pager-icon" aria-hidden="true"></iron-icon>
            </button>
            <button id="prev" class="btn btn-hvr btn-icon" type="button" title\$="[[pagerVerbals.prev]]" tabindex="0">
                <iron-icon icon="app-icons:chevron-left" class="pager-icon" aria-hidden="true"></iron-icon>
            </button>
            <template is="dom-repeat" items="{{currentRange}}" id="pageItems" as="page">
                <button class\$="btn btn-hvr btn-page [[_computeActiveClass(page, currentPage)]]"
                        on-click="_handlePageNumberClicked" item="[[item]]" data-id\$="[[page]]" type="button" tabindex="0">[[page]]</button>
            </template>
            <button id="next" class="btn btn-hvr btn-icon" type="button" title\$="[[pagerVerbals.next]]" tabindex="0">
                <iron-icon icon="app-icons:chevron-right" class="pager-icon" aria-hidden="true"></iron-icon>
            </button>
            <button id="last" class="btn btn-hvr btn-icon" type="button" title\$="[[pagerVerbals.last]]" tabindex="0">
                <iron-icon icon="app-icons:chevron-double-right" class="pager-icon" aria-hidden="true"></iron-icon>
            </button>
    `;}

    static get properties() {
        return {
            /**
             * The `perPage` attribute defines the number
             * of items to show per page
             *
             * @attribute perPage
             * @type number
             */
            perPage: {
                type: Number,
                notify: true,
                value: 3
            },
            /**
             * The `currentPage` attribute specifies the
             * current active page in view
             *
             * @attribute currentPage
             * @type number
             */
            currentPage: {
                type: Number,
                observer: '_currentPageChanged'
            },

            /**
             * The `currentRange` property specifies the
             * range of pages (e.g 1, 2, 3, 4, 5) to display
             *
             * @property currentRange
             * @type array
             */
            currentRange: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },

            customTemplate: {type: Boolean, value: false},

            /**
             * The `totalPages` specifies the number of paginated pages
             *
             * @property totalPages
             * @type number
             */
            totalPages: {
                type: Number,
                notify: true,
                observer: 'totalPagesChanged',
                value: 0
            },

            /**
             * The `rangeSize` attribute specifies the total size of the paginated range of items
             *
             * @attribute rangeSize
             * @type number
             */
            rangeSize: {
                type: Number,
                value: function () { return 8; }
            },

            /**
             * The `items` property is the cached instance of the model data for pagination
             *
             * @property items
             * @type array
             */
            items: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },

            /**
             * The `data` attribute is the complete set of data we
             * wish to be paginated
             *
             * @attribute data
             * @type array
             */
            data: {
                type: Array,
                notify: true,
                value: function () { return [] }
            },
            prevPageDisabled: {
                type: Boolean,
                notify: true,
                reflectToAttribute: true,
                value: true
            }
        };
    }

    _computeActiveClass(page, currentPage) {
        if (page === this._computedPageNum(currentPage)) {
            console.log('currentPage is ',this._computedPageNum(currentPage));
            return "active";
        }
    }

    _handlePageNumberClicked(e) {
        e.preventDefault();
        var pageNumberClicked = e.target.attributes['data-id'].value;
        console.log('_handlePageNumberClicked ',pageNumberClicked, 'cur: ',this.currentPage);

        var pageNumber = parseInt(pageNumberClicked, 10);
        if (pageNumber !== (this.currentPage - 1)) {
            this.set('currentPage', (pageNumber - 1));
        }
    }

    _getEl(el) {
        return (this.shadowRoot.querySelector(el)) ? this.shadowRoot.querySelector(el): '';
    }

    dataChanged() {
        // this.data is the complete original set of data
        // Update current range to account for items per page, range.
        this.set('currentRange', this._range());
        this.totalPages = this.getPageCount(); // Cache the total page count

        // Update model bound to UI with filtered range
        this.set('items', this.filterPage());
        console.log('__dataChanged items: ',this.items);
        this._checkBounds(this.currentPage);
        this.dispatchEvent(new CustomEvent('pager-data', {
            bubbles: true,
            composed: true,
            detail: {data: this.items}
        }));
    }

    // Zero based to 1 base
    _computedPageNum(i) {
        return i+1;
    }

    /**
     * Navigate to the first page
     *
     * @method firstPage
     */
    firstPage(e) {
        e.preventDefault();
        this.set('currentPage', 0);
    }

    /**
     * Navigate to the last page
     *
     * @method lastPage
     */
    lastPage(e) {
        e.preventDefault();
        //paginations includes total if(this.perPage)
        const range = this.currentRange;
        let inRange = ~range.indexOf(this.getPageCount() + 1);
        console.log('lastPage inRange ',inRange);
        this.set('currentRange', this._range(this.getPageCount()+1));

        this.set('currentPage', this.getPageCount());
        console.log('_last currentPage',this.currentPage);
    }

    /**
     * Called when navigating to the previous page
     *
     * @param {Object} page
     * @event pager-previous
     */
    /**
     * Navigate to the previous page
     *
     * @method prevPage
     */
    prevPage(e) {
        e.preventDefault();
        if (this.currentPage > 0) {
            this.set('currentPage', this.currentPage - 1);
            this.dispatchEvent(new CustomEvent('pager-previous', {bubbles: true, composed: true, detail: {page: this.currentPage}}));
        }
    }

    /**
     * Called when navigating to the next page
     *
     * @param {Object} page
     * @event pager-next
     */
    /**
     * Navigate to the next page
     *
     * @method nextPage
     */
    nextPage(e) {
        e.preventDefault();
        if (this.currentPage < this.getPageCount()) {
            this.set('currentPage', this.currentPage + 1);
            this.dispatchEvent(new CustomEvent('pager-next', {bubbles: true, composed: true, detail: {page: this.currentPage}}));
        }
    }

    _checkBounds(page) {
        var isFirst = (page === 0), isLast = (this.currentPage === this.totalPages);
        console.log('_checkBounds isFirst',isFirst,'isLast',isLast);
        this.$.prev.disabled = this.$.first.disabled = isFirst;
        this.$.next.disabled = this.$.last.disabled = isLast;
    }

    /**
     * Updates the current page if the page is in bound
     * Dropdown selection
     * @param {string} page
     * @method changePage
     */
    changePage(page) {
        const desiredPage = parseInt(page);
        if (desiredPage <= this.getPageCount()) {
            this.currentPage = desiredPage;
        }
    }

    getPageCount() {
        if (typeof this.data !== 'undefined' || this.data.length > 1) {
            return Math.ceil(this.data.length / parseInt(this.perPage)) - 1; // zero based
        } else {
            console.log('--> data: 1', this.data.length);
            return 0;
        }
    }

    setPage(e, d, t) {
        e.preventDefault();
        // let model = this.$.pageItems.modelForElement(t_el); if (model.index > 0) { console.log('model.item: ',model.item); }
        t = e.target.item - 1;
        if (Number(this.currentPage) === t) return;
        this.set('currentPage', Number(t, 10));
        this._checkBounds(this.currentPage);
    }

    /**
     * Called when the current page changes
     *
     * @param {Object} page
     * @event pager-change
     */
    _currentPageChanged(n, o) {
        let oldEl = this._getEl('.active'), idx = this.currentPage + 1,
            newEl = this._getEl('[data-id="'+idx+'"]');

        console.log('_currentPageCH currentPage ', this.currentPage, ' + 1:',idx, 'n,o',n,o);
        if ((typeof this.items === 'undefined') || this.items.length === 0) { return; }

        if(oldEl) oldEl.classList.remove('active');
        if(newEl) newEl.classList.add('active');

        this.set('items', this.filterPage());
        console.log('__currentCH items: ',this.items);
        // console.log('newEl ', this._getEl(newEl));

        this.set('currentRange', this._range());
        console.log('currentRange ', this.currentRange);
        this._checkBounds(this.currentPage);
        this.dispatchEvent(new CustomEvent('pager-change', {bubbles: true, composed: true, detail: {page: this.currentPage, data: this.items}}));
    }

    perPageChanged() {
        this._currentPageChanged();
        this.totalPages = this.getPageCount(); // Cache the total page count
    }

    _range(page) {
        var curr = (page) ? page : this.currentPage;
        let paginations = [],
            half = Math.floor(this.rangeSize / 2),
            totalPages = this.getPageCount();

        let visiblePages = this.rangeSize,
            start = curr - half + 1 - (this.rangeSize % 2),
            end = curr + half;

        console.log('INIT visible: ',visiblePages,' | total: ',totalPages,' | half: ',half,' | cur: ',curr,' | start: ',start,' | end: ',end);

        if (visiblePages > totalPages) {
            visiblePages = totalPages + 1;
        }

        // handle boundary case
        if (end > visiblePages) {
            start = visiblePages / 2;
            end = totalPages + 1;
            console.log('check end | start: ',start,' | end: ',end);
        }
        if (start <= 0) {
            start = 1;
            end = visiblePages;
            console.log('check start');
        }
        console.log('__rang: visible: ',visiblePages,' | total: ',totalPages,' | half: ',half,' | cur: ',curr,' | start: ',start,' | end: ',end);
        let itPage = start;
        while (itPage <= end) {
            paginations.push(itPage);
            itPage++;
        }
        console.log('paginations ', paginations);

        return paginations;
    }

    filterPage() {
        const cur = parseInt(this.currentPage), perpage = parseInt(this.perPage),
              sb = cur * perpage, se = sb + perpage;
        // var newslice = this.data.slice(sb, se);
        // console.log('__filterPages: perPage: ',this.perPage,'slice(',sb,',',se,')',newslice);
        return this.data.slice(sb, se);
    }

    totalPagesChanged(n,o) {
        (n === 0) ? this.setAttribute('hidden',"") : this.removeAttribute('hidden');
    }

    constructor() {
        super();
        if (!APP.paginationInstance) APP.paginationInstance = this;
    }

    ready() {
        super.ready();
        this.$.first.addEventListener('click', this.firstPage.bind(this), false);
        this.$.last.addEventListener('click', this.lastPage.bind(this), false);
        this.$.prev.addEventListener('click', this.prevPage.bind(this), false);
        this.$.next.addEventListener('click', this.nextPage.bind(this), false);
    }
}

window.customElements.define('nm-pagination', NmPagination);

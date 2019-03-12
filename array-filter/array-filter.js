import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
// import {microTask} from '@polymer/polymer/lib/utils/async.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';

/*
`array-filter`
Provides the ability to filter/sort an array and maintain bindings
When filtering/sorting arrays, it is difficult to maintain bindings. The `array-filter`
element ensures that bindings and change paths are linked correctly, allowing for a filtered
and/or sorted copy of an array to remain fully in sync.
    This behaves in a similar way to the core `array-selector` element but with
    an emphasis on full array operations rather than simple selection.
    ```html
    <array-filter
        items="{{items}}"
        filtered="{{filtered}}"
        filter="_filter"></array-filter>
    <iron-list items="{{filtered}}">
        <div>{{item.name}}</div>
    </iron-list>
```
As in the example, you can see that `filtered` becomes a fully bound copy
of the initial array with our filter applied.
    This works very nicely with elements such as `iron-list` which do not
    have their own filtering or sorting logic.
    ### Observing child sub-properties
Your sort and/or filter function may depend on a particular property
which each child has. If this is the case, you will likely want to
trigger a sort/filter when these properties change.
    For this reason, you can use the `observe` propert.
    ```html
    <array-filter
        items="{{items}}"
        filtered="{{filtered}}"
        observe="name"
        filter="_filter"></array-filter>
```
In the example, any time the `name` property of a child changes, the sort
and filter state will be recomputed.
    @demo demo/index.html
*/

class ArrayFilter extends PolymerElement {
    static get properties() {
        return {
            /*
             * An array containing items to be filtered/sorted
             */
            items: {
                type: Array,
                notify: true
            },
            /*
             * The `items` array after having any filter/sort applied
             */
            filtered: {
                type: Array,
                notify: true
            },
            /*
             * A space-separated list of paths to observe in children.
             * When one or more of these paths change in a child, the
             * child will be re-sorted/re-filtered.
             */
            observe: {
                type: String
            },
            /*
             * A function or the name of a method to be used for
             * filtering the `items` array.
             */
            filter: {
                type: Function,
                // observer: '_filterChanged'
            },
            /*
             * A function or the name of a method to be used for
             * sorting the `items` array.
             */
            sort: {
                type: Function,
                observer: '_sortChanged'
            }
        };
    }

    static get observers() {
        return [
            '_itemsChanged(items.*)'
        ];
    }

    constructor() {
        super();
        this._filterDebouncer = null;
    }

    _sortChanged(val) {
        // console.log('_AF: _sortChanged');
        var host = this.getRootNode().host;
        var sort = val;
        if(!sort) {
            sort = undefined;
        } else {
            if(typeof val !== 'function') {
                sort = function() {
                    return host[val].apply(host, arguments);
                };
            }
        }
        this._sortFn = sort;
        if(this.items) {
            this._debounceFilter();
        }
    }
    _debounceFilter() {
        // console.log('_AF: _debounceFilter');
        this._filterDebouncer = Debouncer.debounce(
            this._filterDebouncer,
            timeOut.after(400),
            this._filter.bind(this)
        );

        // # vs /
        // this._filterDebouncer = Debouncer.debounce(
        //     this._filterDebouncer,
        //     microTask,
        //     this._filter.bind(this));

    }

    _filterChanged(val) {
        console.log('_AF: _filterChanged val: ',val);
        var host = this.getRootNode().host;

        var filter = val;
        if(!filter) {
            filter = undefined;
        } else {
            if(typeof filter !== 'function') {
                filter = function() {
                    return host[val].apply(host, arguments);
                };
            }
        }
        this._filterFn = filter;
        if(this.items) {
            this._debounceFilter();
        }
    }

    _itemsChanged(change) {
        var path = change.path;
        if(path === 'items') {
            this._debounceFilter();
        } else if(path === 'items.length') {
        } else if(path === 'items.splices') {
            this._computeSplices(change.value.keySplices, change.value.indexSplices);
        } else {
            this._checkSort(change.path);
        }
    }

    _resetLinks() {
        if(this.filtered) {
            var item, idx;
            for(var i = 0; i < this.items.length; i++) {
                item = this.items[i];
                this.unlinkPaths('items.' + i);
                idx = this.filtered.indexOf(item);
                if(idx !== -1) {
                    this.linkPaths(
                        'items.' + i,
                        'filtered.' + idx
                    );
                }
            }
        }
    }
    _filter() {
        this.filtered = this._computeFiltered(this.items);
        this._resetLinks();
    }
    /*
     * Forces filter/sort to be re-applied asynchronously
     * @method update
     */
    update() {
        this._debounceFilter();
    }
    _computeFiltered(base) {
        if(!base) {
            return;
        }
        var result = base.slice(0);
        if(this._filterFn) {
            result = result.filter(this._filterFn);
        }
        if(this._sortFn) {
            result = result.sort(this._sortFn);
        }
        return result;
    }
    _computeSplices(keys, index) {
        index.forEach(function(splice) {
            var filtered = this._computeFiltered(splice.object);
            var inserts = [];
            var item;
            splice.removed.forEach(function(remove) {
                this.splice('filtered',
                    this.filtered.indexOf(remove), 1);
            }.bind(this));
            for(var i = 0; i < splice.addedCount; i++) {
                item = splice.object[splice.index + i];
                if(filtered.indexOf(item) !== -1) {
                    inserts.push([item, filtered.indexOf(item)]);
                }
            }
            inserts.sort(function(a, b) {
                return a[1] - b[1];
            }).forEach(function(insert) {
                this.splice('filtered', insert[1], 0, insert[0]);
            }.bind(this));
        }.bind(this));
        this._resetLinks();
    }
    _applyObserver(path) {
        var parts = path.split('.');
        var filtered = this._computeFiltered(this.items);
        var item = this.items[parseInt(parts[1])];
        var currentIdx = this.filtered.indexOf(item);
        var newIdx = filtered.indexOf(item);
        if(currentIdx !== newIdx) {
            if(currentIdx !== -1) {
                this.unlinkPaths('filtered.' + currentIdx);
                this.splice('filtered', currentIdx, 1);
            }
            if(newIdx !== -1) {
                this.splice(
                    'filtered',
                    newIdx,
                    0,
                    item
                );
            }
        }
        this._resetLinks();
    }
    _checkSort(path) {
        var parts = path.split('.');
        var key = parts[1];
        if(this.observe && (this.sort || this.filter)) {
            if(parts.length <= 2) {
                this._debounceFilter();
            } else {
                var tail = parts.slice(2).join('.');
                var observe = this.observe.split(' ');
                var matches = observe.some(function(p) {
                    // TODO: Use Polymer.Path when it exists
                    return (tail === p) ||
                        tail.indexOf(p + '.') === 0 ||
                        p.indexOf(tail + '.') === 0;
                });
                if(matches) {
                    this._applyObserver(path);
                }
            }
        }
    }
}

customElements.define('array-filter', ArrayFilter);
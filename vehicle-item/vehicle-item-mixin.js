/**
 * @polymerMixin
 */
export const VehicleItemMixin = superClass => class extends superClass {
    static get properties() {
        return {
            itemId: Number,
            title: { type: String, value:"" },
            groupId: Number,
            groupName: { type: String, value:"" },
            available: {type: Boolean, value: false},
            availabilityTitle: { type: String, value:"" },
            attributes: {type: Object, value: function(){return{}}},
            attributesOrdinal: {type: Array,value: function() {return []}},
            priceSuggested: String,
            discount: {type: String, computed: '_hasDiscount()'},
            images: {type: Array, value: function() {return[]}},
            isListitem: { type: Boolean, reflectToAttribute: true },
            noimgPath: { type: String, value:"" },
            verbals: { type: Object, value: function() {return{}}},
            allVehiclesCommonText: { type: String, value:"" },
            smallDesktop: {type: Boolean, value: false},
            opened: {
                type: Boolean, reflectToAttribute: true, value: false
            }
        };
    }

    // # Methods
    _hasValue(val) {
        return !!(val);
    }

    _sanitize(val) {
        return (val) ? val : '';
    }

    _formatPrice(val) {
        return (val) ? parseFloat((val * 100) / 100).toFixed(2) + "€": '';
    }

    _hideTerms() {
        return !(this.termsLink && this.termsLink !== "");
    }

    _evaluateText(str,id) {
        if(str && id) {
            let ft = document.createRange().createContextualFragment(str);
            this.$[id].appendChild(ft);
        } else return '';
    }

    toggle() {
        this.shadowRoot.querySelector('iron-collapse').toggle();
        // this.$.vironList.fire('iron-resize')
        this.dispatchEvent(new CustomEvent('opened-changed', {
            bubbles: true,
            composed: true
            // detail: {data: this.items}
        }));
    }
};

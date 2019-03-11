import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-media-query/iron-media-query.js';
import './vehicle-item-header.js';
import './vehicle-attributes.js';
import {VehicleItemMixin} from './vehicle-item-mixin.js';
import './vehicle-item-styles.js';
import './vehicle-list-item-styles.js';

/**
 * `vehicle-list-item`
 *
 * @customElement
 * @polymer
 * TODO:
 * - dom if for mobile and view for attributes - for IE
 */
class VehicleListItem extends VehicleItemMixin(PolymerElement) {
    static get properties() {
        return {
            isListitem: { type: Boolean, reflectToAttribute: true },
            price: Number,
            priceInitial: Number,
            pricePerDay: Number,
            discountPercentage: Number,
            hasDiscount: {
                type: Boolean,
                value: false
            },
            // Reservation details
            bookingDays: Number
        };
    }

    static get template() {
      return html`
        <style include="vehicle-item-styles vehicle-list-item-styles">
            .discount { color: var(--secondary); }
            .price-per-day { font-size:14px; margin-bottom: 8px;}
            .price-initial { font-size: .647em; color: var(--text-muted); display: inline-block; }
            .btn-tertiary {
                background-color: var(--tertiary,#036);
                color: #fff;
            }
            .btn-tertiary:hover, .btn-tertiary:focus {
                background-color: var(--tertiary-hover, #0d4985);
            }

            @media (min-width: 992px) and (max-width: 1339px) {
                .price-per-day {
                    -webkit-box-ordinal-group: 3;
                    -ms-flex-order: 2;
                    order: 2;
                }
            }

            @media (min-width: 1340px) {
                .price { margin-bottom: 10px; }
                .price-per-day, .discount { padding-left: 24px; }
            }
        </style>
        <style>
        @media(max-width:992px) {
            iron-collapse {display: none;}
            iron-collapse.iron-collapse-opened {display: block;} /* :host([opened])*/
        }
        </style>

      <div class="card-left">
        <vehicle-item-header
            id="[[itemId]]"
            noimg-path="[[noimgPath]]"
            images="[[images]]"
            title="[[title]]"
            group-name="[[groupName]]"
            available="[[available]]"
            verbal-group="[[verbals.vehicleItem.group]]"
            verbal-unavailable="[[verbals.vehicleItem.unavailable]]">
        </vehicle-item-header>
      </div>

      <div class="card-middle">
        <iron-media-query query="max-width:1339px" query-matches="{{smallDesktop}}"></iron-media-query>

        <button class="btn btn-block mb-1 btn-link d-xl-none" on-click="toggle" aria-expanded\$="[[opened]]" aria-controls="collapse" type="button" id="toggleDetails">[[verbals.button.viewDetails]]</button>

        <iron-collapse class="collapse-md" opened="[[!opened]]">
          <vehicle-attributes attributes="[[attributes]]" attributes-ordinal="[[attributesOrdinal]]" is-listitem="[[isListitem]]"></vehicle-attributes>

          <div id="textCommons" class="vehicles-info-text">[[_evaluateText(allVehiclesCommonText,'textCommons')]]</div>
          <div class="middle-footer">
            <a href="[[termsLink]]" class="terms-link" target$="[[termsTarget]]" hidden$="[[_hideTerms()]]">[[termsTitle]]</a>
          </div>
        </iron-collapse>
      </div>

      <div class="card-right">
          <div class="card-footer">
            <div class="mb-1 price-per-day" hidden$="[[!_formatPrice(pricePerDay)]]">
                <strong>[[_formatPrice(pricePerDay)]]</strong> [[verbals.pricePerDay]]
            </div>
            <div class="mb-1 strong discount">[[_computeDiscount(discountPercentage,verbals.datesFromTo)]]</div>
            <div class="total">
                <div class="ff-2 price">
                    <del class="mb-1 price-initial" hidden$="[[_hidePriceInitial(priceInitial)]]">[[_formatPrice(priceInitial)]]</del>
                    <div class="clr-3 strong price-total">[[_formatPrice(price)]]</div>
                </div>
                <div class="total-days"><span id="totalDays">[[_evaluateText(verbals.priceForBookingDays,'totalDays')]]</span> <small>([[verbals.vatIncluded]])</small></div>
            </div>
          </div>

          <div class="text-center card-actions" id="vehicleActions">
            <button class="btn btn-block btn-lg btn-secondary btn-book" hidden="[[!available]]" type="button">[[verbals.button.bookNow]]</button>
            <button class="btn btn-block btn-lg btn-tertiary btn-book" hidden="[[available]]" type="button">[[verbals.button.sendRequest]]</button>
          </div>
      </div>
    `;}

    _submitHandler(e) {
        const submitForm = new CustomEvent('submit-form', {
            bubbles: true,
            composed: true,
            detail: {selected: this.itemId, selectedGroup: this.groupId }
        });
        this.dispatchEvent(submitForm);
    }

    _computeDiscount(int, str) {
        if (int && str) {
            return '-' + int + '% ' + str;
        }
    }

    _hidePriceInitial(val) {
        return !(val && this.discountPercentage);
    }

    ready() {
        super.ready();
        const btns = this.shadowRoot.querySelectorAll('.btn-book');
        btns[0].addEventListener('click', this._submitHandler.bind(this), false);
        btns[1].addEventListener('click', this._submitHandler.bind(this), false);
    }
}
window.customElements.define('vehicle-list-item', VehicleListItem);

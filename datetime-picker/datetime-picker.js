import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import './date-display.js';
import {DatePickerBehavior} from './datepicker-behavior.js';
import '../app-datepicker/app-datepicker.js';
import '../time-picker/time-picker.js';
import '../../assets/reboot-styles.js';
import '../../assets/grid-styles.js';
import './datetime-icons.js';
import './datetime-styles.js';

/* Adaptation of component app-datepicker https://www.webcomponents.org/element/motss/app-datepicker/elements/app-datepicker
* TODO
* - Highlight duration
*/

// Date & Time 1, Date & Time 2: ! Use of input-date attr caused miscalculation on active month of year change
const template = html`
<dom-module id="datetime-picker">
    <template strip-whitespace>
        <style include="reboot-styles grid-styles datetime-styles"> 
            :host {
                --adp-backdrop-bg: rgba(0,0,0,.2) default;
            }
            #adpBackdrop {
                background-color: var(--adp-backdrop-bg);
                position: fixed;top: 0;left: 0;right: 0;bottom: 0;display: none;z-index: 90;
            }
            app-datepicker {
                display: none;box-shadow: 0 2px 20px rgba(0,0,0,.2);position: absolute;overflow: hidden;z-index: 100;
            }
            app-datepicker[open="true"] { display: block; }            
            .btn-date {@apply --adp-btn-date;}
            .date-section {@apply --adp-date-section}
            @media (max-width: 479px) {app-datepicker { margin-left: -80px!important; }}
        </style>
        <div id="adpBackdrop" on-click="_closeDialog"></div>
        <div id="dateTime1" class="adp-item">
            <div class="col date-section">
                <slot name="label-date-start"></slot>
                <button on-click="_toggleDialog" type="button" class="btn btn-date">
                    <date-display date="{{formattedDate_1}}"></date-display><iron-icon class="btn-icon" icon="datetime-icons:calendar" aria-hidden="true"></iron-icon>
                </button>
                <app-datepicker id="dp1"
                    no-animation
                    range-dates="[[rangeDates]]"
                    format="[[format]]"
                    locale="[[locale]]"
                    date="{{selectedDate_1}}"
                    on-date-changed="_onSelectedDateChanged"
                    input-date="{{inputDate}}"
                    min-date="{{minDate}}"
                    max-date="{{maxDate}}"
                    auto-update-date
                    disable-days="[[disableDays]]"
                    disable-dates="{{disableDates}}"
                    verbals="[[_sanitizeObj(verbals)]]"
                ></app-datepicker>
            </div>
            <time-picker id="time" class="col time-section"
                hour="{{selectedHour}}"
                minutes="{{selectedMinutes}}"
                time-interval="[[hourIntervals]]"
                horizontal-offset="[[paperMenuBtnHoffset]]"
                drop-vertical-offset="[[verticalOffset]]"
                verbals="[[_sanitizeObj(verbals)]]">
                <iron-icon slot="time-icon" class="btn-icon" icon="datetime-icons:time" aria-hidden="true"></iron-icon>
            </time-picker>
        </div>
    </template>
    `;
template.setAttribute('style', 'display: none;');
document.body.appendChild(template.content);

Polymer({
    is: 'datetime-picker',
    behaviors: [DatePickerBehavior],

    properties: {
        locale: String,
        inputDate: String,
        format: {type: String,value: "yyyy-mm-dd"},
        maxDate: String,
        timeInterval: {
            type: String,
            value: '00'
        },
        hourIntervals: {
            type: Array,
            computed: '_setInterval(timeInterval)'
        },
        paperMenuBtnHoffset: {type:Number, value: 0},
        verticalOffset: {type:Number, value: 0},
        rangeDates: {type: Array, value: function() {return []}},
        disableDays: {type: Array, value: function() {return []}},
        selectedDate_1: {
            type: String,
            notify: true
        },
        selectedHour: {
            type: String,
            notify: true
        },
        selectedMinutes: {
            type: String,
            notify: true
        },
        verbals: {type: Object, value: function(){return {}}}
    },

    ready: function ready() {
        this.async(function () {
            this.fire("datetime-picker-ready")
        });
    }
});
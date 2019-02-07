/* Adaptation of component app-datepicker https://www.webcomponents.org/element/motss/app-datepicker/elements/app-datepicker
* TODO
* - Highlight duration
* - Verbals
*/

import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js';

import '@polymer/neon-animation/neon-animations.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import './date-display.js';
import {DatePickerBehavior} from './datepicker-behavior.js';
import './app-datepicker.js';
import '../../assets/gomega/reboot-styles.js';
import '../../assets/gomega/grid-styles.js';
import '../../assets/gomega/shared-button-styles.js';
import '../../assets/app-icons.js';

const template = html`
<dom-module id="app-datetime-picker">
    <template strip-whitespace>
        <style include="reboot-styles grid-styles shared-button-styles">
            :host {
                --adp-backdrop-bg: rgba(0,0,0,.2) default;
                --paper-item-min-height: 34px
            }
            #adpBackdrop {
                background-color: var(--adp-backdrop-bg);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: none;
                z-index: 90;
            }
            app-datepicker {
                display: none;
                box-shadow: 0 2px 20px rgba(0,0,0,.2);
                position: absolute;
                /* top: 100%; TODO variable */
                left: 0;
                overflow: hidden;
                z-index: 100;
            }
            app-datepicker[open="true"] { display: block; }
            paper-menu-button {
                padding: 0;
                flex: 0 0 50%;
                width: 50%;
            }
            paper-listbox { max-height: 480px; }
            paper-item { cursor: pointer; width: 160px; }
            paper-item.iron-selected:focus:before {
                background-color: #fff;
            }

            .adp-item {
                position: relative;
                flex: 0 0 100%;
                max-width: 100%;
                padding-right: var(--grid-gutter-half, 10px);
                padding-left: var(--grid-gutter-half, 10px);
                @apply --adp-item;
            }
            .time-selection {
                display: flex;
                flex-flow: row wrap;
                align-items: center;
                justify-content: space-between;
            }
            .btn {
                background: var(--adp-btn-bg);
                color: var(--adp-btn-color);
                text-align: left;
                width: 100%;

                @apply --adp-btn;
            }
            .btn-date {
                @apply --adp-btn-date;
            }
            .btn-time {
                position: relative;
                @apply --adp-btn-time;
            }
            .btn-time::after {
                content: '';
                border-style: solid;
                border-width: 0 1px 1px 0;
                border-color: transparent var(--primary) var(--primary) transparent;
                position: absolute;
                right: 28px;
                top: 50%;
                margin-top: -6px;
                pointer-events: none;
                height: 10px;
                width: 10px;
                -webkit-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                transform: rotate(45deg);
                z-index: 0;
            }
            .btn-label {
                margin-left: 10px;
                font-weight: bold;
                font-size: 18px;
                display: inline-block;
                vertical-align: middle;
            }

            @media (min-width: 768px) {
                .adp-item {
                    flex-basis: 50%;
                    max-width: 50%;
                }
            }
        </style>
        <div id="adpBackdrop" on-click="_closeDialog"></div>
        <!-- Date & Time 1, Date & Time 2: ! Use of input-date attr caused miscalculation on active month of year change  -->
        <div id="dateTime1" class="adp-item">
            <slot name="label-date-start"></slot>
            <button on-click="_toggleDialog" type="button" class="btn btn-date">
                <date-display date="{{formattedDate_1}}"></date-display>
            </button>
            <app-datepicker
                id="dp1"
                format="yyyy-mm-dd"
                date="{{selectedDate_1}}"
                on-date-changed="_onSelectedDateChanged"
                input-date="{{inputDate}}"
                min-date="{{minDate}}"
                max-date="{{maxDate}}"
                auto-update-date="true"
                disable-days="{{disableDays}}"
                disable-dates="{{disableDates}}"
                no-animation
            ></app-datepicker>

            <div class="time-selection">
                <paper-menu-button id="time1" horizontal-offset="[[paperMenuBtnHoffset]]">
                    <div slot="dropdown-trigger">
                        <button class="btn btn-time" type="button"><iron-icon icon="app-icons:time" aria-hidden="true"></iron-icon>
                        <span class="btn-label">{{_timeStart.h}}</span></button>
                    </div>
                    <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{_timeStart.h}}" id="timeStartHoursList">
                        <template is="dom-repeat" items="[[hours]]" id='t1_list'>
                            <paper-item data-index$="[[index]]">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-menu-button>

                <paper-menu-button id="minutes1" horizontal-offset="[[paperMenuBtnHoffset]]">
                    <div slot="dropdown-trigger">
                        <button class="btn btn-time" type="button"><iron-icon icon="app-icons:time" aria-hidden="true"></iron-icon>
                        <span class="btn-label">[[_getIndexValue(_timeStart.m, minutes)]]</span></button>
                    </div>
                    <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{_timeStart.m}}" id="timeStartMinutesList">
                        <template is="dom-repeat" items="[[_setTimeInterval(timeInterval)]]" id='t1m_list'>
                            <paper-item data-index$="[[index]]" value$="[[item]]">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-menu-button>
            </div>
        </div>
        <div id="dateTime2" class="adp-item">
            <slot name="label-date-end"></slot>
            <button on-click="_toggleDialog" type="button" class="btn btn-date">
                <date-display date="{{formattedDate_2}}"></date-display>
            </button>
            <app-datepicker
                id="dp2"
                format="yyyy-mm-dd"
                date="{{selectedDate_2}}"
                on-date-changed="_onSelectedDateChanged"
                max-date="{{maxDate}}"
                auto-update-date="true"
                disable-days="{{disableDays}}"
                disable-dates="{{disableDates}}"
                no-animation
            ></app-datepicker>

            <div class="time-selection">
                <paper-menu-button id="time1" horizontal-offset="[[paperMenuBtnHoffset]]">
                    <div slot="dropdown-trigger">
                        <button class="btn btn-time" type="button"><iron-icon icon="app-icons:time" aria-hidden="true"></iron-icon>
                        <span class="btn-label">{{_timeEnd.h}}</span></button>
                    </div>
                    <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{_timeEnd.h}}" id="timeEndHoursList">
                        <template is="dom-repeat" items="[[hours]]" id='t1_list'>
                            <paper-item data-index$="[[index]]">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-menu-button>

                <paper-menu-button id="minutes1" horizontal-offset="[[paperMenuBtnHoffset]]">
                    <div slot="dropdown-trigger">
                        <button class="btn btn-time" type="button"><iron-icon icon="app-icons:time" aria-hidden="true"></iron-icon>
                        <span class="btn-label">[[_getIndexValue(_timeEnd.m, minutes)]]</span></button>
                    </div>
                    <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{_timeEnd.m}}" id="timeEndMinutesList">
                        <template is="dom-repeat" items="[[_setTimeInterval(timeInterval)]]" id='t1m_list'>
                            <paper-item data-index$="[[index]]" value$="[[item]]">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-menu-button>
            </div>
        </div>
    </template>
    `;
template.setAttribute('style', 'display: none;');
document.body.appendChild(template.content);

Polymer({
    is: 'app-datetime-picker',
    behaviors: [DatePickerBehavior],
    //
    properties: {
        timeInterval: {
            type: String,
            value: '00'
        },
        minutes: {
            type: Array,
            computed: '_setTimeInterval(timeInterval)'
        },
        hours: {
            type: Array,
            computed: '_setHours()'
        },
        timeStart: { type: String, notify: true, observer: '_initTimeStart' },
        _timeStart: { type: Object, notify: true, value: function() { return { h: 12, m: 0 } } },
        timeEnd: { type: String, notify: true, observer: '_initTimeEnd' },
        _timeEnd: { type: Object, notify: true, value: function() { return { h: 12, m: 0 } } },

        paperMenuBtnHoffset: Number,
    },

    observers: [
        '_computeTimeStart(_timeStart.*)',
        '_computeTimeEnd(_timeEnd.*)',
    ],

    _setHours: function() {
        let h=[], i=0;
        do {
            h.push(i);
            i++;
        } while (i < 23);
        return h;
    },
    _setTimeInterval: function(str) {
        return (str === '00') ? str : (str === '30') ? ['00','30'] : ['00','15','30','45'];
    },
    _validateTime() {

    },
    _initTimes: function(el, val) {
        let idxh, idxm, nval = val.split(':');
        if(parseInt(nval[0]) > 1 && parseInt(nval[0]) < 23) {
            this[el].h = parseInt(nval[0]);
            this.notifyPath(el+'.h');
        }

        idxm = this.minutes.indexOf(nval[1]);
        if(idxm > -1) {
            this[el].m = idxm;
            this.notifyPath(el+'.m'); //el['m']
        }
    },
    _initTimeStart: function(n,o) {
        if(typeof n === 'undefined') return;
        this._initTimes('_timeStart',n);
    },
    _initTimeEnd: function(n,o) {
        if(typeof n === 'undefined') return;
        this._initTimes('_timeEnd',n);
    },
    _computeTimeStart: function(p) {
        console.log('_computeTimeStart',p.path);
    },
    _computeTimeEnd: function(p) {
        console.log('_computeTimeEnd',p.path);
    },
    _getIndexValue: function(i, arr) {
        return arr[i]
    },

    getElements: function(el) {
        return dom(this.$[el]).querySelectorAll('paper-item');
    },
    ready: function ready() {
        this.async(function () {
            this.fire("datetime-picker-ready")
        });
    }
});

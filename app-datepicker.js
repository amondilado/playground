/* app-datepicker https://www.webcomponents.org/element/motss/app-datepicker/elements/app-datepicker
* ...is being upgrading to polymer 3!
* TODO
* - group styles
* - remove buttons scripts
* - remove year
* - gotoToday view
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

import '@polymer/iron-list/iron-list.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './app-datepicker-icons.js';

const template = html`
<dom-module id="app-datepicker">
  <template strip-whitespace>
    <style>
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;

        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: var(--app-datepicker-bg, #fafafa);

        @apply --app-datepicker;
      }

      * {
        box-sizing: border-box;
      }

      .datepicker {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;

        position: relative;
        max-height: 384px;
        width: var(--adp-width, 280px);
        height: var(--adp-height, 254px);
      }

      .navigator {
        background: var(--adp-navigator-bg, #fff);
        color: var(--adp-navigator-color, #333);
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;

        max-height: 40px;
        padding: 0 10px;
        position: relative;
      }
      .nav-month-year {
        -ms-flex: 1 1 auto;
        -webkit-flex: 1 1 auto;
        flex: 1 1 auto;

        font-size: 14px;
        font-weight: 500;
        text-align: center;

        @apply --app-datepicker-nav-month-year;
      }
      .days-of-week {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;

        background: var(--adp-weekdays-bg, #fff);
        color: var(--app-datepicker-weekdays-color, #848484);
        font-size: 12px;

        @apply --app-datepicker-days-of-week;
      }
      .each-days-of-week {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;

        margin-left: 10px;
        margin-right: 10px;
        max-height: 32px;
        padding: 0;
        width: calc(100% / 7 - 20px);
      }
      .days-of-month {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
        -ms-flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;

        font-size: 13px;
        margin-top: 8px;

        @apply --app-datepicker-days-of-month;
      }
      .each-days-of-month {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;

        position: relative;
        height: 29px;
        margin-left: 5px;
        margin-right: 5px;
        width: calc(100% / 7 - 10px);
      }
      div > .days-of-month > .each-days-of-month.chosen-days-of-month {
        border-radius: 50%;
        background-color: var(--app-datepicker-selected-day-bg, #009688);
        color: var(--app-datepicker-selected-day-color, #fff);
      }
      .days-of-month > .each-days-of-month.is-today {
        color: var(--app-datepicker-today-color, #009688);
      }
      .days-of-month > .each-days-of-month.is-disabled-day {
        color: var(--app-datepicker-disabled-color, #9e9e9e);
      }


      /* outline: none for non-selectable and disabled days */
      .days-of-month > .each-days-of-month.is-disabled-day,
      .days-of-month > .each-days-of-month.is-non-selectable {
        outline: none;
      }
      /* Date hover styling */
      .days-of-month > .each-days-of-month:hover:not(.is-disabled-day):not(.is-non-selectable):not(.chosen-days-of-month),
      .days-of-month > .each-days-of-month:focus:not(.is-disabled-day):not(.is-non-selectable):not(.chosen-days-of-month) {
        color: var(--app-datepicker-date-hover-color, #f5f5f5);
        background-color: var(--app-datepicker-date-hover-background-color, #80cbc4);
        border-radius: 50%;
        cursor: pointer;
      }

      /* paper-icon-button */
      paper-icon-button {
        color: var(--app-datepicker-icon-button-color, #737373);
        --paper-icon-button-ink-color: var(--app-datepicker-icon-button-ink-color, #737373);
      }

      /* will-change: transform, however lag on the first time */
      .nav-month-year,
      .days-of-week,
      .days-of-month {
        will-change: transform;
        -webkit-transform: translate3d(0px, 0px, 0px);
                transform: translate3d(0px, 0px, 0px);
        -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
      }
      /* WIP */
      .each-days-of-month.in-range {
          background-color: pink;
          position: relative;
      }
      .each-days-of-month.in-range::before {
          content:'';
          background-color: pink;
          position: absolute;
          left: -5px;
          right: -5px;
          top: 0;
          bottom:0;
          z-index: -1;
      }
    </style>

    <div id="dp" class="datepicker">
        <div class="calendar-view" view="calendar">
          <div class="navigator">
            <paper-icon-button icon="datepicker-icons:chevron-left"
              on-tap="_decrementMonth"
              noink="[[noAnimation]]"></paper-icon-button>
            <div id="navMonthYear" class="nav-month-year">
              [[_activeMonthYear]]
            </div>
            <paper-icon-button icon="datepicker-icons:chevron-right"
              on-tap="_incrementMonth"
              noink="[[noAnimation]]"></paper-icon-button>
          </div>

          <div id="daysOfWeek" class="days-of-week">
            <template is="dom-repeat" items="[[_daysOfWeek]]" index-as="index" strip-whitespace>
              <div class="each-days-of-week">[[item]]</div>
            </template>
          </div>

          <div id="daysOfMonth" class="days-of-month" on-tap="_chooseDaysOfMonth">
            <template is="dom-repeat" items="[[_daysOfMonth]]" index-as="index" strip-whitespace>
              <div class$="each-days-of-month[[
                  _isToday(item.index, _activeYear, _activeMonth)]]
              [[_isEmptyDate(item.index)]]
              [[_inSelectedRange(item.index, _activeYear, _activeMonth)]]
              [[_isChosenDaysOfMonth(item.index, _selectedYear, _selectedMonth, _selectedDate)]]
              [[_isDisableDays(index, firstDayOfWeek, minDate, maxDate, item.index, _shiftedDisableDays.*, disableDates.*)]]"
                index="[[index]]" date="[[item.index]]"
                tabindex$="[[_shouldTabIndex(index, firstDayOfWeek, minDate, maxDate, item.index, _shiftedDisableDays.*, disableDates.*)]]" aria-disabled$="[[_shouldAriaDisabled(index, firstDayOfWeek, minDate, maxDate, item.index, _shiftedDisableDays.*, disableDates.*)]]"
                aria-label$=[[item.index]]>
                [[item.date]]
              </div>
            </template>
          </div>
        </div>
    </div>
</template>
</dom-module>
`;
template.setAttribute('style', 'display: none;');
document.body.appendChild(template.content);

Polymer({
    is: 'app-datepicker',

    properties: {
        /**
         * Set locale for the datepicker.
         */
        locale: {
            type: String,
            value: function () {
                if (window.Intl) {
                    return (window.Intl
                        && window.Intl.DateTimeFormat
                        && window.Intl.DateTimeFormat().resolvedOptions
                        && window.Intl.DateTimeFormat().resolvedOptions().locale)
                        || 'en-US';
                }

                return 'en-US';
            }
        },
        /**
         * This forcefully sets the view of the datepicker without respecting the orientation of the device.
         * Available options: `vertical`, `horizontal`.
         */
        // view: String,
        /**
         * First Day of the week. Numbered days: `0 (Sun)` to `6 (Sat)`.
         */
        firstDayOfWeek: {
            type: Number,
            value: 0
        },
        /**
         * Arrays of days need to be disabled for selection, numbered from
         * `0 (Sun)` to `6 (Sat)`. Eg. weekends, `disable-days="[0, 6]"`.
         */
        disableDays: {
            type: Array,
            value: function () {
                return [6, 0];
            }
        },
        /**
         * Array of dates need to be disabled for selection.
         */
        disableDates: {
            type: Array,
            value: function() {
                return [];
            }
        },
        /**
         * WIP Array of dates to hightle to indicate duration
         */
        rangeDates: {
            type: Array,
            value: function() {
                return [];
            }
        },
        /**
         * Minimum date for selection. Dates that are smaller than the minimum
         * date will be disabled for selection.
         */
        minDate: {
            type: String,
            value: '1000/00/01'
        },
        /**
         * Maximum date for selection. Dates that are larger than the maximum
         * date will be disabled for selection.
         */
        maxDate: {
            type: String,
            value: '9999/99/99'
        },
        /**
         * Format for the selected date. Default to `yyyy/mm/dd`. Eg. `2017/05/17`.
         */
        format: {
            type: String,
            value: 'yyyy/mm/dd'
        },
        /**
         * Selected date in the default format of `yyyy/mm/dd`. Eg. `2017/05/17`.
         */
        date: {
            type: String,
            notify: true,
            readOnly: true
        },
        /**
         * inputDate accepts a standard date string. It will reflect the change to update the internal.
         */
        inputDate: String,

        showLongDate: {
            type: Boolean,
            value: !1
        },
        /**
         * To indicate the input date is in an invalid format hence no date change is applied. Only use this with inputDate property.
         */
        invalidDate: {
            type: Boolean,
            notify: true,
            readOnly: true
        },
        /**
         * Auto update the `date` property when changed.
         */
        autoUpdateDate: {
            type: Boolean,
            value: !1
        },

        // Always reset selected date on dialog close. See https://github.com/motss/app-datepicker/issues/74.
        alwaysResetSelectedDateOnDialogClose: Boolean,

        // month names, literally.
        _monthNames: {
            type: Array,
            value: function () {
                return [ 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December' ];
            }
        },

        _shiftedDisableDays: {
            type: Array,
            value: [6, 0]
        },

        _activeMonthYear: String,
        _shortSelectedDate: String,
        _daysOfWeek: Array,
        _daysOfMonth: Array,
        _listOfYears: Array,
        _activeYear: {
            type: Number,
            value: function () {
                return new Date().getFullYear();
            }
        },
        _activeMonth: {
            type: Number,
            value: function () {
                return new Date().getMonth();
            }
        },
        _isIncrementMonth: Boolean,
        _isDecrementMonth: Boolean,

        _selectedYear: {
            type: Number,
            value: function () {
                return new Date().getFullYear();
            },
        },
        _selectedMonth: {
            type: Number,
            value: function () {
                return new Date().getMonth();
            },
        },
        _selectedDate: {
            type: Number,
            value: function () {
                return new Date().getDate();
            }
        },

        _chosenDaysOfMonth: {
            type: Number,
            value: function () {
                return new Date().getDate();
            }
        },

        _isListRendered: {
            type: Boolean,
            value: !1
        },

        _isSelectedDateConfirmed: Boolean,
        _format: {
            type: Object,
            value: function () {
                return {y: 'yyyy', m: 'mm', d: 'dd', s1: '/', s2: '/'};
            }
        },

    },

    observers: [
        '_computeDaysOfMonth(_activeYear, _activeMonth, firstDayOfWeek, locale)',
        '_computeSeparateFormat(format)',
        '_computeShowLongDate(showLongDate, locale)',
        '_updateToReflectExternalChange(inputDate)',
        // '_updateDatepickerView(view)',
        '_computeDaysOfWeek(firstDayOfWeek, locale)',
        '_computeActiveMonthYear(_activeYear, _activeMonth, locale)',
        '_computeShortSelectedDate(_selectedYear, _selectedMonth, _selectedDate, locale)',
        '_computeShiftedDisableDays(firstDayOfWeek, disableDays.*)',
    ],

    attached: function () {
        // NOTE: workaround to check for effectiveChildren[0] as paper-button outside of
        // this element will be queried as well even though outside of content tag.
        // Setup distributed children.
        var effectiveChildren = this.getEffectiveChildren();
        if (effectiveChildren && effectiveChildren.length > 0) {
            for (var i = 0; i < effectiveChildren.length; i++) {
                // addEventListener to paper-button with dialog-confirm.
                if (effectiveChildren[i].hasAttribute('dialog-confirm')) {
                    // attach event handler which first binded to this scope.
                    effectiveChildren[i].addEventListener('tap', this._updateBindDate.bind(this));
                    effectiveChildren[i].addEventListener('transitionend', this._updateBindDate.bind(this));
                }
                // Polymer's polyfill for custom properties does not apply to distributed children.
                // https://www.polymer-project.org/1.0/docs/devguide/styling.html
                this._updateDistributedButtonInkColorCustomProp(effectiveChildren[i], '#737373');
            }
            // update to a new height for datepicker if paper-buttons present.
            this.$.dp.classList.add('with-buttons');
        }else {
            this.$.dp.classList.remove('with-buttons');
        }

        this.fire('app-datepicker-attached');
    },

    //  Month Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
    //  Days   31  28  31  30  31  30  31  31  30  31  30  31
    //   31?    0       2       4       6   7       9      11
    //   30?                3       5           8      10
    //  Feb?        1
    //  Su Mo Tu We Th Fr Sa    startDay - _firstDayOfWeek
    //                  1  2        5 - 0 < 0 ? 6 : 5 - 0;
    //  Mo Tu We Th Fr Sa Su
    //               1  2  3        5 - 1 < 0 ? 6 : 5 - 1;
    //  Tu We Th Fr Sa Su Mo
    //            1  2  3  4        5 - 2 < 0 ? 6 : 5 - 2;
    //  We Th Fr Sa Su Mo Tu
    //         1  2  3  4  5        5 - 3 < 0 ? 6 : 5 - 3;
    //  Th Fr Sa Su Mo Tu We
    //      1  2  3  4  5  6        5 - 4 < 0 ? 6 : 5 - 4;
    //  Fr Sa Su Mo Tu We Th
    //   1  2  3  4  5  6  7        5 - 5 < 0 ? 6 : 5 - 5;
    //  Sa Su Mo Tu We Th Fr
    //                     1        5 - 6 < 0 ? 6 : 5 - 6;
    // Compute the days for a month.
    _computeDaysOfMonth: function (_activeYear, _activeMonth, _firstDayOfWeek, _locale) {
        // console.log('- CALL: _computeDaysOfMonth, _activeYear: ',_activeYear,' | _activeMonth: ',_activeMonth);
        // No op for Intl is undefined (for Safari below v10.x.x).
        if (!window.Intl) {
            return;
        }

        // Compute total number of days for a month.
        function _computeTotalDaysOfMonth(_year, _month) {
            var _totalDaysOfMonth = new Date(_year, _month + 1, 0).getDate();
            return _totalDaysOfMonth;
        }

        var _start = new Date(_activeYear, _activeMonth, 1).getDay();
        var _daysOfMonth = [];
        var _totalDays = _computeTotalDaysOfMonth(_activeYear, _activeMonth);

        //  if _firstDayOfWeek is greater than 0 but less than 7.
        if (_firstDayOfWeek > 0 && _firstDayOfWeek < 7) {
            _start = _start - _firstDayOfWeek;
            _start = _start < 0 ? 7  + _start : _start;
        }

        // Set up Intl.
        _locale = _locale || ((window.Intl
            && window.Intl.DateTimeFormat
            && window.Intl.DateTimeFormat().resolvedOptions
            && window.Intl.DateTimeFormat().resolvedOptions().locale)
            || 'en-US');
        var _formatter = window.Intl && window.Intl.DateTimeFormat
            ? new window.Intl.DateTimeFormat(_locale, { timeZone: 'UTC', day: 'numeric' }).format
            : function dateTimeFormatShim(date) { return date.getDate() };
        for (var i = 0, j = 1 - _start; i < 42; i++, j++) {
            var _formatted = _formatter(Date.UTC(_activeYear, _activeMonth, j));
            var _dateObj = { date: '', index: '' };
            if (i >= _start & i < _start + _totalDays) {
                /**
                 * NOTE: Coercing '_formatted' to a number will cause
                 * dates in other languages that contain other character
                 * to become a NaN.
                 */
                _dateObj.date = _formatted;
                _dateObj.index = j;
            }
            _daysOfMonth.push(_dateObj);
        }

        // Update _chosenDaysOfMonth for every new calendar being rendered. // TODO Debounce

        this.set('_chosenDaysOfMonth', this._computeChosenDaysOfMonth(_daysOfMonth, this._selectedDate));

        // Update the old _daysOfMonth.
        this.set('_daysOfMonth', _daysOfMonth);
    },
    /// Re-compute disable days with firstDayOfWeek.
    _computeShiftedDisableDays: function (_firstDayOfWeek, _isDisableDays) {
        _firstDayOfWeek = _firstDayOfWeek > 0 && _firstDayOfWeek < 7 ? _firstDayOfWeek : 0;
        var _sdd = this.disableDays.map(function (_day) {
            _day = _day - _firstDayOfWeek;
            return _day < 0 ? 7 + _day : _day;
        });
        this.set('_shiftedDisableDays', _sdd);
    },

    // Increment the month via user interaction.
    _incrementMonth: function (ev) {
        this.debounce('_incrementMonth', function () {
            this.set('_isIncrementMonth', !0);
            window.requestAnimationFrame(function () {
                var _month = this._activeMonth;

                if (++_month % 12 === 0) {
                    this._activeYear++;
                    // console.log('>> YEAR++, this._activeYear, _month, _month % 12 > ',this._activeYear, _month, (_month % 12));
                }
                this.set('_activeMonth', _month % 12);
                // console.log('>> _month % 12', _month, _month % 12);
                this.set('_isIncrementMonth', !1);
            }.bind(this));
        }, 100);
    },
    // Decrement the month via user interaction.
    _decrementMonth: function (ev) {
        this.debounce('_decrementMonth', function () {
            this.set('_isDecrementMonth', !0);
            window.requestAnimationFrame(function () {
                var _month = this._activeMonth;

                if (--_month < 0) {
                    this._activeYear--;
                    _month = 11;
                }
                this.set('_activeMonth', _month);
                this.set('_isDecrementMonth', !1);
            }.bind(this));
        }, 100);
    },

    // Re-compute active month year if new date is selected.
    _computeActiveMonthYear: function (_activeYear, _activeMonth, _locale) {
        // console.log('_computeActiveMonthYear _activeYear: ',_activeYear,' | _activeMonth: ',_activeMonth);
        if (window.Intl) {
            _locale = _locale || ((window.Intl
                && window.Intl.DateTimeFormat
                && window.Intl.DateTimeFormat().resolvedOptions
                && window.Intl.DateTimeFormat().resolvedOptions().locale)
                || 'en-US');
            var _amy = new window.Intl.DateTimeFormat(_locale, {
                timeZone: 'UTC',
                month: 'short',
                year: 'numeric'
            }).format(Date.UTC(_activeYear, _activeMonth, 1));
            this.set('_activeMonthYear', _amy);
        }
        // console.log('_computeActiveMonthYear _amy: ',_amy,' | _activeYear: ',_activeYear,' | _activeMonth: ',_activeMonth);
    },
    // Re-compute short version of full date to show on the picker.
    _computeShortSelectedDate: function (_selectedYear, _selectedMonth, _selectedDate, _locale) {
        // console.log('>> _computeShortSelectedDate: _selectedYear: ',_selectedYear,' | _selectedMonth: ',_selectedMonth,' | _selectedDate: ',_selectedDate);
        if (window.Intl) {
            _locale = _locale || ((window.Intl
                && window.Intl.DateTimeFormat
                && window.Intl.DateTimeFormat().resolvedOptions
                && window.Intl.DateTimeFormat().resolvedOptions().locale)
                || 'en-US');
            var _ssd = new window.Intl.DateTimeFormat(_locale, {
                timeZone: 'UTC',
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }).format(Date.UTC(_selectedYear, _selectedMonth, _selectedDate));
            this.set('_shortSelectedDate', _ssd);

            // When datepicker has no button for date confirmation,
            // by asserting `autoUpdateDate` will trigger auto update on
            // date change.
            if (this.autoUpdateDate) {
                this.enforceDateChange();
            }
        }
    },
    // When a day of month is selected, a lot of tasks need to be carried out.
    _chooseDaysOfMonth: function (ev) {
        var _target = ev.target;
        // daysOfMonth is chooseable when:
        // a) _target.date is of type Number,
        // b) _target.classList.contains('is-disabled-day').
        if (_target &&
            this._isNumber(_target.date) &&
            !_target.classList.contains('is-disabled-day')
        ) {
            // This will trigger _isChosenDaysOfMonth to recompute style.
            this.set('_chosenDaysOfMonth', _target.index);

            this.set('_selectedYear', this._activeYear);
            this.set('_selectedDate', _target.date);
            this.set('_selectedMonth', this._activeMonth);
        }
    },

    // Re-compute class when the item (day of month) is today's date.
    _isToday: function (_item, _activeYear, _activeMonth) {
        var _now = new Date();
        var _isToday = _item === _now.getDate() &&
            _activeYear === _now.getFullYear() &&
            _activeMonth === _now.getMonth()
        return _isToday ? ' is-today' : '';
    },
    // Re-compute class when the item (day of month) is empty date & non-selectable.
    _isEmptyDate: function (_item) {
        return this._isNumber(_item) ? '' : ' is-non-selectable';
    },
    // Re-compute class if the item (day of month) is the selected date.
    _isChosenDaysOfMonth: function (_item, _selectedYear, _selectedMonth, _selectedDate) {
        // able to retain selected daysOfMonth even after navigating to other months.
        var _isChosenDaysOfMonth = this._chosenDaysOfMonth >= 0 &&
            this._activeYear === _selectedYear &&
            this._activeMonth === _selectedMonth &&
            _item === _selectedDate;
        return _isChosenDaysOfMonth ? ' chosen-days-of-month' : '';
    },
    // WIP Is in selected range
    _inSelectedRange: function (_item, _activeYear, _activeMonth) {
        // dateStart........dateEnd
        // do not care about disabled
        console.log('_item ',_item,' this._selectedDate', this._selectedDate,' active y,m ', _activeYear, _activeMonth);
        var _isRangeDate = this.rangeDates && this.rangeDates.length && this.rangeDates.some(function(date) {
            var _dateObj = this._convertDateStringToDateObject(date);
            // console.log('_dateObj: ',_dateObj,'y: ',_dateObj.getFullYear(),'m: ',_dateObj.getMonth(),'d: ',_dateObj.getDate());
            return _dateObj && _activeYear === _dateObj.getFullYear() && _activeMonth === _dateObj.getMonth() && _item === _dateObj.getDate();
        }.bind(this));
        return _isRangeDate ? ' in-range' : '';
    },

    // Re-compute class if the item (day of month) is a disable day.
    _isDisableDays: function (_index, _firstDayOfWeek, _minDate, _maxDate, _item) {
        var _isLessThanMinDate = !1;
        var _isMoreThanMaxDate = !1;
        var _isDisableDay = !1;
        var _isDisableDates = false;
        // _index % 7 gives values from 0 to 6.
        // and if _index matches some of these disableDays values return true.
        var _isDisableDays = this._shiftedDisableDays.some(function (_n) {
            return _n === _index % 7;
        });
        // ------ < _minDate ---------------- _maxDate > ------
        // if _item is of type Number.
        // if converted _item into new Date() < minDate or > maxDate.
        if (this._isNumber(_item)) {
            var _minDateObj = this._convertDateStringToDateObject(_minDate);
            var _maxDateObj = this._convertDateStringToDateObject(_maxDate);
            var _currentDate = new Date(this._activeYear, this._activeMonth, _item);
            // run two different obj differently just in case only one of them
            // is defined and still be able to update disabled days.
            if (_minDateObj) {
                _isLessThanMinDate = _currentDate.getTime() < _minDateObj.getTime();
            }
            if (_maxDateObj) {
                _isMoreThanMaxDate = _currentDate.getTime() > _maxDateObj.getTime();
            }
            // @@@
            _isDisableDates = this.disableDates && this.disableDates.length && this.disableDates.some(function(date) {
                var _dateObj = this._convertDateStringToDateObject(date);
                return _dateObj && _currentDate.getTime() === _dateObj.getTime();
            }.bind(this));
        }
        // To disable a date, it must be either one of the followings:
        // a) _isDisabledDays (set by property disableDays),
        // b) _isDisableDates (set by property disableDates),
        // c) _isLessThanMinDate (set by property minDate), and
        // d) _isMoreThanMaxDate (set by propery moreDate).
        _isDisableDay = _isDisableDays || _isDisableDates || _isLessThanMinDate || _isMoreThanMaxDate;
        return _isDisableDay ? ' is-disabled-day is-non-selectable' : '';
    },
    _computeDaysOfWeek: function (_firstDayOfWeek, _locale) {
        // _daysOfWeek needs to be changed as well with firstDayOfWeek and locale.
        var _dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        var _firstDayOfWeek = _firstDayOfWeek > 0 && _firstDayOfWeek < 7 ? _firstDayOfWeek : 0;

        // if locale is set and window.Intl is supported...
        if (_locale && window.Intl) {
            _dow = [];
            var _today = new Date();
            var _offsetDate = _today.getDate() - _today.getDay();
            var _formatter = new window.Intl.DateTimeFormat(_locale, {
                timeZone: 'UTC',
                weekday: 'narrow'
            }).format;
            var newDate = null;

            for (var i = 0; i < 7; i++) {
                newDate = Date.UTC(_today.getFullYear(), _today.getMonth(), _offsetDate + i);
                _dow.push(_formatter(newDate));
            }
        }

        var _sliced = _dow.slice(_firstDayOfWeek);
        var _rest = _dow.slice(0, _firstDayOfWeek);
        var _concatted = Array.prototype.concat(_sliced, _rest);

        this.set('_daysOfWeek', _concatted);
    },
    // Re-compute the index of the selected date when a new date is selected
    // via user interaction.
    _computeChosenDaysOfMonth: function (_daysOfMonth, _selectedDate) {
        // depends on _daysOfMonth and recalculate the index of _chosenDaysOfMonth.
        var _len = _daysOfMonth.length;
        for (var i = 0; i < _len; i++) {
            if (i >= 0 && _daysOfMonth[i].index === _selectedDate) {
                return i;
            }
        }
    },

    // Convert date string into date object.
    _convertDateStringToDateObject: function (_date) {
        var _checkDate = _date instanceof Date || typeof _date !== 'string' ? _date : new Date(_date);
        var _isValidDate = _checkDate.toDateString() !== 'Invalid Date';
        return _isValidDate ? _checkDate : null;
    },
    // split capturing group of format into year, month and date.
    _computeSeparateFormat: function (_format) {
        var re = /^(yyyy|yy|m{1,4}|d{1,2}|do)\W+(yyyy|yy|m{1,4}|d{1,2}|do)\W+(yyyy|yy|m{1,4}|d{1,2}|do)$/g;
        var m = re.exec(_format);
        var _temp = {};
        var _tempArr = [];
        if (m !== null) {
            _tempArr.push(m[1]);
            _tempArr.push(m[2]);
            _tempArr.push(m[3]);

            for (var i = 0, matched; i < 3; i++) {
                matched = _tempArr[i];

                if (matched.indexOf('y') >= 0) {
                    _temp.y = matched;
                } else if (matched.indexOf('m') >= 0) {
                    _temp.m = matched;
                } else if (matched.indexOf('d') >= 0) {
                    _temp.d = matched;
                }
            }
        }

        // Only set _format if the new format is valid.
        if ('d' in _temp && 'm' in _temp && 'y' in _temp) {
            this.set('_format', _temp);
        }

        _temp = null;
    },

    // bind the selected date so that it's ready to be read from the outside world.
    _bindSelectedFulldate: function (_selectedYear, _selectedMonth, _selectedDate, _format) {
        // show long date (eg. Fri, May 12 2017 instead.
        if (this.showLongDate) {
            return this._computeShowLongDate(this.showLongDate,  this.locale, !0);
        }

        var _formattedYear  = _selectedYear;
        var _formattedMonth  = this._monthNames[_selectedMonth];
        var _formattedDate  = _selectedDate;
        var _finalFormatted = this.format;
        // compute new formatted year.
        if (_format.y === 'yy') {
            _formattedYear = _selectedYear%100;
        }
        // compute new formatted month.
        if (_format.m === 'mmm') {
            _formattedMonth = _formattedMonth.slice(0, 3);
        }else if (_format.m === 'mm') {
            _formattedMonth = this._padStart(_selectedMonth + 1, 2, '0');
        }else if (_format.m === 'm') {
            _formattedMonth = _selectedMonth + 1;
        }
        // compute new formatted date.
        if (_format.d === 'do') {
            var _cardinalNumber = _formattedDate%10;
            var _suffixOrdinal = _cardinalNumber > 3 ? 'th' :
                ['th', 'st', 'nd', 'rd'][_cardinalNumber];
            if (_formattedDate === 11 || _formattedDate == 12 || _formattedDate === 13) {
                _suffixOrdinal = 'th';
            }
            _formattedDate = _formattedDate + _suffixOrdinal;
        }else if (_format.d === 'dd') {
            _formattedDate = this._padStart(_formattedDate, 2, '0');
        }
        // set formatted value with user defined symbols.
        _finalFormatted = _finalFormatted.replace(_format.y, _formattedYear);
        _finalFormatted = _finalFormatted.replace(_format.m, _formattedMonth);
        _finalFormatted = _finalFormatted.replace(_format.d, _formattedDate);

        return _finalFormatted;
    },
    // method for content tag (eg. buttons).
    _updateBindDate: function (ev) {
        this.debounce('_updateBindDate', function () {
            var _type = ev.type;
            if (_type === 'tap') {
                this.set('_isSelectedDateConfirmed', !0);
            }

            if (_type === 'transitionend' || this.noAnimation){
                if (this._isSelectedDateConfirmed) {
                    var _sy = this._selectedYear;
                    var _sm = this._selectedMonth;
                    var _sd = this._selectedDate;
                    var _f = this._format;
                    var _confirmDate = this._bindSelectedFulldate(_sy, _sm, _sd, _f);
                    this._setDate(_confirmDate);
                    this.set('_isSelectedDateConfirmed', !1);

                    if (this.alwaysResetSelectedDateOnDialogClose) {
                        this.resetDate();
                    }
                }
            }
        }, 1);
    },
    // Update date to show long date or short date.
    _computeShowLongDate: function (_showLongDate, _locale, _returnResult) {
        if (!window.Intl || !this._selectedDate || typeof this._selectedDate === 'undefined') {
            return;
        }

        var _selectedDate = this._selectedDate;
        var _longDate = Date.UTC(this._selectedYear, this._selectedMonth, _selectedDate);

        if (_showLongDate) {
            _locale = _locale || ((window.Intl
                && window.Intl.DateTimeFormat
                && window.Intl.DateTimeFormat().resolvedOptions
                && window.Intl.DateTimeFormat().resolvedOptions().locale)
                || 'en-US');
            var _options = {
                timeZone: 'UTC',
                weekday: this.showLongDate ? 'short' : undefined,
                year: 'numeric',
                month: this.showLongDate ? 'short' : '2-digit',
                day: '2-digit'
            };
            _longDate = new window.Intl.DateTimeFormat(_locale, _options).format(_longDate);

            if (_returnResult) {
                return _longDate;
            }

            // Fix for notorious IE - add unknown spaces (%E2%80%8E) when formatting date with Intl.
            // http://utf8-chartable.de/unicode-utf8-table.pl?start=8192&number=128
            if (window.navigator.msManipulationViewsEnabled) {
                if (_locale || _locale === '') {
                    _longDate = decodeURIComponent(encodeURIComponent(_longDate).replace(/\%E2\%80\%8[0-9A-F]/gi, ''));
                }
            }

            this._setDate(_longDate);
        }else {
            _longDate = this._bindSelectedFulldate(this._selectedYear,
                this._selectedMonth, _selectedDate, this._format);

            if (_returnResult) {
                return _longDate;
            }

            this._setDate(_longDate);
        }
    },

    // TO make things simple and works across different browsers, the input date string
    // has to be standardized - YYYY/MM/DD.
    // http://dygraphs.com/date-formats.html
    // TODO format issue
    _updateToReflectExternalChange: function (_inputDate) {
        // console.log('_updateToReflectExternalChange _inputDate: ',_inputDate);
        // Due to limitation of input date received by platform's Date,
        // inputDate was designed to only be able to accept inputs for the followings:
        // short date for all locales in the format of yyyy/mm/dd or yyyy/d/m eg. 2016/06/06.
        // long formatted date for en and en-* locale **ONLY** eg. Tue, Jul 5, 2016.
        if (this.showLongDate && this.locale.indexOf('en') < 0) {
            this._setInvalidDate(!0);
            return;
        }
        // accepted input date string:
        // 1. 2016 January 31
        // 2. 2016 January 3
        // 3. 2016 Jan 31
        // 4. 2016 Jan 3
        // 5. 2016/13/13
        function validateDate(_id, _showLongDate) {
            // console.log('validateDate showLongDate: ',_showLongDate);
            var _res = {
                valid: !1,
                result: ''
            };
            // Check if long input date is a valid date.
            if (_showLongDate) {
                var _ds = _id.split(', ');
                if (_ds.length > 2) {
                    _ds = _ds[1].split(' ').join('/') + ', ' + _ds[2];
                    var _newDate = new Date(_ds);
                    if (_newDate.toString() === 'Invalid Date') {
                        return _res;
                    }else {
                        return {
                            valid: !0,
                            result: _newDate
                        };
                    }
                }

                return _res;
            }

            // From here onwards, to check for short input date.
            var _re1 = /^(\d{4})\W+(\d{1,2})\W+(\d{1,2})$/i;
            var _re2 = /^(\d{4})[ ](\w+)[ ](\d{1,2})$/i;

            var _validWithRe1 = _re1.exec(_id);
            var _validWithRe2 = _re2.exec(_id);

            if (_validWithRe1 === null && _validWithRe2 === null) {
                return _res;
            }else {
                var _resultToDate = null;
                if (_validWithRe1 === null) {
                    _resultToDate = new Date(_validWithRe2[1] + ' ' + _validWithRe2[2] + ' ' + _validWithRe2[3]);
                }else if (_validWithRe2 === null) {
                    _resultToDate = new Date(+_validWithRe1[1], +_validWithRe1[2] - 1, +_validWithRe1[3]);
                }

                return {
                    valid: !0,
                    result: _resultToDate
                };
            }
        }

        var _showLongDate = this.showLongDate;
        var _yy = 0;
        var _mm = 0;
        var _dd = 0;
        var _isValidDate = validateDate(_inputDate, _showLongDate);
        // console.log('_isValidDate: ',_isValidDate);

        if (_isValidDate.valid) {
            if (this.alwaysResetSelectedDateOnDialogClose) {
                return;
            }

            var _vd = new Date(_isValidDate.result);
            var _yy = _vd.getFullYear();
            var _mm = _vd.getMonth();
            this._setInvalidDate(!1);

            this.set('_activeYear', _yy);
            this.set('_activeMonth', _mm);
            this.set('_selectedYear', _yy);
            this.set('_selectedMonth', _mm);
            this.set('_selectedDate', _vd.getDate());
            // console.log('- ! Valid, _vd: ',_vd,' | _vd.getDate()', _vd.getDate());
        }else {
            this.set('_selectedDate', this._selectedDate || new Date().getDate());
            this._computeShowLongDate(_showLongDate, this.locale);
            this._setInvalidDate(!0);
        }
    },
    /**
     * By default, buttons are required so that they are to confirm the date change.
     * This method allows force update the datepicker when there are no buttons inside the datepicker to confirm date change.
     */
    enforceDateChange: function () {
        this._setInvalidDate(!1);
        this._computeShowLongDate(this.showLongDate, this.locale);
    },

    // reset date to today's date if alwaysResetSelectedDateOnDialogClose is set.
    resetDate: function () {
        if (this._isSelectedDateConfirmed) {
            return;
        }

        var now = new Date();
        var nowFy = now.getFullYear();
        var nowM = now.getMonth();
        var nowD = now.getDate();

        this.set('_activeYear', nowFy);
        this.set('_activeMonth', nowM);
        this.set('_selectedYear', nowFy);
        this.set('_selectedMonth', nowM);
        this.set('_selectedDate', nowD);
        this._setInvalidDate(false);
    },

    // Accessibility enhancment.
    _shouldTabIndex: function (_index, _firstDayOfWeek, _minDate, _maxDate, _item) {
        var _isDisableDays = this._isDisableDays(_index, _firstDayOfWeek, _minDate, _maxDate, _item);
        return _item && _item >= 0 && !_isDisableDays ? 0 : -1;
    },
    _shouldAriaDisabled: function (_index, _firstDayOfWeek, _minDate, _maxDate, _item) {
        var _isDisableDays = this._isDisableDays(_index, _firstDayOfWeek, _minDate, _maxDate, _item);
        return !(_item && _item >= 0 && !_isDisableDays);
    },

    // Lodash's replacements.
    _padStart: function (_string, _length, _chars) {
        var _len = -_length;
        var _str = (_chars + _string).slice(_len);
        return _str;
    },
    _isNumber: function (_value) {
        // return typeof _value == 'number' || (!Number.isNaN(parseFloat(_value)) && Number.isFinite(_value));
        // Fallback: caused by IE11 as those methods are not supported in IE11.
        return typeof _value == 'number' || (!isNaN(parseFloat(_value)) && isFinite(_value));
    },
    // Forcefully update the view of the datepicker.
    // _updateDatepickerView: function (_view) {
    //     this.toggleClass('horizontal-view', _view === 'horizontal', this);
    //     this.toggleClass('vertical-view', _view === 'vertical', this);
    // },

    // workaround to update custom property of distributed children until Polymer supports Native custom properties.
    _updateDistributedButtonInkColorCustomProp: function (_node, _colorCode) {
        _node.updateStyles({
            '--paper-button-ink-color': _colorCode,
        });
    }
});

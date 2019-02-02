/* TODO
 * - Set locales
 * - Notifications
 * - gotoToday
 * - range
 * - plugin https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
 * - check date format
 * - check outofbounds and init Time ovalues onn has min duration
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], function (moment) {
            return (root.DateTimePicker = factory(moment));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('moment'));
    } else {
        root.DateTimePicker = factory(root.moment);
    }
}(typeof self !== 'undefined' ? self : this, function (moment) {
    'use strict';

    if (!moment) {
      throw new Error('DateTimePicker requires Moment.js to be loaded first');
    }
    // console.log('mom: ',moment().utcOffset(120).format("YYYY-MM-DD"));

    // Helper functions
    var extend = function (defaults, options) {
        var extended = {}, prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    },

    compareDates = function(d1,d2) {
        return d1 === d2
    },
/*
    getMoment = function(d) {
        var returnMoment, format = opts.format;

        if (d === undefined || d === null) {
            // console.log("d undefined return today");
            returnMoment = moment().utcOffset(120).format(format); // TODO should this use format? and locale?y
        } else if (moment.isDate(d) || moment.isMoment(d)) {
        // If the date that is passed in is already a Date() or moment() object,
        // pass it directly to moment.
            console.log("d a Date() or moment() obj");
            returnMoment = moment(d).utcOffset(120).format(format);
        } else {
            console.log("d not date not moment obj");
        //returnMoment = moment(d, parseFormats, options.useStrict);
        }

        return returnMoment;
    },

    formatDates = function() {
        var btnLocStart = document.getElementById('btnLocStart'),
            btnLocEnd = document.getElementById('btnLocEnd');

        // Update equalDates
        this.equalDates = (dp1.date === dp2.date);
        // console.log('FORMATTED:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
        // console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);
        element.formattedDate_1 = element.formatted(dp1.date,btnLocStart);
        element.formattedDate_2 = element.formatted(dp2.date,btnLocEnd);
    },

    setDisabledDates = function(arr) {
        for (var l = arr.length - 1; l >= 0; l--) {
            arr[l] = arr[l].replace(/-/g, '/');
        }
        element.disableDates = arr; // TODO Pass an object or array in JSON format
    },

    disableStartPastHours = function(idx, items) {
        var i = idx - 1;

        do {
            items[i].setAttribute("disabled", true);
            i--;
        } while(0 <= i);
    },

    disableEndPastHours = function(idx, items) {
        console.log('__ disableDropoffPastHours idx: ', idx,'items.length: ',items.length);

        for (var j = items.length - 1; 0 <= j; j--) {
            if (j < idx) {
                items[j].setAttribute("disabled", true);
            } else {
                items[j].removeAttribute("disabled");
            }
        }
    },

    enableTimeValues = function(t1, t2) {
        // console.log('resetDisabledTimeValues', t1.length);
        for (let i = t2.length - 1; i >= 0; i--) {
            t1[i].removeAttribute('disabled');
            t2[i].removeAttribute('disabled');
        }
    },
*/
    // Defautls
    defaults = {
        format: "YYYY-MM-DD",
        inputDate: "",
        dateEnd: "",
        dateMin: "",
        dateMax: "",
        durationMin: "1",
        disabledDates: [],
        timeInterval: "",
        timeStart: "12:00",
        timeEnd: "12:00",
        timeMin: 1
    },

    // Constructor
    DateTimePicker = function(element) {
        var self = this,
            opts = self.config(element),
            initState = !0,
            datesEqual,
            dateStart, dateEnd,
            dp1, dp2,
            today, isToday, equal_or_min,
            tStart = {},
            tEnd = {},
            tNow = {};

        // self._o = opts;
        // console.log('-----> Constr opts: ', opts);

        if(typeof element === void 0) return;

        /**
         * private API
         */
        self.getMoment = function(d) {
            var returnMoment, format = opts.format;

            if (d === undefined || d === null) {
                // console.log("d undefined return today");
                returnMoment = moment().utcOffset(120).format(format); // TODO should this use format? and locale?y
            } else if (moment.isDate(d) || moment.isMoment(d)) {
            // If the date that is passed in is already a Date() or moment() object,
            // pass it directly to moment.
                console.log("d a Date() or moment() obj");
                returnMoment = moment(d).utcOffset(120).format(format);
            } else {
                console.log("d not date not moment obj");
            //returnMoment = moment(d, parseFormats, options.useStrict);
            }

            return returnMoment;
        },

        self.setDate = function(el, d) {
            el.inputDate = d;
            el.minDate = moment(d).subtract(1, "day").format(opts.format);
            el.enforceDateChange();
        },

        self.formatDates = function() {
            var btnLocStart = document.getElementById('btnLocStart'),
                btnLocEnd = document.getElementById('btnLocEnd');

            // Update equalDates TODO move this to on change
            datesEqual = compareDates(dateStart, dateEnd);

            // console.log('FORMATTED:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
            // console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);
            element.formattedDate_1 = element.formatted(dp1.date,btnLocStart);
            element.formattedDate_2 = element.formatted(dp2.date,btnLocEnd);
        },

        self.setDisabledDates = function(arr) {
            for (var l = arr.length - 1; l >= 0; l--) {
                arr[l] = arr[l].replace(/-/g, '/');
            }
            element.disableDates = arr; // TODO Pass an object or array in JSON format
        },

        self.disableStartPastHours = function(idx, items) {
            var i = idx - 1;

            do {
                items[i].setAttribute("disabled", true);
                i--;
            } while(0 <= i);
        },

        self.disableEndPastHours = function(idx, items) {
            console.log('__ disableDropoffPastHours idx: ', idx,'items.length: ',items.length);

            for (var j = items.length - 1; 0 <= j; j--) {
                if (j < idx) {
                    items[j].setAttribute("disabled", true);
                } else {
                    items[j].removeAttribute("disabled");
                }
            }
        },

        self.enableTimeValues = function(t1, t2) {
            // console.log('resetDisabledTimeValues', t1.length);
            for (let i = t2.length - 1; i >= 0; i--) {
                t1[i].removeAttribute('disabled');
                t2[i].removeAttribute('disabled');
            }
        },

        self.initValues = function() {
            today = self.getMoment();

            if(!opts.inputDate) {
                opts.inputDate = today;
            }
            if(!opts.dateMin) {
                opts.dateMin = moment().subtract(1, 'days').format(opts.format);
            }
            if(!opts.dateEnd) {
                opts.dateEnd = moment(opts.inputDate).add(opts.durationMin,'days').format(opts.format);
            }
            if(opts.disableDates) {
                // element.disableDays = opts.disableDates; TODO Pass an object or array in JSON format [moment().add(7, 'days').format(dateFormat), moment().add(8, 'days').format(dateFormat)];
            }

            dateStart = opts.inputDate;
            dateEnd = opts.dateEnd;
            datesEqual = compareDates(dateStart, dateEnd);
            isToday = compareDates(dateStart, today);
            equal_or_min = datesEqual || !!(opts.durationMin);

            console.log('__INIT VALUES:\nelement ',element.nodeName,'opts: ',opts, 'datesEqual: ', datesEqual,' isToday: ', isToday,' equal_or_min: ',equal_or_min);
        },

        self.datetimepicker = function() {
            var app = element, format = opts.format;

            console.log('__DATETIPI:\nelement ',app.nodeName, //  opts ', opts,'
                        'elem.$.time1',app.$.time1);

            dp1 = app.$.dp1;
            dp2 = app.$.dp2;

            var t1 = app.$.time1,
                t2 = app.$.time2,
                timeIntervals = app.intervalHours,
                t1_items = app.getElements('plb_1'), // app.$.plb_1.childNodes, // app.$.plb_1.items: returns array of item value
                t2_items = app.getElements('plb_2');

            // INIT DATES
            // function setDate(date) {
            //     console.log('>>> setDate: ',date);
            //     dp2.inputDate = date;
            //     dp2.minDate = moment(date).subtract(1, "day").format(format);
            //     dp2.enforceDateChange();
            // }

            function initDates() {
                console.log('__INIT DATES:\ndp1.inputDate: ',dp1.inputDate,' = dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                            '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);

                dp1.minDate = opts.dateMin;
                if (moment().isAfter(dp1.date)) {
                    dp1.inputDate = today;
                    dp1.enforceDateChange();
                }

                self.setDate(dp2, dateEnd); // dp2,

                self.formatDates();

                // initTime(); TODO

                initState = !1;

                console.log(' UPDATED:\ndp1.inputDate: ',dp1.inputDate,' = dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                            '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);
            }

            initDates();



            // Set format for date-display wc
            app.formatted = function(v) {
                var date = {
                    day: moment(v).format('D'),
                    dayw: moment(v).format('dddd'),
                    monthYear: moment(v).format('MMM YYYY')
                };
                return date;
            };

        }

        // Call functions
        self.initValues();
    };

    /**
     * public API
     */
    DateTimePicker.prototype = {
        /**
         * configure functionality
         * construct options from node attributes
         */
         config: function (element) {
             var el = element, o = {};

             if(el.getAttribute('duration-min'))
                 o.durationMin = parseInt(el.getAttribute('duration-min'));
             if(el.getAttribute('disabled-dates'))
                 o.disabledDates = el.getAttribute('disabled-dates');
             if(el.getAttribute("input-date"))
                 o.inputDate = el.getAttribute("input-date");

             // Time init values
             if(el.getAttribute('time-interval'))
                 o.timeInterval = parseInt(el.getAttribute('time-interval'));
             if(el.getAttribute('time-min'))
                 o.timeMin = parseInt(el.getAttribute('time-min'));
             if(el.getAttribute('time-start'))
                 o.timeStart = el.getAttribute('time-start');
             if(el.getAttribute('time-end'))
                 o.timeEnd = el.getAttribute('time-end');

             if (!this._o) {
                 this._o = extend({}, defaults);
             }

             var opts = extend(this._o, o);
             opts = extend(defaults, o);

             return opts;
         },

         init: function() {
             this.datetimepicker();
         }
    };

    return DateTimePicker;
}));

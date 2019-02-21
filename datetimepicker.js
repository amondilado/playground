/* TODO
 * - Set locales
 * - Notifications
 * - gotoToday
 * - check format validity
 * - range
 * - set time min max < 24
 * - helper functions review, getMoment for time, group repeated date vars update
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

    compareDates = function(d1, d2) {
        return d1 === d2
    },

    getTimeToInterval = function(time, interval) {
        var ti = Math.ceil(time.m / interval) * interval,
            tn = (ti) ? moment().minute(ti).format('mm') : '00';
        // console.log('__TIME TO INTR: newTime', tn, 'ti: ',ti);

        return (interval === 30 && time.m >= 30 || time.m > 45) ?
            (parseInt(time.h) + 1) + ':' + tn : time.h + ':' + tn;
    },

    // Calculate index based on time min and time interval
    getTimeOffset = function(interval, min, i) {
        if (interval > 1) {
            var offset = (interval === 15) ? min * 4 : min * 2;
            return i + offset; // TODO review i + offset
        } else {
            return i + min;
        }
    },
    // Set format for date-display wc
    getFormat = function(d) {
        var date = {
            day: moment(d).format('D'),
            dayw: moment(d).format('dddd'),
            monthYear: moment(d).format('MMM YYYY')
        };
        // console.log('__FORMAT: ',date);
        return date;
    },

    addMoment = function(d, n, f) {
        return moment(d).add(n, 'days').format(f);
    },

    // Defautls
    defaults = {
        format: "YYYY-MM-DD",
        inputDate: "",
        dateEnd: "",
        dateMin: "",
        dateMax: "",
        durationMin: "",
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
            outOfBounds,
            datesEqual,
            dateStart, dateEnd,
            minDdate,
            dp1, dp2,
            today, isToday,
            d2isMin, equal_or_min,
            time = {},
            t1, t2, tmin,
            t1_items, t2_items,
            interval, timeIntervals;

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
                // console.log("d a Date() or moment() obj");
                returnMoment = moment(d).utcOffset(120).format(format);
            } else {
                // console.log("d not date not moment obj");
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
                // console.log('__FORMAT D');
                element.formattedDate_1 = getFormat(dp1.date);
                element.formattedDate_2 = getFormat(dp2.date);
            },

            self.outOfBounds = function() {
                var _d = dateEnd = addMoment(minDdate, 1, opts.format);
                alert("OUT OFF BOUNDS! Please select the next available date in your dropoff calendar.");
                outOfBounds = !0;
                // d1_o1d = 0;
                self.enableTimeEndValues(t2_items);
                self.setDate(dp2, _d);
                self.formatDates();

                dateEnd = _d;
                d2isMin = minDdate === dateEnd;
            },

            self.setDisabledDates = function(arr) {
                for (var l = arr.length - 1; l >= 0; l--) {
                    arr[l] = arr[l].replace(/-/g, '/');
                }
                element.disableDates = arr; // TODO Pass an object or array in JSON format
            },

            self.disableStartPastHours = function(idx, arr) {
                var i = idx - 1;

                do {
                    arr[i].setAttribute("disabled", true);
                    i--;
                } while(0 <= i);
            },

            self.disableEndPastHours = function(idx, arr) {
                // console.log('__DISABLE PastHours idx: ', idx,'arr.length: ',arr.length);

                for (var j = arr.length - 1; 0 <= j; j--) {
                    if (j < idx) {
                        arr[j].setAttribute("disabled", true);
                    } else {
                        arr[j].removeAttribute("disabled");
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

            self.enableTimeStartValues = function(arr) {
                // console.log('__ENABLE T start', arr.length);
                for (let i = arr.length - 1; i >= 0; i--) {
                    arr[i].removeAttribute('disabled');
                }
            },

            self.enableTimeEndValues = function(arr) {
                // console.log('__ENABLE T end', arr.length);
                for (let i = arr.length - 1; i >= 0; i--) {
                    arr[i].removeAttribute('disabled');
                }
            },

            self.initValues = function() {
                // WIP
            },

            self.setTimeStart = function(idx) {
                element.selectedTime_1 = idx;
                t1._applySelection;
            },

            self.setTimeEnd = function(idx) {
                element.selectedTime_2 = idx;
                t2._applySelection;
            },

            self.getTimeNowData = function(min) {
                var obj = {
                    h: moment().utcOffset(120).format('kk'),
                    m: moment().utcOffset(120).format('mm'),
                    min: {
                        h: moment().utcOffset(120).add(min, 'hours').format('kk'),
                        m: moment().utcOffset(120).format('mm')
                    }
                };
                obj.value = obj.h+':'+obj.m;
                obj.closest = getTimeToInterval(obj, interval);
                obj.index = timeIntervals.indexOf(obj.closest);
                obj.valueMin = timeIntervals[getTimeOffset(interval, min, obj.index)];

                return obj;
            },

            self.initDates = function() {
                // WIP
                today = self.getMoment();

                if(!opts.inputDate) {
                    opts.inputDate = today;
                }
                if(!opts.dateMin) {
                    opts.dateMin = moment().subtract(1, 'days').format(opts.format);
                }
                if(!opts.dateEnd) {
                    opts.dateEnd =  addMoment(opts.inputDate, opts.durationMin, opts.format);
                }

                dp1.minDate = opts.dateMin;
                interval = opts.timeInterval;
                tmin = opts.timeMin;
                dateStart = opts.inputDate;
                dateEnd = opts.dateEnd;
                datesEqual = compareDates(dateStart, dateEnd);
                isToday = compareDates(dateStart, today);
                minDdate = addMoment(dateStart, opts.durationMin, opts.format);
                equal_or_min = datesEqual || !!(opts.durationMin);

                var isValid = moment().isBefore(dp1.date),
                    minInDays = parseInt(tmin/24, 10),
                    recalcTmin = (minInDays) ? minInDays%24 : 1;

                console.log('__INIT DATES:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                    '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    '\nmin: ',tmin,' | minInDays: ',minInDays,' | recalcTmin: ',recalcTmin);

                if(0 < minInDays && 0 < recalcTmin) {
                    tmin = recalcTmin;
                    isToday = !1;
                    console.log('_New tmin: ',tmin);
                }

                // Calc dateStart
                if(!isValid) {
                    dateStart = (0 < minInDays) ? addMoment(today, minInDays, opts.format) : today;
                    self.setDate(dp1, dateStart);
                    minDdate = addMoment(dateStart, opts.durationMin, opts.format);
                }

                // Calc dateEnd
                if(moment(dateEnd).isBefore(minDdate)) {
                    dateEnd = minDdate;
                }

                if (!isValid) {
                    // Update vals
                    datesEqual = compareDates(dateStart, dateEnd);
                    equal_or_min = datesEqual || !!(opts.durationMin);
                }

                self.setDate(dp2, dateEnd); // dp2,
                self.formatDates();

                initState = !1; // keep init here or in datetimepicker() ?

                d2isMin = minDdate === dateEnd;

                console.log('__INIT DATES:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                    '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    '\ndateStart: ',dateStart,' | dateEnd: ',dateEnd,' | minDdate: ',minDdate,' | d2isMin: ',d2isMin);
            },

            self.initTime = function(o) {
                console.log('__TIMEINX: ', o);

                if(!~timeIntervals.indexOf(o.timeStart)) {
                    o.timeStart = defaults.timeStart;
                }
                if(!~timeIntervals.indexOf(o.timeEnd)) {
                    o.timeEnd = defaults.timeEnd;
                }

                time.now = self.getTimeNowData(tmin, interval);

                time.start = {
                    value: (isToday) ? time.now.valueMin : o.timeStart
                };
                time.start.index = timeIntervals.indexOf(time.start.value);

                if(24 - tmin === parseInt(time.now.min.h)) {
                    time.start.index = 0;
                    // Initialize and call validate
                    dateStart = addMoment(dateStart, 1, opts.format);
                    self.setDate(dp1, dateStart);
                    self.formatDates();
                    self.outOfBounds();

                    isToday = false;
                    datesEqual = compareDates(dateStart, dateEnd);
                    equal_or_min = datesEqual || !!(opts.durationMin);
                    outOfBounds = !1;
                    console.log('__TIME NEW date: ', dateStart, ' isToday: ',isToday, ' | >> outOfBounds: ',outOfBounds);
                    console.log('dateStart: ',dateStart, ' dateEnd: ',dateEnd,' datesEqual: ',datesEqual,' equal_or_min: ',equal_or_min);
                } else {
                    time.start.indexMin = getTimeOffset(interval, tmin, time.start.index);
                }

                time.end = {};
                // if today or equal then recalc WIP
                if(d2isMin) {
                    time.end.index = (isToday) ? getTimeOffset(interval, tmin, time.start.index) : time.start.index;
                    if(time.end.index >= timeIntervals.length) {
                        // Initialize and call validate
                        var left = Math.abs(timeIntervals.length - time.start.indexMin),
                            new_i = parseInt(left);
                        time.end.index = Math.floor(getTimeOffset(interval,tmin,new_i) / 2); // Review this!!!
                        // console.log('left: ',left, ' new_i: ',new_i,' = ',time.end.index);

                        self.outOfBounds();
                        isToday = false;
                        datesEqual = compareDates(dateStart, dateEnd);
                        equal_or_min = datesEqual || !!(opts.durationMin);
                        console.log('dateStart: ',dateStart, ' dateEnd: ',dateEnd,' datesEqual: ',datesEqual,' equal_or_min: ',equal_or_min);
                        outOfBounds = !1;
                    } else {
                        time.end.value = timeIntervals[time.end.index];
                    }
                } else {
                    time.end.value = o.timeEnd;
                    time.end.index = timeIntervals.indexOf(time.end.value);
                }

                console.log('__TIME INIT: ', time);

                self.setTimeStart(time.start.index);
                self.setTimeEnd(time.end.index);

                return time;
            },

            self.validateTimeDuration = function() {
                console.log('__VALIDATE new: ',time);

                time.start.indexMin = getTimeOffset(interval, tmin, time.start.index);
                time.now = self.getTimeNowData(tmin, interval);

                var isValid = time.start.indexMin <= time.end.index;

                if(isToday && time.start.index < time.now.index) {
                    // Update t1 < now
                    time.start.index = time.now.index;
                    time.start.indexMin = getTimeOffset(interval, tmin, time.start.index);
                    self.setTimeStart(time.start.index);
                    // console.log('__VALIDATE update t1: ', time);
                    self.disableStartPastHours(time.start.index, t1_items);
                }
                // equal, isd2Min
                if (d2isMin || datesEqual) {
                    if(time.start.indexMin >= time.end.index) {
                        if (time.start.indexMin <= timeIntervals.length) {
                            element.selectedTime_2 = null;
                            time.end.index = time.start.indexMin;
                            self.setTimeEnd(time.end.index);
                            // console.log('__VALIDATE update t2: ', time, timeIntervals[time.end.index]);
                        } else {
                            self.outOfBounds();
                            return;
                        }
                    }
                    self.disableEndPastHours(time.start.index, t2_items);
                }

                // console.log('__VALIDATE updated: ',time);
            },

            self.datetimepicker = function() {
                var app = element,
                    o = opts;

                // console.log('__DATETIPI:\nelement ',app.nodeName, //  opts ', opts,' 'elem.$.time1',app.$.time1
                dp1 = app.$.dp1;
                dp2 = app.$.dp2;

                app.disableDays = []; // TODO

                // INIT DATES
                self.initDates();

                // INIT TIME
                timeIntervals = app.intervalHours;
                t1 = app.$.time1;
                t2 = app.$.time2;
                t1_items = app.getElements('plb_1');
                t2_items = app.getElements('plb_2');

                self.initTime(o);
console.log('INIT TIME EXIT');

                if (isToday) {
                    self.disableStartPastHours(time.start.index, t1_items);
                }
                if (d2isMin || datesEqual) {
                    // console.log('--- > minDdate === dp2.date: ', minDdate === dp2.date);
                    self.disableEndPastHours(time.end.index, t2_items);
                }

                // EVENTS
                // On Time change
                app._onSelectedDateChanged = function(e) {
                    console.log('__DATE CH: outOfBounds: ',outOfBounds,e);
                    console.log('__DATE CH\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                    console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                        '\ndateStart: ',dateStart,' dateEnd: ',dateEnd,'minDdate: ',minDdate);

                    if(outOfBounds) {
                        outOfBounds = !1; return;
                    }

                    // Update vals
                    isToday = compareDates(dp1.date, today);
                    datesEqual = compareDates(dp1.date, dp2.date);
                    minDdate = addMoment(dp1.date, o.durationMin, o.format);
                    d2isMin = dp2.date === minDdate;

                    // console.log('__DATE CH: minDdate:', minDdate);

                    if(e.target.id === 'dp1') {
                        dp2.minDate =  moment(minDdate).subtract(1, "day").format(opts.format);
                    }

                    if (isToday) {
                        dp2.minDate = moment(minDdate).subtract(1, "day").format(opts.format);
                        dp2.enforceDateChange();
                        self.disableStartPastHours(time.start.index, t1_items);
                        self.validateTimeDuration();
                    } else {
                        self.enableTimeStartValues(t1_items);
                    }
                    // start + min >= end
                    if(moment(minDdate).isSameOrAfter(dp2.date)) {
                        // start + min >= end
                        // - set end = start + min
                        // - endMin = end - 1
                        if (moment(minDdate).isAfter(dp2.date)) {
                            // Update dateEnd
                            self.setDate(dp2, minDdate);
                        }
                        // Disable end hours from time.start
                        self.disableEndPastHours(time.start.index, t2_items);
                        // Calc indexes
                    } else {
                        self.enableTimeEndValues(t2_items);
                    }

                    self.formatDates();
                    app._closeDialog();

                    // console.log('__DATE CH\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                    // console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    //     '\ndateStart: ',dateStart,' dateEnd: ',dateEnd,'minDdate: ',minDdate);
                };

                // On Time change
                app._onSelectedTime_1Change = function(_n, _o) {
                    time.start.index = _n;
                    console.log('>> t1 n o: ',_n, _o, 'time.start.index: ',time.start.index, ' equal_or_min: ',equal_or_min);
                    if (_n && equal_or_min) { // || _n && isToday ?
                        self.validateTimeDuration();
                    }
                };
                app._onSelectedTime_2Change = function(_n, _o) {
                    time.end.index = _n;
                };
            }
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

            if(el.getAttribute('date-format'))
            // TODO check format validity
                o.format = el.getAttribute('date-format');
            if(el.getAttribute('duration-min'))
                o.durationMin = parseInt(el.getAttribute('duration-min'));
            if(el.getAttribute('disabled-dates'))
                o.disabledDates = el.getAttribute('disabled-dates');
            if(el.getAttribute("input-date"))
                o.inputDate = el.getAttribute("input-date");
            if(el.getAttribute("date-end"))
                o.dateEnd = el.getAttribute("date-end");

            // Time init values
            if(el.getAttribute('time-interval'))
                o.timeInterval = parseInt(el.getAttribute('time-interval'));
            if(el.getAttribute('time-min')) {
                o.timeMin = parseInt(el.getAttribute('time-min'));
                // WIP if (o.timeMin >= 23) o.timeMin = defaults.timeMin;
            }
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

// Config & init
var app, picker,
    wcReady = dtpReady = !1;

document.addEventListener("DOMContentLoaded", function(e) {
    app = document.querySelector('app-datetime-picker');
    if(app) picker = new DateTimePicker(app);
});
window.addEventListener('WebComponentsReady', function() {
    console.log('WebComponentsReady, dtpReady: ', dtpReady);
    wcReady = !0;
    if (dtpReady && wcReady) {
        picker.init();
    }
});
window.addEventListener('datetime-picker-ready', function() {
    console.log("datetime-picker-ready");
    dtpReady = !0;
    if (dtpReady && wcReady) {
        picker.init();
    }
});

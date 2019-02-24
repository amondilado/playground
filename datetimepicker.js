// TODO
// - Notifications
// - check format validity
// - range
// - helper functions review, getMoment for time, group repeated date vars update
// - disabledDays
// - disabledDates
//

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

    getClosestInterval = function(interval) {
        var coeff = 1000 * 60 * interval,
            date = new Date(),
            cl = new Date(Math.ceil(date / coeff) * coeff),
		    rm = cl.getMinutes();

            console.log('__Date: ', date,'\n cl:',cl,' rm:',rm);
            return (rm === 0) ? '00' : ''+rm; // String coersion
    },

    // Calculate index based on time min and time interval
    getTimeOffset = function(interval, min, i) {
        if (interval > 1) {
            var offset = (interval === 15) ? min * 4 : min * 2;
            return i + offset;
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
    };

    // Constructor
    var DateTimePicker = function(element) {
        if (typeof element === 'undefined') return;

        this.options = this.config(element);
        console.log('Set this.options: ',this.options);

        var self = this,
            initState = !0,
            outOfBounds,
            datesEqual,
            dateStart, dateEnd,
            minDdate,
            dp1, dp2,
            today, isToday,
            d2isMin,
            time = {},
            t1, t2, tmin,
            t1_items, t2_items,
            interval, timeIntervals;

        /**
         * private API
         */
        self.setDate = function(el, d) {
            el.inputDate = d;
            el.minDate = moment(d).subtract(1, "day").format(this.options.format);
            el.enforceDateChange();
        };

        self.formatDates = function() {
            // console.log('__FORMAT D');
            element.formattedDate_1 = getFormat(dp1.date);
            element.formattedDate_2 = getFormat(dp2.date);
        };

        self.enableTimeValues = function(arr) {
            // console.log('__ENABLE T', arr.length);
            for (let i = arr.length - 1; i >= 0; i--) {
                arr[i].removeAttribute('disabled');
            }
        };

        self.updateDateComparisonValues = function() {
            datesEqual = compareDates(dateStart, dateEnd);
            isToday = compareDates(dateStart, today);
            minDdate = addMoment(dateStart, this.options.durationMin, this.options.format);
            d2isMin = minDdate === dateEnd;

            console.log('__UPD DATE COMP: dateStart: ',dateStart,' dateEnd: ',dateEnd,'\nisToday: ',isToday,' datesEqual: ',datesEqual,' minDdate: ',minDdate, ' d2isMin: ',d2isMin);
        };

        self.outOfBounds = function(silent) {
            var _d = dateEnd = addMoment(minDdate, 1, this.options.format);

            if(!silent) {
                alert("OUT OFF BOUNDS! Please select the next available date in your dropoff calendar.");
                outOfBounds = !0;
            }

            self.enableTimeValues(t2_items);
            self.setDate(dp2, _d);
            self.formatDates();

            dateEnd = _d;

            self.updateDateComparisonValues();
        };

        self.setDisabledDates = function(arr) {
            for (var l = arr.length - 1; l >= 0; l--) {
                arr[l] = arr[l].replace(/-/g, '/');
            }
            element.disableDates = arr; // TODO Pass an object or array in JSON format
        };

        self.disablePastHours = function(idx, arr) {
            // console.log('__DISABLE PastHours idx: ', idx,'arr.length: ',arr.length);

            for (var j = arr.length - 1; 0 <= j; j--) {
                if (j < idx) {
                    arr[j].setAttribute("disabled", true);
                } else {
                    arr[j].removeAttribute("disabled");
                }
            }
        };

        self.setTimeStart = function(idx) {
            element.selectedTime_1 = idx;
            t1._applySelection;
        };

        self.setTimeEnd = function(idx) {
            element.selectedTime_2 = idx;
            t2._applySelection;
        };

        self.getTimeNowData = function(min) {
            var obj = {
                h: moment().utcOffset(120).format('kk'),
                m: moment().utcOffset(120).format('mm'),
                min: {
                    h: moment().utcOffset(120).add(min, 'hours').format('kk'), // 1..24
                    m: moment().utcOffset(120).format('mm'),
                }
            };
            obj.value = obj.h+':'+obj.m;
            obj.closest_m = getClosestInterval(interval);
            obj.closest_h = (interval === 30 && obj.closest_m > 30 || interval === 15 && obj.closest_m > 45) ?
                            parseInt(obj.min.h) + 1 : obj.min.h;
            obj.closest = obj.closest_h+':'+obj.closest_m;

            obj.index = timeIntervals.indexOf(obj.closest);

            return obj;
        };

        self.initDates = function() {
            today = moment().utcOffset(120).format(this.options.format);

            if(!this.options.inputDate) {
                this.options.inputDate = today;
            }
            if(!this.options.dateMin) {
                this.options.dateMin = moment().subtract(1, 'days').format(this.options.format);
            }
            if(!this.options.dateEnd) {
                this.options.dateEnd =  addMoment(this.options.inputDate, this.options.durationMin, this.options.format);
            }

            dp1.minDate = this.options.dateMin;
            interval = this.options.timeInterval;
            tmin = this.options.timeMin;
            dateStart = this.options.inputDate;
            dateEnd = this.options.dateEnd;

            var minInDays = parseInt(tmin/24, 10),
                recalcTmin = (minInDays) ? minInDays%24 : 1;

            console.log('__INIT DATES:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                '\nmin: ',tmin,' | minInDays: ',minInDays,' | recalcTmin: ',recalcTmin);

            if(0 < minInDays && 0 < recalcTmin) {
                tmin = recalcTmin;
                isToday = !1;
                console.log('__initDates NEW tmin: ',tmin);
            }

            // Calc dateStart
            if(moment().isBefore(dp1.date)) {
                dateStart = (0 < minInDays) ? addMoment(today, minInDays, this.options.format) : today;
                self.setDate(dp1, dateStart);
            }

            // Calc dateEnd
            if(moment(dateEnd).isBefore(minDdate)) {
                dateEnd = minDdate;
            }

            self.setDate(dp2, dateEnd);
            self.formatDates();
            self.updateDateComparisonValues();

            initState = !1;

            console.log('__INIT DATES set:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                '\ndateStart: ',dateStart,' | dateEnd: ',dateEnd);
        };

        self.initTime = function(o) {
            console.log('__TIMEINX: ', o);
            if(!~timeIntervals.indexOf(o.timeStart)) {
                o.timeStart = defaults.timeStart;
            }
            if(!~timeIntervals.indexOf(o.timeEnd)) {
                o.timeEnd = defaults.timeEnd;
            }

            time.now = self.getTimeNowData(tmin, interval);

            // # Calc timeStart
            time.start_v = (isToday && time.now.closest < o.timeStart) ? time.now.closest : o.timeStart;
            time.start = timeIntervals.indexOf(time.start_v);

            console.log('__>>> TIME set time.start: ', time.start, ' time.start_v: ',time.start_v);

            // Check if timeStart + tmin is within 24h
            var closest_h = parseInt(time.now.closest_h);

            if(closest_h > 24 - tmin || closest_h < parseInt(time.now.h)) {
                dateStart = addMoment(dateStart, 1, this.options.format);
                self.setDate(dp1, dateStart);
                self.outOfBounds('silent');
                // Recalc time.start:
                // - get current time index,
                // - subtract it from array length,
                // - get remainder
                // - subtract remainder from tmin positions in array
                var tnow_mc = getClosestInterval(interval),
                    tnow = timeIntervals.indexOf(time.now.h+":"+tnow_mc),
                    remainder = timeIntervals.length - tnow,
                    // factor = (interval > 1) ? (interval === 15) ? 4 : 2 : 1,
                    tminPos = getTimeOffset(interval,tmin,0);

                time.start = tminPos - remainder;
                // console.log('>>> remainder: ',remainder,' gTOff',getTimeOffset(interval,tmin,0),' | timeIntervals.length: ',timeIntervals.length);
                self.disablePastHours(time.start, t1_items);
                // console.log('__>>> TIME NEW date: ', dateStart, ' time: ',time, timeIntervals[time.start]);
            }

            // # Calc timeEnd
            // if today or equal then recalc timeEnd
            if(!d2isMin) {
                time.end_v = o.timeEnd;
                time.end = timeIntervals.indexOf(time.end_v);
            } else {
                if(!datesEqual) {
                    time.end = time.start;
                } else {
                    // timeEnd index validation
                    if(time.start >= timeIntervals.length) {
                        var left = time.start - timeIntervals.length;
                        time.end = getTimeOffset(interval,tmin,0) - left;
                        self.outOfBounds('silent');
                    }
                    time.end = time.start;
                }
            }

            self.setTimeStart(time.start);
            self.setTimeEnd(time.end);
            console.log('__TIME INIT: ', time);
        };

        self.validateTimeDuration = function() {
            console.log('__VALIDATE new: ',time);

            time.start = getTimeOffset(interval, tmin, time.start);
            time.now = self.getTimeNowData(tmin, interval);

            var isValid = time.start <= time.end;

            if(isToday && time.start < time.now.index) {
                // Update t1 < now
                time.start = time.now.index;
                time.start = getTimeOffset(interval, tmin, time.start);
                self.setTimeStart(time.start);
                // console.log('__VALIDATE update t1: ', time);
                self.disablePastHours(time.start, t1_items);
            }

            if (d2isMin) {
                if(time.start >= time.end) {
                    if (time.start <= timeIntervals.length) {
                        element.selectedTime_2 = null;
                        time.end = time.start;
                        self.setTimeEnd(time.end);
                        // console.log('__VALIDATE update t2: ', time, timeIntervals[time.end]);
                    } else {
                        self.outOfBounds();
                        var left = time.start - timeIntervals.length;
                        time.end = getTimeOffset(interval,tmin,0) - left;
                        self.setTimeEnd(time.end);
                        // console.log('__VALIDATE update t2: ', time);
                        self.disablePastHours(time.end, t2_items);
                        return;
                    }
                }
                self.disablePastHours(time.start, t2_items);
            }

            // console.log('__VALIDATE updated: ',time);
        };

        self.datetimepicker = function() {
            var app = element,
                o = this.options;

            // console.log('__DATETIPI:\nelement ',app.nodeName, //  o ', o,' 'elem.$.time1',app.$.time1
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
                self.disablePastHours(time.start, t1_items);
            }
            if (d2isMin || datesEqual) {
                // console.log('--- > minDdate === dp2.date: ', minDdate === dp2.date);
                self.disablePastHours(time.end, t2_items);
            }

            // EVENTS
            // On Time change
            app._onSelectedDateChanged = function(e) {
                console.log('__DATE CH: outOfBounds: ',outOfBounds);
                console.log('__DATE CH\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    '\ndateStart: ',dateStart,' dateEnd: ',dateEnd);

                if(outOfBounds) {
                    outOfBounds = !1; return;
                }

                if(e.target.id === 'dp1') {
                    dateStart = dp1.date;
                } else { dateEnd = dp2.date}

                // Update vals
                self.updateDateComparisonValues();

                if(e.target.id === 'dp1') {
                    dp2.minDate =  moment(minDdate).subtract(1, "day").format(o.format);
                }

                if (isToday) {
                    dp2.minDate = moment(minDdate).subtract(1, "day").format(o.format);
                    dp2.enforceDateChange();
                    self.disablePastHours(time.start, t1_items);
                    self.validateTimeDuration();
                } else {
                    self.enableTimeValues(t1_items);
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
                    self.disablePastHours(time.start, t2_items);
                    // Calc indexes
                } else {
                    self.enableTimeValues(t2_items);
                }

                self.formatDates();
                app._closeDialog();

                self.updateDateComparisonValues();

                console.log('__DATE CH\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    '\ndateStart: ',dateStart,' dateEnd: ',dateEnd,'minDdate: ',minDdate);
            };

            // On Time change
            app._onSelectedTime_1Change = function(_n, _o) {
                time.start = _n;
                console.log('>> t1 n o: ',_n, _o, 'time.start: ',time.start, ' d2isMin: ',d2isMin);
                if (_n && d2isMin) {
                    self.validateTimeDuration();
                }
            };
            app._onSelectedTime_2Change = function(_n, _o) {
                time.end = _n;
            };
        };
    };

    /**
     * public API
     */
    DateTimePicker.prototype = {
        // set options based on web compoent's attributes
        config: function (element) {
            // console.log('this.options', this.options);
            var el = element, o = {};

            if(el.getAttribute('date-format')) // TODO check format validity in datetimepicker using app-datetimepicker functions
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
            if(el.getAttribute('time-min'))
                o.timeMin = parseInt(el.getAttribute('time-min'));
            if(el.getAttribute('time-start'))
                o.timeStart = el.getAttribute('time-start');
            if(el.getAttribute('time-end'))
                o.timeEnd = el.getAttribute('time-end');

            if (!this.options) {
                this.options = extend({}, defaults);
            }

            return extend(this.options, o);
        },
        destroy: function() {
            // If plugin isn't already initialized, stop
            if (!this.options) return;

	        // Remove init class for conditional CSS, or any other init functionality
            document.documentElement.classList.remove('dtp-loaded');
        },
        init: function() {
            this.datetimepicker();
            // Add class to HTML element to activate conditional CSS
            document.documentElement.classList.add('dtp-loaded');
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
function initPicker() {
    dtpReady && wcReady && picker.init();
}
window.addEventListener('WebComponentsReady', function() {
    // console.log('WebComponentsReady, dtpReady: ', dtpReady);
    wcReady = !0;
    initPicker()
});
window.addEventListener('datetime-picker-ready', function() {
    // console.log("datetime-picker-ready");
    dtpReady = !0;
    initPicker()
});

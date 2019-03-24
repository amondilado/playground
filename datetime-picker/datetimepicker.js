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
                date = new Date(), // '2019-03-30T22:10:00'
                cl = new Date(Math.ceil(date / coeff) * coeff), rm = cl.getMinutes();
            // console.log('__Date: ', date,'\n momnet',moment().utcOffset(120).format('kk'), moment().utcOffset(120).format('mm'));
            // console.log('--- rm: ',rm,' > cl: ', cl);
            return (rm === 0) ? '00' : ''+rm;
        },

        // Calculate index based on time min and time interval
        getTimeOffset = function(interval, min, i) {
            if (interval > 1) {
                var offset = (interval === 15) ? min * 4 : min * 2;
                // console.log('__TIME OFFSET: i + off: ',i,' + ',offset, i + offset);
                return i + offset;
            } else {
                // console.log('else return: ',i + min);
                return i + min;
            }
        },
        // Set format for date-display wc
        getFormat = function(d) {
            var date = {
                day: moment(d).format('D'), // 1..31
                dayw: moment(d).format('dddd'), // Sunday
                monthYear: moment(d).format('MMMM YYYY') // July 2025
            };
            return date;
        },
        enableTimeValues = function(arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
                arr[i].removeAttribute('disabled');
            }
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
            durationMin: 0,
            disabledDays: [],
            disabledDates: [],
            timeInterval: "",
            timeStart: "12:00",
            timeEnd: "12:00",
            timeMin: 1,
            hideToday: !1
        },

        // Constructor
        DateTimePicker = function(elem1, elem2) {
            'use strict';

            var self = this,
                opts,opts2,
                initState = !0,
                outOfBounds,
                datesEqual,
                dateStart, dateEnd,
                minDdate,
                dtp1, dtp2,
                dp1, dp2,
                today, dayForward = !1,
                d1isMin, d2isMin, dmin,
                time = {},
                tmin, t1, t2,
                t1_h_items, t1_m_items,
                t2_h_items, t2_m_items,
                interval, timeIntervals;

            if (typeof elem1 !== 'undefined' && typeof elem2 !== 'undefined') {
                dtp1 = elem1;
                dtp2 = elem2;
                opts = self.config(dtp1);
                opts2 = self.config(dtp2);
                opts.dateEnd = opts2.dateEnd;
                opts.timeEnd = opts2.timeEnd;
                this.opts = opts;
                console.log('__OPTS: ',this.opts);

            } else return;

            // console.log('opts',opts);

            /**
             * private API
             */
            self.getMoment = function(d) {
                var returnMoment, format = opts.format;

                if (d === undefined || d === null) {
                    returnMoment = moment().utcOffset(120).format(format);
                } else if (moment.isDate(d) || moment.isMoment(d)) {
                    // If the date that is passed in is already a Date() or moment() object,
                    // pass it directly to moment.
                    returnMoment = moment(d).utcOffset(120).format(format);
                } else {
                    //returnMoment = moment(d, parseFormats, options.useStrict);
                }

                return returnMoment;
            };

            self.setDate = function(el, d) {
                if(el === "dp2") { 
                    el = dp2; 
                    el.minDate = minDdate;
                }
                el.inputDate = d;
                el.enforceDateChange();
            };

            self.formatDates = function(el) {
                if(el) {
                    if (el === 'dtp1') {
                        dtp1.formattedDate_1 = getFormat(dp1.date);
                    } else {
                        dtp2.formattedDate_1 = getFormat(dp2.date);
                    }
                } else {
                    dtp1.formattedDate_1 = getFormat(dp1.date);
                    dtp2.formattedDate_1 = getFormat(dp2.date);
                }
            };
            //TODO
            // self.computeRangeDates = function(d1, d2) {
            //     console.log('__computeRangeDates: d1, d2:', d1, d2);
            //     var range = [],
            //         currentDate = addMoment(d1,1, opts.format);
            //
            //     while (currentDate < d2) {
            //         // range.push(new Date (currentDate));
            //         range.push(currentDate);
            //         currentDate = addMoment(currentDate,1, opts.format);
            //     }
            //     console.log('range', range);
            //     dtp1.rangeDates = range;
            //     dtp2.rangeDates = range;
            //     // return range;
            // };

            self.setDisabledDates = function(arr) {
                for (var l = arr.length - 1; l >= 0; l--) {
                    arr[l] = arr[l].replace(/-/g, '/');
                }
                dtp1.disableDates = arr; // TODO Pass an object or array in JSON format
            };

            self.disablePastHours = function(idx, arr) {
                // console.log('idx: ',idx,' arr: ',arr);
                for (var j = arr.length - 1; 0 <= j; j--) {
                    if (j < idx) {
                        arr[j].setAttribute("disabled", true);
                    } else {
                        arr[j].removeAttribute("disabled");
                    }
                }
            };

            self.updateMetrics = function() {
                datesEqual = compareDates(dateStart, dateEnd);
                d1isMin = compareDates(dateStart, dmin);
                minDdate = addMoment(dateStart, this.opts.durationMin, this.opts.format);
                d2isMin = minDdate === dateEnd;
                console.log('__UPD DATE COMP: dateStart: ',dateStart,' dateEnd: ',dateEnd,'\nd1isMin: ',d1isMin,' datesEqual: ',datesEqual,' minDdate: ',minDdate, ' d2isMin: ',d2isMin);
            };

            self.setTimeStart = function(h, m) {
                console.log('setTimeStart h: ',h,' m: ',m);
                dtp1.selectedHour = h;
                if(typeof m !== 'undefined') {
                    dtp1.selectedMinutes = m; }
            };

            self.setTimeEnd = function(h, m) {
                console.log('_setTimeEnd h: ',h,' m: ',m);
                dtp2.selectedHour = h;
                if(m) { dtp2.selectedMinutes = m }
            };

            self.setTimeNowData = function(min) {
                // console.log('---> time in: ',time);
                var mc = getClosestInterval(interval), 
                    cm = moment().utcOffset(120).format('mm'), res = !0;
                time.now_m = timeIntervals.indexOf(mc);
                // console.log('setTimeNowData tn: ', tn,' tnmin',tnmin,'\ntmin in date f: ', tnmin.format(opts.format));
                time.now_h = parseInt(moment().utcOffset(120).add(min, 'hours').format('kk'));
                // console.log('>>>> mc:', mc, ' cm: ',cm,' time.now_m: ',time.now_m, '>> time.now_h [', typeof time.now_h,'] timeIntervals ',timeIntervals, time);
                if(interval === 30 && cm > 30 || interval === 15 && cm > 45) {
                    time.now_h++
                }

                if(initState && d1isMin) {
                    var tn = moment().utcOffset(120),
                        tnmin = moment().utcOffset(120).add(opts.timeMin, 'hours');
                    dayForward = tn.format(opts.format) < tnmin.format(opts.format) || time.now_h > 23;
                    res = (time.now_h === 24) ? addMoment(today, 1, opts.format) : tnmin.format(opts.format);
                    console.log('---> time dayForward: ',dayForward,'\n > tn: ',tn.format(opts.format),' < tnmin', tnmin.format(opts.format));
                    if (dayForward) {
                        time.start_h = time.now_h;
                        time.start_m =  time.now_m;
                    }
                }

                if (time.now_h > 23) {
                    time.now_h = time.now_h - 24;
                    console.log('>>>> time.now_h > 23 ',time.now_h);
                }

                return dayForward && res;
            };

            self.outOfBounds = function(silent) {
                console.log('>>>> outOfBounds silent: ',silent);
                var _d = dateEnd = addMoment(minDdate, 1, opts.format);

                if(!silent) {
                    alert("OUT OFF BOUNDS! Please select the next available date in your dropoff calendar.");
                    outOfBounds = !0;
                }

                enableTimeValues(t2_h_items);
                self.setDate('dp2', _d);
                self.formatDates();
                self.updateMetrics();
                console.log('>>>> outOfBounds _d: ',_d, dateEnd,
                    '\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                    '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);
            };

            self.initDates = function() {
                tmin = opts.timeMin;
                console.log('__INIT DATES in:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                    '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,'\n >>>> tmin: ',tmin);
                

                today = moment().add(tmin, "hours").format(opts.format);

                
                if(!opts.dateMin || opts.dateMin < today) {
                    opts.dateMin = today;
                }
                opts.dateMin = moment(opts.dateMin).subtract(1, "days").format(opts.format);

                if(!opts.inputDate || opts.inputDate < today) {
                    opts.inputDate = today;
                    // console.log('>>> opts.inputDate < today ',opts.inputDate, today)
                }
                dateStart = opts.inputDate;

                if(!opts.dateEnd) {
                    opts.dateEnd = addMoment(opts.inputDate, opts.durationMin, opts.format);
                }
                // Set current time
                dp1.minDate = opts.dateMin;
                dmin = addMoment(opts.inputDate, opts.durationMin, opts.format);
                console.log('__INIT DATES: dmin: ',dmin,' | today: ',today);

                self.setTimeNowData(opts.timeMin);
                dateEnd = opts.dateEnd;

                console.log('____ dp1.inputDate: ',dp1.inputDate);    

                minDdate = addMoment(dateStart, opts.durationMin, opts.format);

                if(moment(dateEnd).isBefore(minDdate)) {
                    dateEnd = minDdate;
                }

                // self.computeRangeDates(dp1.inputDate, dateEnd); TODO
                self.setDate(dp1, dateStart);
                self.setDate("dp2", dateEnd);
                self.formatDates();
                // Update date comparison values
                self.updateMetrics();
                initState = !1; // keep init here or in datetimepicker() ?

                console.log('__INIT DATES out:\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate,
                    '\ndp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate);
            };

            self.initTime = function(o) {
                var temp = o.timeStart.split(':'),
                    isValid;

                // dayForward = true when tmin >> dateStart + 1
                if(!dayForward) {
                    time.start_h = parseInt(temp[0]);
                    time.start_m = timeIntervals.indexOf(temp[1]);
                    console.log('--> !dayForward time: ',time);
                }

                // isValid = d1isMin && time.start_h >= time.now_h && time.start_m >= time.now_m
                //           || d2isMin && time.start_h < time.end_h && time.start_m < time.end_m;
                // if(d1isMin || d2isMin) { // datemin or equal
                //     isValid = time.start_h >= time.now_h && time.start_m >= time.now_m && time.start_h < time.end_h && time.start_m < time.end_m;
                // } else {
                //     isValid = time.start_h <= time.end_h && time.start_m <= time.end_m;
                // }
                isValid = (d1isMin)
                    ? (d2isMin)
                        ? time.start_h >= time.now_h && time.start_m >= time.now_m && time.start_h < time.end_h && time.start_m < time.end_m
                        : time.start_h >= time.now_h && time.start_m >= time.now_m // TODO keep minutes?
                    : (d2isMin)
                        ? time.start_h <= time.end_h && time.start_m <= time.end_m // What if h pass but m FAIL?
                        : !0;

                console.log('__INIT TIME: ',time,
                    '\nd1isMin: ',d1isMin,' initTime isValid: ',isValid);

                if(d1isMin && !isValid) {
                    console.log('--> d1isMin && !isValid');
                    time.start_h = time.now_h;
                    time.start_m =  time.now_m;
                }
                self.setTimeStart(time.start_h,time.start_m);

                // if today or equal then recalc
                if(d2isMin && !isValid) {
                    time.end_h = 1 + parseInt(time.start_h);
                    console.log('time.end_h ', time.end_h);
                    if (time.end_h > 23 ) {
                        self.outOfBounds('silent');
                        time.end_h = 0;
                    }
                    time.end_m = time.start_m;
                } else {
                    temp = o.timeEnd.split(':');
                    time.end_h = parseInt(temp[0]);
                    time.end_m = timeIntervals.indexOf(temp[1]);
                }
                self.setTimeEnd(time.end_h,time.end_m);
                console.log('initTime ',time);
            };

            self.validateTimeDuration = function() {
                var o = opts;

                time.start_hmin = 1 + parseInt(time.start_h);

                // Set current time
                self.setTimeNowData(tmin);

                var isValid = time.start_hmin <= time.end_h && 24 > time.start_h;

                if(d1isMin && time.start_h < time.now_h) {
                    // Update t1 < now
                    time.start_h = time.now_h;
                    time.start_hmin = getTimeOffset(interval, 1, time.start_h);
                    // console.log('time.start_hmin: ',time.start_hmin, ' time.start_h: ',time.start_h);
                    self.setTimeStart(time.start_h);
                    self.disablePastHours(time.start_h, t1_h_items);
                }
                // equal, isd2Min
                if (d2isMin || datesEqual) {
                    if(!isValid) {
                        // console.log('time.start_hmin',time.start_hmin,' time.end_h',time.end_h);
                        dtp2.selectedHour = null;
                        time.end_h = time.start_hmin;
                        self.setTimeEnd(time.end_h);
                        if (time.start_hmin > 23) {
                            self.outOfBounds('silent');
                            return;
                        }
                    }

                    self.disablePastHours((datesEqual) ? time.start_h+1 : time.start_h, t2_h_items);
                }
                // console.log('__VALIDATE updated: ',time);
            };

            self.datetimepicker = function() {
                var o = opts;
                dp1 = dtp1.$.dp1;
                dp2 = dtp2.$.dp1;

                dtp1.disableDays = []; // TODO


                // INIT TIME
                timeIntervals = dtp1.hourIntervals;
                interval = opts.timeInterval;
                t1 = dtp1.$.time;
                t2 = dtp2.$.time;
                t1_h_items = t1.getTimeItems('hourItems');
                t1_m_items = t1.getTimeItems('minItems');
                t2_h_items = t2.getTimeItems('hourItems');
                t2_m_items = t2.getTimeItems('minItems');
                // console.log('t1: ',t1,'t1_h_items: ',t1_h_items);
                // console.log('t2: ',t2,'\nt2_h_items: ',t2_h_items,'\nt2_m_items: ',t2_m_items);

                // INIT DATES
                self.initDates();
                self.initTime(o);

                if (d1isMin || dayForward) {
                    dayForward = !1;
                    // console.log('dayForward: ',dayForward);
                    if(time.start_h > 0) self.disablePastHours(time.start_h, t1_h_items);
                }
                if (d2isMin || datesEqual) {
                    self.disablePastHours(time.end_h, t2_h_items);
                }

                function datesChanged(target) {
                    // console.log('__DATE CH: outOfBounds: ',outOfBounds,target,
                    //     '\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                    // console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,
                    //     '\ndateStart: ',dateStart,' dateEnd: ',dateEnd,'minDdate: ',minDdate);

                    if(outOfBounds) {
                        outOfBounds = !1; return;
                    }

                    // Update date comparison values
                    self.updateMetrics();

                    var validateTime = d1isMin || d2isMin;

                    // console.log('__DATE CH: time:', time);

                    // Update dateEnd min value on dateStart change
                    if(target === 'dp1') {
                        dp2.minDate = moment(minDdate).subtract(1, "day").format(opts.format);
                    }

                    if (d1isMin) {
                        dp2.minDate = moment(minDdate).subtract(1, "day").format(opts.format);
                        dp2.enforceDateChange();
                        time.now_h > 0 && self.disablePastHours(time.now_h, t1_h_items);
                    } else {
                        enableTimeValues(t1_h_items);
                    }

                    // start + min >= end
                    if (moment(minDdate).isAfter(dp2.date)) {
                        // Update dateEnd
                        // - set end = start + min
                        // - endMin = end - 1
                        self.setDate(dp2, minDdate);
                    }
                    if(d2isMin) {
                        // Disable end hours from time.start
                        self.disablePastHours((datesEqual) ? time.start_h+1 : time.start_h, t2_h_items);
                        // Calc indexes
                    } else {
                        enableTimeValues(t2_h_items);
                    }

                    validateTime && self.validateTimeDuration();

                    // Update date comparison values
                    self.updateMetrics();

                    // console.log('__DATE CH\ndp1.inputDate: ',dp1.inputDate,' | dp1.date: ',dp1.date,' | dp1.minDate: ',dp1.minDate);
                    // console.log('dp2.inputDate: ',dp2.inputDate,' | dp2.date: ',dp2.date,' | dp2.minDate: ',dp2.minDate,'dateStart: ',dateStart,
                    //     '\ndateEnd: ',dateEnd,'minDdate: ',minDdate, ' | d2isMin: ',d2isMin,' | datesEqual: ',datesEqual,' | validateTime: ',validateTime);
                }

                // EVENTS
                // On Time change
                dtp1._onSelectedDateChanged = function(e) {
                    dateStart = dp1.date;
                    datesChanged('dp1');
                    self.formatDates('dtp1');
                    dtp1._closeDialog();
                };
                dtp2._onSelectedDateChanged = function(e) {
                    // console.log('_onSelectedDateChanged: ',e);
                    dateEnd = dp2.date;
                    datesChanged('dp2');
                    self.formatDates('dtp2');
                    dtp2._closeDialog();
                };

                // On Time change TODO event
                t1._hourChanged = function(_n, _o) {
                    time.start_h = _n;
                    t1.setHour(_n);
                    // console.log('>> t1 n o: ',_n, _o, 'time.start_h: ',time.start_h);
                    if (_n) { // && d2isMin shall I add d1isMin ? //  || _n && d1isMin ?
                        self.validateTimeDuration();
                    }
                };
                t2._hourChanged = function(_n, _o) {
                    time.end_h = _n;
                    t2.setHour(_n);
                };
            };
        };

    // public API
    DateTimePicker.prototype.opts = null;
    DateTimePicker.prototype = {
        // configure functionality, construct options from node attributes
        config: function (elem) {
            var el = elem, o = {}, input_date = el.getAttribute("input-date");

            if(el.getAttribute('date-format')) // TODO check format validity
                o.format = el.getAttribute('date-format');
            if(el.getAttribute('duration-min'))
                o.durationMin = parseInt(el.getAttribute('duration-min'));
            if(el.getAttribute('disabled-dates'))
                o.disabledDates = el.getAttribute('disabled-dates');
            if(el.getAttribute('disabled-days'))
                o.disabledDays = el.getAttribute('disabled-days');
            if(el.getAttribute('max-date'))
                o.dateMax = el.getAttribute('max-date');

            if(input_date) {
                (elem.id === "dtp2") ? o.dateEnd = input_date : o.inputDate = input_date;
            }

            // Time init values
            if(el.getAttribute('time-interval'))
                o.timeInterval = parseInt(el.getAttribute('time-interval'));
            if(el.getAttribute('time-min')) {
                o.timeMin = parseInt(el.getAttribute('time-min'));
                (o.timeMin) ? o.timeMin : o.timeMin = defaults.timeMin;
            }
            if(el.getAttribute('time-start'))
                o.timeStart = el.getAttribute('time-start');
            if(el.getAttribute('time-end'))
                o.timeEnd = el.getAttribute('time-end');

            if (!this._o) { // always undefined
                this._o = extend({}, defaults);
            }

            var opts = extend(this._o, o);
            // console.log('__CONFIG opts: ',opts);
            return opts;
        },

        getOpts: function() {
            return this.opts;
        },

        init: function() {
            this.datetimepicker();
        }
    };

    return DateTimePicker;
}));

// Config & init
var dtp1,dtp2, picker,
    wcReady = !1, dtpReady = 0;

document.addEventListener("DOMContentLoaded", function(e) {
    dtp1 = document.getElementById('dtp1');
    dtp2 = document.getElementById('dtp2');
    if(dtp1 && dtp2) picker = new DateTimePicker(dtp1, dtp2);
});
function initPicker() {
    wcReady && (dtpReady === 2) && picker.init();
    if (wcReady && (dtpReady === 2)) {window.runTest()}
}
window.addEventListener('WebComponentsReady', function() {
    wcReady = !0;
    console.log('WebComponentsReady, wcReady: ',wcReady,'dtpReady: ', dtpReady);
    initPicker()
});
window.addEventListener('datetime-picker-ready', function() {
    dtpReady++;
    console.log("datetime-picker-ready",dtpReady);
    initPicker()
});
window.addEventListener('time-picker-ready', function() {
    console.log("time-picker-ready");
});
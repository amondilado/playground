console.log('Test imported');
var runTest = function () {
    var dp1 = dtp1.$.dp1,
        dp2 = dtp2.$.dp1,
        t1 = dtp1.$.time,
        t2 = dtp2.$.time,
        t1_v = t1.hourVal+":"+t1.minutesVal,
        t2_v = t2.hourVal+":"+t2.minutesVal,
        opts = picker.getOpts(),
        format = opts.format,//"YYYY-MM-DD", opts.durationMin
        today = moment().utcOffset(120).format(format),
        dateMin = moment(today).add(opts.timeMin, 'hours').format(format),
        nowH = moment().utcOffset(120).format("kk"),
        nowM = moment().utcOffset(120).format("mm"),
        nowT = nowH+":"+nowM,
        regTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/, // valid 24:59
        nowMinH = moment().utcOffset(120).add(opts.timeMin, 'hours').format('kk'),
        nowMin = (nowMinH < 23) ? nowMinH : "00"+":"+nowM; // TODO get component nowMin in intervals

    // Methods

    console.log(
        't1_v: ',t1_v,
        't2_v: ',t2_v,
        'nowH: ',nowH,
        'nowM: ',nowM,
        'nowT: ',nowT,
        'dateMin: ',dateMin,
        'dp1.date: ',dp1.date,
        'dp1.date: ',dp1.date,
        'dp2.date: ',dp2.date,

    );
// console.log('regTime: ', regTime.test("05:65"));
// Greater than
    var lt = function(a,b) {
            return a < b;
        },
        gt = function(a,b) {
            return a > b;
        },
// Greater than or equal
        gte = function(a,b) {
            return a >= b;
        },
// isToday
        isToday = function(a) {
            console.log('isToday today',today);
        },
        setTimeStart = function(h, m) {
            dtp1.selectedHour = h;
            if(typeof m !== 'undefined') {
                dtp1.selectedMinutes = m; }
        },
        setTimeEnd = function(h, m) {
            dtp2.selectedHour = h;
            if(m) { dtp2.selectedMinutes = m }
        },
        datesEqualTimeValid = function(h, m) {
            var r = (dp1.date === dp2.date)
                        ? (dp1.date === dateMin) 
                            ? t1_v >= nowMin && t1_v < t2_v 
                            : t1_v <= t2_v
                        :!1;
            return r;
        }
    ;
    // # TEST: Time Validation for Equal Dates minDate or future...
    //      dates >= today && d1 === d2
    //      times < 24 
    //      d1isMin
    //          ? t1 >= (tnow + tmin) && t1 < t2
    //          : t1 <= t2
    QUnit.module("d1 >= date_min && d1 === d2 && t2 < 24 && t1 < t2");
    QUnit.test("datetime-picker: date >= today", function( assert ) {
        assert.equal(gte(dp1.date,dateMin), true, "d1 >= dateMin" );
        assert.equal(dp1.date, dp2.date, true, "d1 === d2");
        assert.equal(gte(dp2.date, today), true, "date_2 >= today");
        // assert.equal(gte(dp2.date, today), true, "d2min == today && time_2 >= time_1 + 1");
    });
    QUnit.test("datetime-picker: time valid", function( assert ) {
        assert.equal(regTime.test(t1_v), true, "t1_v valid 24:59 format");
        assert.equal(regTime.test(t2_v), true, "t2_v valid 24:59 format");
        assert.ok(lt(t1_v,"24"), true, "t1_v < 24");
        assert.ok(lt(t2_v,"24"), true, "t2_v < 24");
        assert.ok(datesEqualTimeValid(), true, "datesEqualTimeValid valid");
    });

    // # TEST tmin + tnow > 23 Date & Time validation
    // NOTE: To test this add an appropriate value to time-min attribute
    QUnit.module( "tmin + tmin > 23 Dates Valid" );
    QUnit.test("Dates Valid", function( assert ) {
        assert.equal(gte(dp1.date, today), true, "d1 > today");
        assert.equal(gte(dp2.date, dp1.date), true, "d2 >= d1");
    });
    QUnit.test("t1 >= nowMin  Dates NOT Equal t1 < t2", function( assert ) {
        assert.equal(regTime.test(t1_v), true, "t1_v valid 24:59 format");
        assert.equal(regTime.test(t2_v), true, "t2_v valid 24:59 format");
        assert.ok(lt(t1_v,"24"), true, "t1_v < 24");
        assert.ok(lt(t2_v,"24"), true, "t2_v < 24");
        // ~24
        var checkBounds = function() {
            t1_v = t1.hourVal+":"+t1.minutesVal;
            t2_v = t2.hourVal+":"+t2.minutesVal;
            console.log('t1_v, t2_v, nowMin ',t1_v, t2_v, nowMin);
            
            return t1_v >= nowMin
        };
        var checkTime2Min = function() {
            return (dp1.date === dp2.date) ? t2_v > t1_v : !0;
        };
        assert.equal(gte(t1_v,nowMin), true, "t1_v >= nowMin");
        assert.equal(checkTime2Min(), true, "checkTime2Min: t2_v > t1_v");
    });
};
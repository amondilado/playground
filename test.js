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
        nowH = moment().utcOffset(120).format("kk"),
        nowM = moment().utcOffset(120).format("mm"),
        nowT = nowH+":"+nowM,
        regTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/,
        nowMin = moment().utcOffset(120).add(opts.timeMin, 'hours').format('kk')+":"+nowM;

    // Methods

    console.log(
        't1_v: ',t1_v,
        't2_v: ',t2_v,
        'nowH: ',nowH,
        'nowM: ',nowM,
        'nowT: ',nowT,
        'nowMin: ',nowMin,
        'dp1.date: ',dp1.date,
        'dp2.date: ',dp2.date,

    );
// console.log('regTime: ', regTime.test("05:65"));
// Greater than
    var gt = function(a,b) {
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
        dateTimeValid = function(h, m) {
            var r = (dp1.date === dp2.date) 
                    ? (dp1.date === today) ? nowT <= t1_v && t1_v < t2_v : t1_v < t2_v
                    : t1_v <= t2_v;
            console.log('----- return ',r);
            return r;
                    // TODO add timeMin opts.timeMin
        }
    ;

    QUnit.module( "Date & Time: valid" );
    QUnit.test("datetime-picker: date >= today", function( assert ) {
        assert.equal(gte(dp2.date,dp1.date), true, "date_2 >= date_1" );
        assert.equal(gte(dp1.date, today), true, "date_1 >= today");
        assert.equal(gte(dp2.date, today), true, "date_2 >= today");
        // assert.equal(gte(dp2.date, today), true, "d2min == today && time_2 >= time_1 + 1");
    });
    QUnit.test("datetime-picker: time valid", function( assert ) {
        // ~24
        // var checkBounds = function() {
        //     setTimeStart(23,1);
        //     t1_v = t1.hourVal+":"+t1.minutesVal;
        //     t2_v = t2.hourVal+":"+t2.minutesVal;
        //     // console.log(t2_v,t1_v);
        //     return t2_v > t1_v
        // };
        // assert.equal(checkBounds(), true, "checkBounds: t_2 > t_1");

        assert.equal(regTime.test(t1_v), true, "t1_v isValid");
        assert.equal(regTime.test(t2_v), true, "t2_v isValid");
        assert.ok(opts.timeMin, true, "timeMin not empty");
        assert.ok(dateTimeValid(), true, "dateTimeValid valid");
    });

    QUnit.module( "Equal dates: true" );
    QUnit.test("datetime-picker: date >= today", function( assert ) {
        assert.equal(gte(dp2.date,dp1.date), true, "date_2 > date_1" );
        assert.equal(dp1.date, dp2.date, "date_2 == date_1");
        assert.equal(gte(dp1.date, today), true, "date_1 >= today");
        assert.equal(gte(dp2.date, today), true, "date_2 >= today");
        // assert.equal(gte(dp2.date, today), true, "d2min == today && time_2 >= time_1 + 1");
        assert.ok(true, opts.timeMin, "timeMin not empty");
    });
    QUnit.test("datetime-picker: equalDates && today && time_1 >= time_1 + 1 && time_2 > time_1", function( assert ) {
        assert.equal(dp1.date, dp2.date, "date_2 == date_1");
        assert.equal(dp1.date, today, "date_1 == today");
        assert.equal(dp2.date, today, "date_2 == today");
        assert.equal(gte(t1_v,nowMin), true, "t1_v >= nowMin");
        assert.equal(gt(t2_v,t1_v), true, "t_2 > t_1");
    });

    QUnit.module( "Equal dates: false" );
    QUnit.test("datetime-picker: date >= today", function( assert ) {
        assert.equal(gte(dp2.date,dp1.date), true, "date_2 > date_1" );
        // assert.equal(gte(dp1.date,today + min), true, "date_1 >= today + min" );
    });
};
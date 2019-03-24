import '@polymer/polymer/polymer-legacy.js';

/**
 * @polymerBehavior
*/
export const DatePickerBehavior = {
    _setInterval: function(str) {
        var arr;
        if(str === '15') {
            arr = ['00','15','30','45'];
        } else if (str === '30') {
            arr = ['00','30'];
        } else {
            arr = ["00"];
        }
        return arr;
    },

    _displayTime: function (v) {
        return this.hourIntervals[v];
    },

    // Verbals
    _sanitizeObj: function(v) {
        return (typeof v !== 'undefined') ? v : {};
    },
    _sanitizeKey: function(k) {
        return (typeof k !== 'undefined') ? k : '';
    },

    _onSelectedDateChanged: function(e) {},
    formatted: function(v) {},
    _openDialog: function(t) {
        this._closeDialog();
        this.$.adpBackdrop.style.display = "block";
        t.setAttribute('open',true);
        t.nextSibling.setAttribute('open', 'true');
    },
    _closeDialog: function() {
        const dps = this.shadowRoot.querySelectorAll('app-datepicker');
        this.$.adpBackdrop.removeAttribute('style');

        dps[0].removeAttribute('open');
        dps[0].previousSibling.removeAttribute('open');

        if (dps.length === 2 ) {
            dps[1].removeAttribute('open');
            dps[1].previousSibling.removeAttribute('open');
        }
    },
    _toggleDialog: function(e) {
        var t = (e.target.type !== 'button') ? e.target.parentNode : e.target;
        (t.hasAttribute("open")) ? this._closeDialog() : this._openDialog(t);
    }
};
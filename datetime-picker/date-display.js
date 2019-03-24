import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/** `date-format`
 *
 * @customElement
 * @polymer
 */
class DateDisplay extends PolymerElement {
static get template() {
return html`
    <style>
        :host {display: block;@apply --df-day-layout;}
        * { box-sizing: border-box; }
        .day {font-size: var(--df-day-fontsize,1rem);line-height: 1;}
        .dayw, .month-year {@apply --df-date;}
    </style>
    <div class="dayw">[[date.dayw]]</div>
    <div class="day">[[date.day]]</div>
    <div class="date">[[date.monthYear]]</div>
`;}
}
window.customElements.define('date-display', DateDisplay);
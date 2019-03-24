import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../assets/shared-button-styles.js';
const template = html`

<dom-module id="datetime-styles">
<template>
    <style is="custom-style" include="shared-button-styles iron-flex iron-flex-alignment">
        :host {
            display: block;
            font-family: var(--font-family-sans-serif), Verdana;
            color: var(--body-color);
        }

        .time-section {@apply --adp-time-section}
        
        .adp-item {
            position: relative;
            width: 100%;
            @apply --adp-item;
        }
        .btn {
            width: 100%;
            @apply --adp-btn;
        }
       
        .btn-date, .btn-time {
            @apply --adp-datetime-btn;
        }
        .btn-date:hover,.btn-date:focus,.btn-time:hover,.btn-time:focus {
            @apply --adp-datetime-btn-hover;
        }
        
        .btn-icon {
            --iron-icon-height: var(--adp-datetime-btn-icon-width,24px);
            --iron-icon-width: var(--adp-datetime-btn-icon-width,24px);
            @apply --adp-datetime-btn-icon;
        }
        
        @media (min-width: 768px) {
            .adp-item {
                flex-basis: 100%;
                @apply --adp-item-sm;
            }
            .date-section { max-width: var(--adp-date-section-sm-width)};
            .time-section { max-width: var(--adp-time-section-sm-width)};
        }
        
    </style>
</template>
</dom-module>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);
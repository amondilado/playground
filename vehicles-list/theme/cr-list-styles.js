import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../../assets/gomega/shared-styles.js';

const template = html`
<dom-module id="cr-list-styles">
<template>
    <style is="custom-style" include="shared-styles iron-flex iron-flex-alignment"></style>
    <style>
    .vehicles-list-main{transition:opacity .2s ease-out 0s;will-change: opacity;height:100vh;}
    .aside{z-index: 10}
    .fade{opacity:.5}

    .display-items { width: 120px; }
    .display-item {
        background-color: var(--display-item-bg);
        color: var(--display-item-color);
        -ms-flex: 0 0 32px;
        flex: 0 0 32px;
        width: 32px;
        margin-left: 4px;
        margin-right: 4px;
        padding: var(--pager-btn-icon-padding-y, 5px) var(--pager-btn-icon-padding-x, 5px);
        cursor: pointer;
    }
    .display-item:hover, .display-item:focus {background-color: #fff;}
    .display-item.selected {
        background-color: var(--display-item-bg-selected, var(--primary));
        color: var(--display-item-color-selected, #fff);
        pointer-events: none;
    }

    .btn-default {
        position: relative;
        @apply --filters-pane-btn;
    }
    .btn-default iron-icon {
        position: absolute;
        top: 50%;
        @apply --filters-pane-btn-icon;
    }
    .vl-header {margin-bottom: .5em;}
    #toggleFilters{cursor:pointer;font-weight:800;@apply --filters-toggle-btn;}

    .filters-inner {
        padding: 1rem;
    }
    iron-collapse {display: none;}
    iron-collapse.iron-collapse-opened {display: block;}

    .vehicle-item {
        @apply --vehicle-item;
    }
    .vehicle-item::before {
        content:'';
        border-radius: 20px;
        box-shadow: 0 2px 30px rgba(0,0,0,.15);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        opacity: 0;
        transition: opacity .2ms ease-in-out 0s;
        z-index: -1;
    }
    .vehicle-item::before, .vehicle-item:focus::before {opacity: 1;}

    @media (max-width: 767px) {
        .aside { position: static; }
        .iron-collapse[aria-hidden="true"] { display: none; }
        .filters-outer, .filters-inner {
            right:0;
            bottom: 0;
            left:0;
        }
        .filters-outer {
            background-color: var(--filters-pane-bg, #f1f1f1);
            position: fixed;
            top: 0;
            z-index: 500;
        }
        .filters-inner {position: absolute;top: 0;overflow: auto;}
    }

    @media (min-width: 768px) {
        .vehicles-list-container { flex-wrap: nowrap; }
        .vehicles-list-main {flex:0 0 var(--list-main-width,70%); max-width:var(--list-main-width,70%); }
        .aside { flex: 0 0 var(--list-aside-width,30%); max-width:var(--list-aside-width,30%); order:-1; }
        .filters-outer {max-width:var(--list-aside-max-width,270px);}
        .filters-inner {
            @apply --filters-col;
        }
    }
    </style>
</template>
</dom-module>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);

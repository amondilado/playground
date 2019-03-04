import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../../assets/shared-styles.js';

const template = html`
<dom-module id="cr-list-styles">
<template>
    <style is="custom-style" include="shared-styles iron-flex iron-flex-alignment"></style>
    <style>
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
        padding-right: 60px;
    }
    .btn-default iron-icon {
        position: absolute;
        right: .65rem;
        top: 50%;
        margin-top: -20px;
        height:38px;
        width:38px;
    }
    
    .vl-header {border-bottom: 1px solid var(--body-color,#666);margin-bottom: .5em;}
    #toggleFilters{cursor:pointer;font-weight:800}
    
    .filters-inner {
        padding: 1rem;
    }
    iron-collapse {display: none;}
    iron-collapse.iron-collapse-opened {display: block;}
    
    vehicle-list-item::before, fleet-item::before {
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
    vehicle-list-item:hover::before, vehicle-list-item:focus::before,fleet-item:hover::before, fleet-item:focus::before { opacity: 1; }
    
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
        .vehicles-list-main {flex: 0 0 70%; max-width: 70%; }
        .aside { flex: 0 0 30%; max-width: 30%; order:-1; }
        .filters-outer {max-width: 260px;}
        .filters-inner {
            background-color: #fff;
            border-radius: 20px;
            margin-bottom: 20px;
        }
    }
    </style>
</template>
</dom-module>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import './vehicle-item-styles.js';

const template = html`
<dom-module id="vehicle-list-item-styles">
<template>
    <style is="custom-style" include="reboot-styles iron-flex iron-flex-alignment shared-button-styles vehicle-item-styles"></style>
    <style>
    :host {
        background-color: #fff;
        border: 1px solid #ececec;
        border-radius: 0 25px 25px 25px;
        position: relative;
        font-size: 13px;
        overflow: hidden;
    }
    .card-left, .card-middle {padding-left: 15px;padding-right: 15px;}
    .price {font-size: 34px; line-height: 1;}
    .btn-book {@apply --btn-book;}
    .terms-link {@apply --vehicle-item-terms-link}
    .terms-link:hover,.terms-link:focus {@apply --vehicle-item-terms-link-hover}

    @media (min-width: 992px) and (max-width: 1339px) {
        .card-footer {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
        }
        .card-footer > div {-webkit-box-flex: 1;-ms-flex: 1;flex: 1;}
        .price-per-day, .discount, .suggested {max-width: 30%;}
        .total { max-width: 40%;}
    }
    @media (max-width: 1339px) {
        .card-left { padding-top: 15px;}
        .card-right {text-align: center;}
        .card-footer {padding-bottom: 10px;padding-left: 15px;padding-right: 15px;}
    }
    @media (min-width: 1340px) {
        :host, iron-collapse, .card-right {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
        }
        :host {height: 340px; overflow: hidden;}
        iron-collapse {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row wrap;
            flex-flow: row wrap;
            height: 100%;
        }
        .card-left, .card-right {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33%;
            flex: 0 0 33%;
            max-width: 33%;
        }
        .card-left, .card-middle, .card-footer {padding-top: 30px;}
        .card-middle {
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
            border-left: 1px solid #ececec;
            border-right: 1px solid #ececec;
            padding-bottom: 20px;
        }
        .card-left {padding-bottom: 80px;}
        .card-right {
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-pack: justify;
            -ms-flex-pack: justify;
            justify-content: space-between;
        }
        .middle-footer {
            -ms-flex-item-align: end;
            align-self: flex-end;
        }
        .card-actions {
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
        }
        .price-total {margin-bottom: 10px;}
        .total {background-color: #e4f9ff;padding: 18px 30px;}
        .total-days {display: inline-block;width: 100%;}
        .btn-book {font-size: 24px;height: 100%;}
    }
  </style>
  </template>
</dom-module>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);

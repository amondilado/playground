import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../assets/gomega/reboot-styles.js';
import '../../assets/gomega/shared-button-styles.js';

const template = html`
<dom-module id="vehicle-item-styles">
<template>
    <style is="custom-style" include="reboot-styles iron-flex iron-flex-alignment shared-button-styles"></style>
    <style>
    :host {
        display: block;
    }
    .d-inbk { display: inline-block; }
    .btn-link {
        border-color: #ececec;
        color: var(--body-color);
    }
    .w100, .card-image { width: 100%; }
    .mb-1 {
        margin-bottom: 8px;
    }
    .clr-3 {
        color: var(--tertiary);
    }
    .ff-2 {
        font-family: 'Comfortaa', sans-serif;
    }
    .vehicle-title {
        font: bold 18px 'Comfortaa', sans-serif;
        margin-top: 0;
    }
    .subtitle {
        font-size: .778em;
        color: #78909c;
    }
    .img-container {
        position: relative;
    }
    .label {
        color: #fff;
        font-size:14px;
        position: absolute;
        text-align: center;       
    }
    .label-unavailable {
        background-color: rgba(0,0,0,0.6);
        left: -15px;
        right: -15px;
        top: 50%;
        margin-top: -27px;
        padding: 18px 8px;
    }
    .vehicles-info-text ul { 
        list-style-type: none;
        padding-left: 1em;
    }
    .vehicles-info-text ul > li {
        position: relative;
        padding-left: 1.5em;
        margin-bottom: .25em;
    }
    .vehicles-info-text ul > li::before {
        content:'';
        background: transparent;
        border: 1px solid var(--primary);
        border-top: none;
        border-right: none;
        position: absolute;
        width: 6px;
        height: 4px;
        left: 0;
        top: 6px;
        -webkit-transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        transform: rotate(-45deg);
    }
    
    .card-right {
        position: relative;
        overflow: hidden;
    }
    
    @media (max-width: 767px) {
        .card-image {
            margin: 0 auto;
            height: var(--vehicle-list-item-img-h-mob);
        }
    }
    @media (min-width: 768px){
        .vehicle-title { margin-bottom: 1rem; }
        .card-image {
            margin: 0 auto;
            height: var(--vehicle-list-item-img-h);
        }
    }
    @media (min-width: 1340px) {
        .d-xl-none { display: none!important; }
        .vehicles-info-text {
            max-height: 210px;
            overflow: hidden;
        }
    }
  </style>
  </template>
</dom-module>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);
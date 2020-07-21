

const domQuery = require('min-dom').query;
const domClasses = require('min-dom').classes;
const domify = require('min-dom').domify;
const bind = require('lodash/bind');

/**
 * @class
 * @constructor
 */
function Popup(options) {
  options = options || {};
  this.template = options.template || this.template;
  const el = this.el = domify(this.template);

  this.header = domQuery('.popup-header', el);
  this.body = domQuery('.popup-body', el);
  this.footer = domQuery('.popup-footer', el);

  document.body.appendChild(el);

  this._attachEvents();
}

Popup.prototype.template = '<div class="bpp-properties-panel-popup">' +
                              '<div class="underlay"></div>' +
                              '<div class="popup">' +
                                '<button class="popup-close"><span>Close</span></button>' +
                                '<div class="popup-header"></div>' +
                                '<div class="popup-body"></div>' +
                                '<div class="popup-footer"></div>' +
                              '</div>' +
                            '</div>';



Popup.prototype._attachEvents = function() {
  const self = this;
  const events = this.events;
  const el = this.el;

  Object.keys(events).forEach(function(instruction) {
    const cb = bind(self[events[instruction]], self);
    const parts = instruction.split(' ');
    const evtName = parts.shift();
    let target = parts.length ? parts.shift() : false;
    target = target ? domQuery(target, el) : el;
    if (!target) { return; }
    target.addEventListener(evtName, cb);
  });
};

Popup.prototype._detachEvents = function() {
  const self = this;
  const events = this.events;
  const el = this.el;

  Object.keys(events).forEach(function(instruction) {
    const cb = bind(self[events[instruction]], self);
    const parts = instruction.split(' ');
    const evtName = parts.shift();
    let target = parts.length ? parts.shift() : false;
    target = target ? domQuery(target, el) : el;
    if (!target) { return; }
    target.removeEventListener(evtName, cb);
  });
};

Popup.prototype.events = {
  // 'keydown:esc':        '_handleClose',
  'click .underlay': '_handleClose',
  'click .popup-close': '_handleClose'
};


Popup.prototype._handleClose = function(evt) {
  this.close();
};


Popup.prototype.open = function(content) {
  domClasses(this.el).add('open');
};

Popup.prototype.close = function() {
  domClasses(this.el).remove('open');
};

Popup.prototype.remove = function() {
  this._detachEvents();
  if (document.body.contains(this.el)) {
    document.body.removeChild(this.el);
  }
};

let popup;
module.exports = function() {
  if (!popup) {
    popup = new Popup();
  }
  return popup;
};

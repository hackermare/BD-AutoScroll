/**
 * @name AutoScroll
 * @author programmerpony
 * @description Autoscroll on GNU/Linux and macOS! This plugin is a fork of [AutoScroll by Pauan](https://github.com/Pauan/AutoScroll), licensed under the [X11/MIT License](https://gitlab.com/programmerpony/BD-AutoScroll/-/raw/main/LICENSE).
 * @version 0.1.1
 * @updateUrl https://raw.githubusercontent.com/programmer-pony/BD-AutoScroll/main/AutoScroll.plugin.js
 * @authorLink https://fosstodon.org/@Luna
 * @donate https://ko-fi.com/programmerpony
 * @source https://gitlab.com/programmerpony/BD-AutoScroll
 */


/*

This plugin is under the following license:

             -- X11/MIT License --

Copyright © 2010-2018 Paul Chapman <pcxunlimited@gmail.com>
Copyright © 2022 programmerpony <programmerpony@riseup.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var htmlNode;
var bodyNode;
var state = {
  timeout: null,
  oldX: null,
  oldY: null,
  dirX: 0,
  dirY: 0,
  click: false,
  scrolling: false
}
var inner;
const math = {
  hypot: (x, y) => {
    return Math.sqrt(x * x + y * y);
  },
  angle: (x, y) => {
    let angle = Math.atan(y / x) / (Math.PI / 180)
    if (x < 0) {
      angle += 180
    } else if (y < 0) {
      angle += 360
    }
    return angle;
  }
}


module.exports = class AutoScroll {
  getName() {
    return 'AutoScroll';
  }
  getVersion() {
    return '0.1.1';
  }
  getAuthor() {
    return 'programmerpony';
  }
  getDescription() {
    return 'Autoscroll on GNU/Linux and macOS! This plugin is a fork of [AutoScroll by Pauan](https://github.com/Pauan/AutoScroll), licensed under the [X11/MIT License](https://gitlab.com/programmerpony/BD-AutoScroll/-/raw/main/LICENSE).';
  }
  load() {}
  start() {
    htmlNode = document.documentElement;
    bodyNode = document.body ? document.body : htmlNode;
    let outer = document.createElementNS('http://www.w3.org/1999/xhtml', 'auto-scroll');
    let shadow = outer.attachShadow ? outer.attachShadow({ mode: 'closed' }) : outer.createShadowRoot();
    inner = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    inner.style.setProperty('transform', 'translateZ(0)');
    inner.style.setProperty('display', 'none');
    inner.style.setProperty('position', 'fixed');
    inner.style.setProperty('left', '0px');
    inner.style.setProperty('top', '0px');
    inner.style.setProperty('width', '100%');
    inner.style.setProperty('height', '100%');
    inner.style.setProperty('z-index', '2147483647');
    inner.style.setProperty('background-repeat', 'no-repeat');
    shadow.appendChild(inner);
    htmlNode.appendChild(outer);
    addEventListener('mousedown', (e) => {
      if (state.scrolling) stopEvent(e, true);
      else {
        let path = e.composedPath();
        let target = (path.length === 0 ? null : path[0]);
        if (target != null && ((e.button === 1 && true) || (e.button === 0 && (e.ctrlKey || e.metaKey) && true)) && e.clientX < htmlNode.clientWidth && e.clientY < htmlNode.clientHeight && isValid(target)) {
          let elem = findScroll(target);
          if (elem) {
            stopEvent(e, true);
            show(elem, e.clientX, e.clientY);
          }
        }
      }
    }, true);
  }
  stop() {
    // Not even the original extension has a script to stop
    location.reload();
  }
};

function isValid(elem) {
  while (true) {
    if (elem == null) return false;
    else if (elem === document || elem === htmlNode || elem === bodyNode) return true;
    else if (elem.host) elem = elem.host;
    else if (isInvalid(elem)) return false;
    else elem = elem.parentNode;
  }
}

function isInvalid(elem) {
  return elem.isContentEditable ||
         (elem.localName === 'a' && elem.href) ||
         (elem.localName === 'area' && elem.href) ||
         (elem.localName === 'textarea' && isEditableText(elem)) ||
         (elem.localName === 'input' && isEditableText(elem));
}

function isEditableText(elem) {
  return !(elem.disabled || elem.readOnly);
}

function findScroll(elem) {
  while (elem !== document && elem !== htmlNode && elem !== bodyNode) {
    if (elem == null) return null;
    else if (elem.host) elem = elem.host;
    else {
      let x = findScrollNormal(elem);
      if (x === null) elem = elem.parentNode;
      else return x;
    }
  }
}

function findScrollNormal(elem) {
  let style = getComputedStyle(elem);
  let width = canScroll(style.overflowX) && elem.scrollWidth > elem.clientWidth;
  let height = canScroll(style.overflowY) && elem.scrollHeight > elem.clientHeight;
  if (width || height) return {
    element:  elem,
    scroller: elem,
    width:    width,
    height:   height,
    root:     false
  }
  else return null;
}

function canScroll(style) {
  return style === 'auto' || style === 'scroll';
}

function canScrollTop(html, body) {
  switch (html) {
    case 'visible':
      return body !== 'hidden';
    case 'auto':
    case 'scroll':
      return true;
    default:
      return false;
  }
}

function stopEvent(e, preventDefault) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  if (preventDefault) e.preventDefault();
}

function image(o) {
  if (o.width && o.height) return 'https://raw.githubusercontent.com/Pauan/AutoScroll/master/src/data/images/origin/both.svg';
  else if (o.width) return 'https://raw.githubusercontent.com/Pauan/AutoScroll/master/src/data/images/origin/horizontal.svg';
  else return 'https://raw.githubusercontent.com/Pauan/AutoScroll/master/src/data/images/origin/vertical.svg';
}

function direction(x, y) {
  let angle = math.angle(x, y);
  if (angle < 30 || angle >= 330) return 'e-resize';
  else if (angle < 60) return 'se-resize';
  else if (angle < 120) return 's-resize';
  else if (angle < 150) return 'sw-resize';
  else if (angle < 210) return 'w-resize';
  else if (angle < 240) return 'nw-resize';
  else if (angle < 300) return 'n-resize';
  else return 'ne-resize';
}

function startCycle(elem, scroller, root) {
  let scrollX = (root ? window.scrollX : scroller.scrollLeft), scrollY = (root ? window.scrollY : scroller.scrollTop);
  function loop() {
    state.timeout = requestAnimationFrame(loop);
    let scrollWidth  = scroller.scrollWidth  - elem.clientWidth, scrollHeight = scroller.scrollHeight - elem.clientHeight;
    scrollX += state.dirX;
    scrollY += state.dirY;
    if (scrollX < 0) scrollX = 0;
    else if (scrollX > scrollWidth) scrollX = scrollWidth;
    if (scrollY < 0) scrollY = 0;
    else if (scrollY > scrollHeight) scrollY = scrollHeight;

    if (root) window.scroll(scrollX, scrollY);
    else {
      scroller.scrollLeft = scrollX;
      scroller.scrollTop  = scrollY;
    }
  }
  loop();
}

function shouldSticky(x, y) {
  return math.hypot(x, y) < 10;
}

function scale(value) {
  return value / 10;
}

function mousewheel(event) {
  stopEvent(event, true);
}

function mousemove(event) {
  stopEvent(event, true);
  let x = event.clientX - state.oldX, y = event.clientY - state.oldY;
  if (math.hypot(x, y) > 10) {
    inner.style.setProperty('cursor', direction(x, y));
    x = scale(x);
    y = scale(y);
    state.dirX = x;
    state.dirY = y;
  } else {
    normalCursor();
    state.dirX = 0;
    state.dirY = 0;
  }
}

function mouseup(event) {
  stopEvent(event, true);
  let x = event.clientX - state.oldX, y = event.clientY - state.oldY;
  if (state.click || !shouldSticky(x, y)) unclick();
  else state.click = true;
}

function unclick() {
  cancelAnimationFrame(state.timeout);
  state.timeout = null;

  removeEventListener('wheel', mousewheel, true);
  removeEventListener('mousemove', mousemove, true);
  removeEventListener('mouseup', mouseup, true);

  normalCursor();

  inner.style.removeProperty('background-image');
  inner.style.removeProperty('background-position');
  inner.style.setProperty('display', 'none');

  state.oldX = null;
  state.oldY = null;

  state.dirX = 0;
  state.dirY = 0;

  state.click = false;
  state.scrolling = false;
}

function normalCursor() {
  inner.style.removeProperty('cursor');
}

function show(o, x, y) {
  state.scrolling = true;
  state.oldX = x;
  state.oldY = y;
  startCycle(o.element, o.scroller, o.root);

  addEventListener('wheel', mousewheel, true);
  addEventListener('mousemove', mousemove, true);
  addEventListener('mouseup', mouseup, true);

  inner.style.setProperty('background-image', `url('${image(o)}')`);
  inner.style.setProperty('background-position', `${x-13}px ${y-13}px`);
  inner.style.removeProperty('display');
}

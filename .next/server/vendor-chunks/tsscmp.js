"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/tsscmp";
exports.ids = ["vendor-chunks/tsscmp"];
exports.modules = {

/***/ "(rsc)/./node_modules/tsscmp/lib/index.js":
/*!******************************************!*\
  !*** ./node_modules/tsscmp/lib/index.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\r\n\r\n// Implements Brad Hill's Double HMAC pattern from\r\n// https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/.\r\n// The approach is similar to the node's native implementation of timing safe buffer comparison that will be available on v6+.\r\n// https://github.com/nodejs/node/issues/3043\r\n// https://github.com/nodejs/node/pull/3073\r\n\r\nvar crypto = __webpack_require__(/*! crypto */ \"crypto\");\r\n\r\nfunction bufferEqual(a, b) {\r\n  if (a.length !== b.length) {\r\n    return false;\r\n  }\r\n  // `crypto.timingSafeEqual` was introduced in Node v6.6.0\r\n  // <https://github.com/jshttp/basic-auth/issues/39>\r\n  if (crypto.timingSafeEqual) {\r\n    return crypto.timingSafeEqual(a, b);\r\n  }\r\n  for (var i = 0; i < a.length; i++) {\r\n    if (a[i] !== b[i]) {\r\n      return false;\r\n    }\r\n  }\r\n  return true;\r\n}\r\n\r\nfunction timeSafeCompare(a, b) {\r\n  var sa = String(a);\r\n  var sb = String(b);\r\n  var key = crypto.pseudoRandomBytes(32);\r\n  var ah = crypto.createHmac('sha256', key).update(sa).digest();\r\n  var bh = crypto.createHmac('sha256', key).update(sb).digest();\r\n\r\n  return bufferEqual(ah, bh) && a === b;\r\n}\r\n\r\nmodule.exports = timeSafeCompare;\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvdHNzY21wL2xpYi9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxtQkFBTyxDQUFDLHNCQUFRO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGNBQWM7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY29ydGV4Y2FydC1pbnNpZ2h0LWRhc2hib2FyZC8uL25vZGVfbW9kdWxlcy90c3NjbXAvbGliL2luZGV4LmpzPzc4Y2UiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gSW1wbGVtZW50cyBCcmFkIEhpbGwncyBEb3VibGUgSE1BQyBwYXR0ZXJuIGZyb21cclxuLy8gaHR0cHM6Ly93d3cubmNjZ3JvdXAudHJ1c3QvdXMvYWJvdXQtdXMvbmV3c3Jvb20tYW5kLWV2ZW50cy9ibG9nLzIwMTEvZmVicnVhcnkvZG91YmxlLWhtYWMtdmVyaWZpY2F0aW9uLy5cclxuLy8gVGhlIGFwcHJvYWNoIGlzIHNpbWlsYXIgdG8gdGhlIG5vZGUncyBuYXRpdmUgaW1wbGVtZW50YXRpb24gb2YgdGltaW5nIHNhZmUgYnVmZmVyIGNvbXBhcmlzb24gdGhhdCB3aWxsIGJlIGF2YWlsYWJsZSBvbiB2NisuXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMzA0M1xyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvcHVsbC8zMDczXHJcblxyXG52YXIgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XHJcblxyXG5mdW5jdGlvbiBidWZmZXJFcXVhbChhLCBiKSB7XHJcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICAvLyBgY3J5cHRvLnRpbWluZ1NhZmVFcXVhbGAgd2FzIGludHJvZHVjZWQgaW4gTm9kZSB2Ni42LjBcclxuICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL2pzaHR0cC9iYXNpYy1hdXRoL2lzc3Vlcy8zOT5cclxuICBpZiAoY3J5cHRvLnRpbWluZ1NhZmVFcXVhbCkge1xyXG4gICAgcmV0dXJuIGNyeXB0by50aW1pbmdTYWZlRXF1YWwoYSwgYik7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdGltZVNhZmVDb21wYXJlKGEsIGIpIHtcclxuICB2YXIgc2EgPSBTdHJpbmcoYSk7XHJcbiAgdmFyIHNiID0gU3RyaW5nKGIpO1xyXG4gIHZhciBrZXkgPSBjcnlwdG8ucHNldWRvUmFuZG9tQnl0ZXMoMzIpO1xyXG4gIHZhciBhaCA9IGNyeXB0by5jcmVhdGVIbWFjKCdzaGEyNTYnLCBrZXkpLnVwZGF0ZShzYSkuZGlnZXN0KCk7XHJcbiAgdmFyIGJoID0gY3J5cHRvLmNyZWF0ZUhtYWMoJ3NoYTI1NicsIGtleSkudXBkYXRlKHNiKS5kaWdlc3QoKTtcclxuXHJcbiAgcmV0dXJuIGJ1ZmZlckVxdWFsKGFoLCBiaCkgJiYgYSA9PT0gYjtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aW1lU2FmZUNvbXBhcmU7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/tsscmp/lib/index.js\n");

/***/ })

};
;
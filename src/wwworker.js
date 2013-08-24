//importScripts('http://davidbkemp.github.io/jsqubits/resources-0.0.1/js/jsqubits.js');

self.addEventListener('message', function(e) {
  self.postMessage(e.data);
}, false);

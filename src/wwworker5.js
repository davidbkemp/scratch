importScripts('http://davidbkemp.github.io/jsqubits/resources-0.0.1/js/jsqubits.js');

self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  self.postMessage('heee');
  self.postMessage('' + jsqubits('101'));
}, false);

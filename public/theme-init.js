// Flash-prevention: read theme preference and set data-theme before React renders.
// This file is loaded as a regular <script> (not module) in <head>.
(function () {
  // IMPORTANT: This key must match STORAGE_KEYS.theme in core/constants.ts
  var STORAGE_KEY = 'theme';

  chrome.storage.local.get(STORAGE_KEY, function (result) {
    var theme = result[STORAGE_KEY] || 'dark';
    var resolved = theme;

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    document.documentElement.dataset.theme = resolved;
  });
})();

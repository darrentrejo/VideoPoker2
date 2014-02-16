VideoPoker2
===========

Javascript video poker game

Basic video poker functionality is in place. There is no betting.

Card images are served from my public dropbox via AJAX. When the card image is fetched, if it has not been 'cached'. it will be placed into a Javascript object for quick retrieval on the next fetch.

All AJAX requests are done synchronously. There is no handling of HTTP errors in AJAX calls... yet.

The design is static. Responsive design will be added later.

HTML5 browser compatibility is assumed. There is no handling of unsupported features in older browsers. In other words, no graceful degradation.

No Javascript frameworks were used. The premise was to create functionality in pure Javascript for the sake of minimal file size.

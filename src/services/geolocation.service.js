/**
 * Created by xiangwang on 12/2/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .service('GeolocationService', GeolocationService);

    GeolocationService.$inject = ['ERROR', 'DEBUG'];

    /* @ngInject */
    function GeolocationService(ERROR, DEBUG) {
        var GeolocationService = this;

        GeolocationService.subscribeToListeners = subscribeToListeners;
        GeolocationService.unsubscribeToListeners = unsubscribeToListeners;
        ////////////////
        var locationListeners = [];
        var watcherId = null;

        /**
         * Subscribe input listener to locationListener list
         * @param listener The target controller's update function
         */
        function subscribeToListeners(listener) {
            if (locationListeners.indexOf(listener) == -1) {
                locationListeners.push(listener);
                activateWatcher();
                if (DEBUG) console.log("Listener <" + listener.title + "> subscribed to location listeners");
            }
        }

        /**
         * Unsubscribe input listener to locationListener list
         * @param listener The target controller's update function
         */
        function unsubscribeToListeners(listener) {
            var index = locationListeners.indexOf(listener);
            if (index != -1) {
                locationListeners.splice(index, 1);
                if (locationListeners.length == 0) {
                    deactivateWatcher();
                }
                if (DEBUG) console.log("Listener <" + listener.title + "> unsubscribed to location listeners");
            }
        }

        function activateWatcher() {
            if (!watcherId) {
                if (navigator.geolocation) {
                    watcherId = navigator.geolocation.watchPosition(function (pos) {
                        angular.forEach(locationListeners, function (update) {
                            update(pos);
                        });
                    });
                } else {
                    alert(ERROR.GEO_NOT_ALLOWED);
                }
            }
        }

        function deactivateWatcher() {
            if (watcherId) {
                navigator.geolocation.clearWatch(watcherId);
                watcherId = null;
            }
        }
    }

})();



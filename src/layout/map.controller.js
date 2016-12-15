/**
 * Created by xiangwang on 11/30/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('MapViewController', MapViewController);

    MapViewController.$inject = ['DataService', 'GeolocationService', 'MapService', '$scope', 'DEBUG', 'DATA_TYPE', 'idFilter'];

    /* @ngInject */
    function MapViewController(DataService, GeolocationService, MapService, $scope, DEBUG, DATA_TYPE, idFilter) {
        var $ctrl = this;

        $ctrl.title = 'Map Controller';
        $ctrl.filters = {
            categoryFilter: "",
            searchFilter: ""
        };
        $ctrl.filterData = {
            categoryList: $ctrl.categoryList
        };

        $ctrl.setCenter = setCenter;
        $ctrl.centerData =  MapService.centerData;
        ////////////////
        var map;
        activate();

        function updateData(data, type) {
            switch (type) {
                case DATA_TYPE.CATEGORY_LIST:
                    $ctrl.categoryList = data;
                    break;
                case DATA_TYPE.PLACE_LIST:
                    MapService.initPlaceMarkers(data);
            }
        }

        function updateUserPosition(pos) {
            MapService.updateUserPosition(pos);
        }

        function setCenter(centerPosistion) {
            MapService.setCenter(centerPosistion);
        }

        function activate() {

            if (DEBUG) console.log("Map controller created");
            // Init map
            map = MapService.initMap();

            DataService.subscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
            DataService.subscribeToListeners(updateData, DATA_TYPE.PLACE_LIST);

            GeolocationService.subscribeToListeners(updateUserPosition);

            if (idFilter) {
                MapService.triggerMarker(idFilter);
            }

            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.PLACE_LIST);
                GeolocationService.unsubscribeToListeners($ctrl);
            });

            $scope.$watch('$ctrl.filters', function () {
                MapService.filterPlaceMarkers($ctrl.filters.categoryFilter, $ctrl.filters.searchFilter);
            }, true);
        }
    }

})();


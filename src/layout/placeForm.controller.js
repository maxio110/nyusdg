/**
 * Created by xiangwang on 12/6/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('PlaceFormController', PlaceFormController);

    PlaceFormController.$inject = ['$uibModalInstance', 'placeForm', 'formType', 'DATA_TYPE', 'GeolocationService', 'DataService', '$scope', 'PLACE_INPUT_REQUIRED_DIC', 'ERROR', 'PLACE_INPUT_GOOGLE_DIC'];

    /* @ngInject */
    function PlaceFormController($uibModalInstance, placeForm, formType, DATA_TYPE, GeolocationService, DataService, $scope, PLACE_INPUT_REQUIRED_DIC, ERROR, PLACE_INPUT_GOOGLE_DIC) {
        var $ctrl = this;
        $ctrl.watchPositionEnabled = false;
        $ctrl.placeForm = placeForm;
        $ctrl.useGeolocation = false;
        $ctrl.PLACE_INPUT_REQUIRED_DIC = PLACE_INPUT_REQUIRED_DIC;

        $ctrl.toggleGeolocation = toggleGeolocation;
        $ctrl.clearAll = clearAll;
        $ctrl.initAutoComplete = initAutoComplete;
        $ctrl.clearGooglePlaceInfo = clearGooglePlaceInfo;
        $ctrl.cancel = cancel;

        ////////////////
        var autoComplete;
        var autoCompleteListener;
        activate();

        function activate() {

            switch (formType) {
                case 'ADD':
                    $ctrl.title = "New Place";
                    $ctrl.submit = addNewPlace;
                    $ctrl.submitButtonText = "Add New Place";
                    break;
                case 'UPDATE':
                    $ctrl.title = "Update Place";
                    $ctrl.submit = updatePlace;
                    $ctrl.submitButtonText = "Update Place";
                    break;
            }

            $ctrl.categoryList = DataService.getCachedData(DATA_TYPE.CATEGORY_LIST);

            $scope.$on('$destroy', function iVeBeenDismissed() {
                GeolocationService.unsubscribeToListeners(updatePosition);
                google.maps.event.removeListener(autoCompleteListener);
                google.maps.event.clearInstanceListeners(autoComplete);
            });
        }

        function initAutoComplete() {
            if (!autoComplete) {
                var input = document.getElementById('name-auto-complete');
                if (input) {
                    autoComplete = new google.maps.places.Autocomplete(input);
                    //If user click on one of the suggested item
                    autoCompleteListener = google.maps.event.addListener(autoComplete, 'place_changed', onPlaceChanged);
                }
            }
        }

        function onPlaceChanged() {
            var place = autoComplete.getPlace();
            var newForm = {};
            for (var key in PLACE_INPUT_GOOGLE_DIC) {
                var googleKey = PLACE_INPUT_GOOGLE_DIC[key];
                if (place[googleKey]) {
                    newForm[key] = place[googleKey];
                }
            }
            newForm.latitude = place.geometry.location.lat();
            newForm.longitude = place.geometry.location.lng();
            $ctrl.placeForm = newForm;
            $scope.$apply();
        }

        function clearAll() {
            var place_id = $ctrl.place_id;
            $ctrl.placeForm = {};
            $ctrl.place_id = place_id;
        }

        function clearGooglePlaceInfo() {
            delete $ctrl.placeForm.google_place_url;
            delete $ctrl.placeForm.google_place_id;
        }

        function addNewPlace() {
            DataService.addPlace($ctrl.placeForm);
        }

        function updatePlace() {
            DataService.updatePlace($ctrl.placeForm);
        }

        function cancel() {
            $uibModalInstance.close($ctrl.placeForm);
        }

        function updatePosition(pos) {
            if (pos) {
                $ctrl.placeForm.longitude = pos.coords.longitude;
                $ctrl.placeForm.latitude = pos.coords.latitude;
                $scope.$apply();
            }
        }

        function toggleGeolocation() {
            $ctrl.useGeolocation = !$ctrl.useGeolocation;
            if ($ctrl.useGeolocation) {
                GeolocationService.subscribeToListeners(updatePosition);
            } else {
                GeolocationService.unsubscribeToListeners(updatePosition);
            }
        }
    }

})();


/**
 * Created by xiangwang on 11/28/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('TableViewController', TableViewController);

    TableViewController.$inject = ['DataService', '$scope', 'DEBUG', 'DATA_TYPE', 'idFilter', '$uibModal'];

    /* @ngInject */
    function TableViewController(DataService, $scope, DEBUG, DATA_TYPE, idFilter, $uibModal) {
        var $ctrl = this;
        $ctrl.title = 'Table Controller';
        $ctrl.detail = {};

        $ctrl.filters = {
            categoryFilter: "",
            searchFilter: ""
        };
        $ctrl.pageConfig = {
            currentPage: 1,
            pageSize: 8,
            pagination: {
                current: 1
            }
        };

        $ctrl.openPlaceDetailModal = openPlaceDetailModal;
        $ctrl.updatePublishStatus = updatePublishStatus;
        $ctrl.deletePlace = deletePlace;

        ////////////////
        activate();

        function updateData(data, type) {
            switch (type) {
                case DATA_TYPE.CATEGORY_LIST:
                    $ctrl.categoryList = data;
                    break;
                case DATA_TYPE.PLACE_LIST:
                    $ctrl.placeList = data;
                    break;
                case DATA_TYPE.CREDENTIALS:
                    $ctrl.credentials = data;
            }
        }

        function updatePublishStatus(place, newStatus) {
            DataService.updatePublishStatus(place, newStatus);
        }

        function deletePlace(place) {
            if (confirm("Are you sure to remove this ?")) {
                DataService.deletePlace(place);
            }
        }

        function activate() {
            if (DEBUG) console.log("Table controller created");
            $ctrl.placeList = DataService.getCachedData(DATA_TYPE.PLACE_LIST);
            $ctrl.categoryList = DataService.getCachedData(DATA_TYPE.CATEGORY_LIST);
            $ctrl.credentials = DataService.getCachedData(DATA_TYPE.CREDENTIALS);

            DataService.subscribeToListeners(updateData, DATA_TYPE.PLACE_LIST);
            DataService.subscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
            DataService.subscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);

            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.PLACE_LIST);
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);
            });

            if (idFilter) {
                for (var i in $ctrl.placeList) {
                    if ($ctrl.placeList[i].place_id == idFilter) {
                        $ctrl.detail = $ctrl.placeList[i];
                        openPlaceDetailModal()
                    }
                }
            }
        }

        function openPlaceDetailModal(form) {
            if ($ctrl.credentials.admin_access || form.username == $ctrl.credentials.username) {
                var copy = JSON.parse(JSON.stringify(form));
                var updatePlaceModalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'src/layout/placeForm.template.html',
                    controller: 'PlaceFormController',
                    controllerAs: '$ctrl',
                    size: 'lg', // 'sm'
                    resolve: {
                        placeForm: function () {
                            return copy;
                        },
                        formType: function() {
                            return "UPDATE"
                        }
                    }
                });

                // Close -> Dismiss
                updatePlaceModalInstance.result.then(function (placeForm) {}, function () {});
            } else {
                var placeDetailModalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'src/layout/placeDetail.template.html',
                    controller: 'PlaceDetailController',
                    controllerAs: '$ctrl',
                    size: 'lg', // 'sm'
                    resolve: {
                        placeDetail: function () {
                            return form;
                        }
                    }
                });

                // Close -> Dismiss
                placeDetailModalInstance.result.then(function () {}, function () {});
            }
        }
    }

})();


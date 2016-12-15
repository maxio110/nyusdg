/**
 * Created by xiangwang on 12/6/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('MainController', MainController);

    MainController.$inject = ['UtilService', '$uibModal', 'DATA_TYPE', 'DataService', '$scope', '$state'];

    /* @ngInject */
    function MainController(UtilService, $uibModal, DATA_TYPE, DataService, $scope, $state) {
        var MainCtrl = this;
        MainCtrl.loginForm = {};
        MainCtrl.state = $state;

        // Test
        // MainCtrl.placeForm = {
        //     place_name: "Store Name",
        //     category: "Foodtruck",
        //     discount_percent: 20,
        //     discount_detail: "Requirements",
        //     information: "Additional Information",
        //     web_url: "http://www.google.com",
        //     logo_url: "http://www.maxiowang.com/images/b4.png",
        //     address: "Address",
        //     phone: "Phone",
        //     longitude: "-73.994007",
        //     latitude: "40.731104",
        //     google_place_id: ""
        // };
        MainCtrl.newPlaceForm = {};
        MainCtrl.isMenuCollapsed = false;
        MainCtrl.selectedStyle = {'color': 'green'};

        MainCtrl.openAddNewPlaceModal = openAddNewPlaceModal;
        MainCtrl.scrollToId = scrollToId;
        MainCtrl.logout = logout;

        ////////////////
        activate();

        function logout() {
            DataService.logout();
        }

        function updateData(data, type) {
            switch (type) {
                case DATA_TYPE.CREDENTIALS:
                    MainCtrl.credentials = data;
            }
        }

        function activate() {
            DataService.subscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);
            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);
            });
        }

        function scrollToId(ID) {
            UtilService.scrollToId(ID);
        }

        function openAddNewPlaceModal(form) {
            // var parentElem = parentSelector ?
            //     angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
            var addNewPlaceModalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'src/layout/placeForm.template.html',
                controller: 'PlaceFormController',
                controllerAs: '$ctrl',
                size: 'lg', // 'sm'
                appendTo: undefined,
                resolve: {
                    placeForm: function () {
                        return form;
                    },
                    formType: function() {
                        return "ADD"
                    }
                }
            });

            // Close -> Dismiss
            addNewPlaceModalInstance.result.then(function (placeForm) {
                MainCtrl.placeForm = placeForm;
            }, function () {
                console.log("Dismissed!!!");
            });
        }
    }

})();


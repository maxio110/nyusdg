/**
 * Created by xiangwang on 12/7/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['DataService', 'WINDOW_SIZE', '$state', '$scope', 'DATA_TYPE'];

    /* @ngInject */
    function LoginController(DataService, WINDOW_SIZE, $state, $scope, DATA_TYPE) {
        var $ctrl = this;

        $ctrl.login = login;
        ////////////////
        activate();

        function updateData(data, type) {
            switch (type) {
                case DATA_TYPE.CREDENTIALS:
                    $ctrl.credentials = data;
                    if ($ctrl.credentials.username) {
                        $state.go('table');
                    }
            }
        }

        function activate() {
            var banner = angular.element(document.getElementById("banner"))[0];
            banner.style.height = WINDOW_SIZE.height + "px";
            banner.style.width = WINDOW_SIZE.width + "px";

            DataService.subscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);

            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);
            });
        }


        function login(username, pwd) {
            DataService.login(username, pwd);
        }

    }

})();


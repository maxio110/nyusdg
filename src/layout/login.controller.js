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

        $ctrl.loginWithNetId = loginWithNetId;
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
            if (location.protocol != 'https:')
            {
                location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
            }
            var banner = angular.element(document.getElementById("banner"))[0];
            banner.style.height = WINDOW_SIZE.height + "px";
            banner.style.width = WINDOW_SIZE.width + "px";

            DataService.subscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);

            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CREDENTIALS);
            });

            gapi.signin2.render('google-login', {
                'scope': 'profile email',
                'width': 100,
                'height': 25,
                'longtitle': false,
                'onsuccess': onSuccess,
                'onfailure': onFailure
            });
        }


        function loginWithNetId(form) {
            DataService.loginWithNetId(form.username, form.password);
        }

        function onSuccess(googleUser) {
            var token = googleUser.getAuthResponse().id_token;
            DataService.loginWithGoogle(token);
        }

        function onFailure(error) {
            alert(error);
        }

    }

})();


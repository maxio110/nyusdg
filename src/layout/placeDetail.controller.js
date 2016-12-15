/**
 * Created by xiangwang on 12/6/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('PlaceDetailController', PlaceDetailController);

    PlaceDetailController.$inject = ['$uibModalInstance', 'placeDetail'];

    /* @ngInject */
    function PlaceDetailController($uibModalInstance, placeDetail) {
        var $ctrl = this;
        $ctrl.placeDetail = placeDetail;

        $ctrl.submit = submit;
        $ctrl.cancel = cancel;

        ////////////////

        function submit() {
            // Submit fail then send back data
            $uibModalInstance.close();
        }

        function cancel() {
            $uibModalInstance.dismiss();
        }


    }

})();


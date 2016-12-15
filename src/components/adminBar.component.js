/**
 * Created by xiangwang on 12/13/16.
 */

(function () {
    'use strict';
    angular
        .module('studentDiscount')
        .component('adminBar', {
            templateUrl: 'src/components/adminBar.template.html',
            controller: adminBar
        });
    adminBar.$inject = ['DataService', '$scope'];
    function adminBar(DataService, $scope) {
        var $ctrl = this;

        function updateData(data, type) {
            switch (type) {
                case DATA_TYPE.CATEGORY_LIST:
                    $ctrl.categoryList = data;
                    break;
            }
        }

        $ctrl.$onInit = function () {
            DataService.subscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
            $scope.$on('$destroy', function iVeBeenDismissed() {
                DataService.unsubscribeToListeners(updateData, DATA_TYPE.CATEGORY_LIST);
            });
        };
    }

})();
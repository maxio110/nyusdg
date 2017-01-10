/**
 * Created by xiangwang on 11/30/16.
 */

(function () {
    'use strict';
    angular
        .module('studentDiscount')
        .component('filterBar', {
            templateUrl: 'src/components/filterBar.template.html',
            bindings: {
                categoryFilter: '=',
                searchFilter: '=',
                pageSize: '=',
                categoryList: '<'
            },
            controller: FilterBarController
        });

    function FilterBarController() {
        var $ctrl = this;
        $ctrl.selectedTab = -1;
        $ctrl.selectedStyle = {'color': 'red'};
        $ctrl.$onInit = function () {
        };
    }

})();
/**
 * Created by xiangwang on 11/30/16.
 */

(function () {
    'use strict';
    angular
        .module('studentDiscount')
        .component('searchBar', {
            templateUrl: 'src/components/searchBar.template.html',
            bindings: {
                categoryFilter: '=',
                searchFilter: '=',
                categoryList: '<'
            },
            controller: SearchBarController
        });

    function SearchBarController() {
        var $ctrl = this;
        $ctrl.selectedTab = -1;
        $ctrl.selectedStyle = {'color': 'red'};
        $ctrl.$onInit = function () {
        };
    }

})();
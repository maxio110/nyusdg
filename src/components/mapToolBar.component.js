/**
 * Created by xiangwang on 11/30/16.
 */

(function () {
    'use strict';
    angular
        .module('studentDiscount')
        .component('mapToolBar', {
            templateUrl: 'src/components/mapToolBar.template.html',
            bindings: {
                centerData: '=',
                setCenter: '&'
            },
            controller: mapToolBarController
        });

    function mapToolBarController() {
        var $ctrl = this;
        $ctrl.selectedStyle = {'color' : 'dodgerblue'};

        $ctrl.$onInit = function () {};
        $ctrl.setNewCenter = setNewCenter;

        ////////////////
        function setNewCenter(info) {
            $ctrl.currentCenter = info.name;
            $ctrl.setCenter({centerPosition: info.pos});
        }
    }

})();
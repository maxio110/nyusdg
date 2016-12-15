/**
 * Created by xiangwang on 12/6/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .service('UtilService', UtilService);

    UtilService.$inject = ['smoothScroll'];

    /* @ngInject */
    function UtilService(smoothScroll) {
        var UtilService = this;
        UtilService.scrollToId = scrollToId;

        ////////////////

        function scrollToId(ID) {
            var element = document.getElementById(ID);
            smoothScroll(element);
        }
    }

})();


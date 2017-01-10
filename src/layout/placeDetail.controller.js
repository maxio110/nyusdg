/**
 * Created by xiangwang on 12/6/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .controller('PlaceDetailController', PlaceDetailController);

    PlaceDetailController.$inject = ['$uibModalInstance', 'placeInfo', 'DataService', '$sce', '$sanitize'];

    /* @ngInject */
    function PlaceDetailController($uibModalInstance, placeInfo, DataService, $sce, $sanitize) {
        var $ctrl = this;
        $ctrl.placeInfo = placeInfo;
        $ctrl.submit = submit;
        $ctrl.cancel = cancel;
        ////////////////
        activate();

        function activate() {
            DataService.httpPostToServer({OPERATION: "GET_PLACE_DETAIL", place_id: placeInfo.place_id}, false)
                .then(function successCallBack(response) {
                    if (typeof response == 'object') {
                        // console.log(response);
                        $ctrl.placeDetail = response;
                        if ($ctrl.placeDetail.weekday_text && Array.isArray($ctrl.placeDetail.weekday_text) && $ctrl.placeDetail.weekday_text.length == 7) {
                            var date = new Date();
                            var day = date.getDay() - 1;
                            $ctrl.placeDetail.weekday_text[day] = '<span class="sky-blue">' + $ctrl.placeDetail.weekday_text[day] + '</span>';
                            $ctrl.placeDetail.weekday_text = '<span class="black"> ' + $ctrl.placeDetail.weekday_text.join("<br />") + '</span>';
                            $ctrl.placeDetail.weekday_text = $sce.trustAsHtml($sanitize($ctrl.placeDetail.weekday_text));
                        }
                    }
                })
        }

        function submit() {
            // Submit fail then send back data
            $uibModalInstance.close();
        }

        function cancel() {
            $uibModalInstance.dismiss();
        }
    }

})();


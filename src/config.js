/**
 * Created by xiangwang on 11/28/16.
 */
(function () {
    'use strict';
    angular.module('studentDiscount')
        .config(PaginationConfig)
        .config(HttpConfig)
        .config(RoutesConfig)
        .config(QProviderConfig);

    QProviderConfig.$inject = ['$qProvider'];
    function QProviderConfig($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }

    HttpConfig.$inject = ['$httpProvider', '$httpParamSerializerProvider'];
    function HttpConfig($httpProvider, $httpParamSerializerProvider) {
        var paramSerializer = $httpParamSerializerProvider.$get();
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.transformRequest = function (data) {
            if (data === undefined) {
                return data;
            }
            var copy = {};
            for (var key in data) {
                if (typeof data[key] != 'string') {
                    copy[key] = btoa('' + data[key]);
                } else {
                    copy[key] = btoa(data[key]);
                }
            }
            copy['encoded'] = btoa('y');
            return paramSerializer(copy);
        };
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    PaginationConfig.$injext = ['paginationTemplateProvider'];
    function PaginationConfig(paginationTemplateProvider) {
        paginationTemplateProvider.setPath('bower_components/angularUtils-pagination/dirPagination.tpl.html');
    }

    RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function RoutesConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/table/');
        $stateProvider
            .state('table', {
                url: '/table/{place_id}',
                templateUrl: 'src/layout/table.template.html',
                controller: 'TableViewController as $ctrl',
                resolve: {
                    idFilter: ['$stateParams', function($stateParams) {
                        return $stateParams.place_id;
                    }]
                }
            })
            .state('map', {
                url: '/map/{place_id}',
                templateUrl: 'src/layout/map.template.html',
                controller: 'MapViewController as $ctrl',
                resolve: {
                    idFilter: ['$stateParams', function($stateParams) {
                        return $stateParams.place_id;
                    }]
                }
            })
            .state('login', {
                url: '/login/',
                templateUrl: 'src/layout/login.template.html',
                controller: 'LoginController as $ctrl'
            })
    }
})();

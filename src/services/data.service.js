/**
 * Created by xiangwang on 11/28/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .service('DataService', DataService);

    DataService.$inject = ['SERVER_BASE_URL', 'DATA_TYPE', '$q', '$http', 'DEBUG', '$state', 'TOKEN_KEY', 'ERROR', 'GOOGLE_SIGNIN_CLIENTID'];

    /* @ngInject */
    function DataService(SERVER_BASE_URL, DATA_TYPE, $q, $http, DEBUG, $state, TOKEN_KEY, ERROR, GOOGLE_SIGNIN_CLIENTID) {
        var DataService = this;

        DataService.deletePlace = deletePlace;
        DataService.addPlace = addPlace;
        DataService.updatePlace = updatePlace;
        DataService.updatePublishStatus = updatePublishStatus;

        DataService.loginWithNetId = loginWithNetId;
        DataService.loginWithGoogle = loginWithGoogle;
        DataService.logout = logout;

        DataService.getCachedData = getCachedData;
        DataService.getLatestPlaceList = getLatestPlaceList;
        DataService.getLatestCategoryList = getLatestCategoryList;
        DataService.httpPostToServer = httpPostToServer;

        DataService.subscribeToListeners = subscribeToListeners;
        DataService.unsubscribeToListeners = unsubscribeToListeners;

        ////////////////
        var cachedData = {};
        var dataListeners = {};
        var auth2;

        activate();

        function activate() {
            for (var key in DATA_TYPE) {
                cachedData[DATA_TYPE[key]] = [];
                dataListeners[DATA_TYPE[key]] = [];
            }
            var token = loadTokenFromStorage();
            if (token) {
                var credential = validateToken(token);
                if (credential) {
                    updateCachedData(credential, DATA_TYPE.CREDENTIALS);
                }
            }
            getLatestCategoryList();
            getLatestPlaceList();

            gapi.load('auth2', function () {
                auth2 = gapi.auth2.init({
                    client_id: GOOGLE_SIGNIN_CLIENTID,
                    scope: 'profile email',
                    fetch_basic_profile: true
                });
            })
        }

        /**
         * Get cached data for given type
         * @param type The data type
         */
        function getCachedData(type) {
            return cachedData[type];
        }

        function updateCachedData(data, type) {
            cachedData[type] = data;
            angular.forEach(dataListeners[type], function (listener) {
                listener(cachedData[type], type);
            });
        }

        /**
         * Subscribe input listener to dataListener list
         * @param listener The target controller
         * @param type The data type
         * @returns {boolean} true if success, otherwise false
         */
        function subscribeToListeners(listener, type) {
            if (DATA_TYPE[type] && dataListeners[type].indexOf(listener) == -1) {
                dataListeners[type].push(listener);
                if (!angular.equals(cachedData[type], [])) {
                    listener(cachedData[type], type);
                }
                return true;
            }
            return false;
        }

        /**
         * Unsubscribe input listener to dataListener list
         * @param listener The target controller
         * @param type The data type
         * @returns {boolean} true if success, otherwise false
         */
        function unsubscribeToListeners(listener, type) {
            if (DATA_TYPE[type]) {
                var index = dataListeners[type].indexOf(listener);
                if (index != -1) {
                    dataListeners[type].splice(index, 1);
                    return true;
                }
            }
            return false;
        }

        function httpPostToServer(data, tokenNeeded) {
            var deferred = $q.defer();
            delete $http.defaults.headers.common.Authorization;
            if (tokenNeeded) {
                var token = loadTokenFromStorage();
                if (validateToken(token)) {
                    $http.defaults.headers.common.Authorization = 'Authorization ' + token;
                }
            }

            $http.post(SERVER_BASE_URL, data)
                .then(
                    function successCallback(response) {
                        deferred.resolve(response.data);
                    },
                    function errorCallbackfunction(response) {
                        // Handle unauthorized
                        if (response.status == 401) {
                            $state.go('login');
                        }
                        if (!response.data || response.status == 500) {
                            deferred.reject(ERROR.UNKNOWN_SERVER_ERROR);
                        } else {
                            deferred.reject(response.data);
                        }
                    });
            return deferred.promise;
        }

        /**
         * Login with netid and password
         * @param netId NetId
         * @param pwd Password
         */
        function loginWithNetId(netId, pwd) {
            httpPostToServer({OPERATION: "LOGIN_NETID", NETID: netId, PWD: pwd}, false)
                .then(function successCallBack(response) {
                        if (typeof response == 'object') {
                            var token = response.jwt;
                            saveTokenToStorage(token);
                            updateCachedData(validateToken(token), DATA_TYPE.CREDENTIALS);
                            getLatestPlaceList();
                            $state.go('table/')
                        } else {
                            alert(ERROR.UNKNOWN_SERVER_ERROR);
                        }
                    }, function errorCallBack(response) {
                        alert(response);
                    }
                );
        }

        /**
         * Login with Google token
         * @param token Token
         */
        function loginWithGoogle(token) {
            httpPostToServer({OPERATION: "LOGIN_GOOGLE", GOOGLE_TOKEN: token}, false)
                .then(function successCallBack(response) {
                        if (typeof response == 'object') {
                            var token = response.jwt;
                            saveTokenToStorage(token);
                            updateCachedData(validateToken(token), DATA_TYPE.CREDENTIALS);
                            getLatestPlaceList();
                            $state.go('table/')
                        } else {
                            alert(ERROR.UNKNOWN_SERVER_ERROR);
                        }
                    }, function errorCallBack(response) {
                        alert(response);
                    }
                );
        }

        /**
         * Parse and check if the current token is expired
         * @param token the token to parse
         * @returns null if failed, otherwise return the credential
         */
        function validateToken(token) {
            if (token) {
                try {
                    var arr = token.split(".");
                    var credential = JSON.parse(atob(arr[1]));
                    if (credential && (credential.exp > new Date().getTime() / 1000)) {
                        return credential
                    } else {
                        removeTokenFromStorage();
                    }
                } catch (err) {
                }
            }
            return null
        }

        // Mark: Local storage utility functions, subject to changes
        function loadTokenFromStorage() {
            return localStorage.getItem(TOKEN_KEY);
        }

        function saveTokenToStorage(token) {
            localStorage.setItem(TOKEN_KEY, token);
        }

        function removeTokenFromStorage() {
            localStorage.removeItem(TOKEN_KEY);
        }

        /**
         * Logout and remove credential storage
         */
        function logout() {
            if (auth2) {
                auth2.signOut().then(function successCallBack() {
                });
            }
            updateCachedData([], DATA_TYPE.CREDENTIALS);
            removeTokenFromStorage();
        }

        /**
         * Get the latest place list information from server and notify listeners
         */
        function getLatestPlaceList() {
            var isAdmin = cachedData[DATA_TYPE.CREDENTIALS].admin_access;
            httpPostToServer({OPERATION: isAdmin ? "GET_PLACE_ADMIN" : "GET_PLACE"}, isAdmin)
                .then(function successCallBack(data) {
                    if (typeof data == 'object') {
                        updateCachedData(data, DATA_TYPE.PLACE_LIST);
                    } else {
                        alert(ERROR.UNKNOWN_SERVER_ERROR);
                    }
                }, function errorCallBack(response) {
                    alert(response);
                })
        }

        /**
         * Get the latest category list information from server and notify listeners
         */
        function getLatestCategoryList() {
            httpPostToServer({OPERATION: "GET_CATEGORY"}, false)
                .then(function successCallBack(data) {
                    if (typeof data == 'object') {
                        var categoryList = {};
                        for (var key in data) {
                            var category = data[key];
                            if (!categoryList[category.category_class]) {
                                categoryList[category.category_class] = [];
                            }
                            categoryList[category.category_class].push(category.category_name);
                        }
                        updateCachedData(categoryList, DATA_TYPE.CATEGORY_LIST);
                    } else {
                        alert(ERROR.UNKNOWN_SERVER_ERROR);
                    }
                }, function errorCallBack(response) {
                    alert(response);
                })

        }

        /**
         * Remove the place both locally and remotely, then notify listeners
         * @param {object} place The place object to delete
         */
        function deletePlace(place) {
            httpPostToServer({OPERATION: "DELETE_PLACE", place_id: place["place_id"]}, true)
                .then(function successCallBack(response) {
                    var index = cachedData[DATA_TYPE.PLACE_LIST].indexOf(place);
                    cachedData[DATA_TYPE.PLACE_LIST].splice(index, 1);
                    updateCachedData(cachedData[DATA_TYPE.PLACE_LIST], DATA_TYPE.PLACE_LIST);
                    alert(response);
                }, function errorCallBack(response) {
                    alert(response);
                });
        }

        /**
         * Add place to remote server and notice it will call getLatestPlaceList()
         * @param place The input form from add new place view
         */
        function addPlace(place) {
            place['OPERATION'] = "ADD_PLACE";
            httpPostToServer(place, true)
                .then(function successCallBack(response) {
                    getLatestPlaceList();
                    alert(response);
                }, function errorCallBack(response) {
                    alert(response);
                });
        }

        /**
         * Update place to remote server and notice it will call getLatestPlaceList()
         * @param place The input form to update place
         */
        function updatePlace(place) {
            place['OPERATION'] = "UPDATE_PLACE";
            httpPostToServer(place, true)
                .then(function successCallBack(response) {
                    getLatestPlaceList();
                    alert(response);
                }, function errorCallBack(response) {
                    alert(response);
                });
        }

        function updatePublishStatus(place, newStatus) {
            httpPostToServer({
                OPERATION: "UPDATE_PUBLISH_STATUS",
                place_id: place["place_id"],
                publish_status: newStatus
            }, true)
                .then(function successCallBack(response) {
                    place["publish_status"] = newStatus;
                    alert(response);
                }, function errorCallBack(response) {
                    place["new_publish_status"] = place["publish_status"];
                    alert(response);
                });
        }
    }
})();


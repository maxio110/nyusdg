/**
 * Created by xiangwang on 11/28/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .service('DataService', DataService);

    DataService.$inject = ['SERVER_BASE_URL', 'DATA_TYPE', '$q', '$http', 'DEBUG', '$state', 'TOKEN_KEY', 'ERROR'];

    /* @ngInject */
    function DataService(SERVER_BASE_URL, DATA_TYPE, $q, $http, DEBUG, $state, TOKEN_KEY, ERROR) {
        var DataService = this;

        DataService.deletePlace = deletePlace;
        DataService.addPlace = addPlace;
        DataService.updatePlace = updatePlace;
        DataService.updatePublishStatus = updatePublishStatus;

        DataService.login = login;
        DataService.logout = logout;

        DataService.getCachedData = getCachedData;
        DataService.getLatestPlaceList = getLatestPlaceList;
        DataService.getLatestCategoryList = getLatestCategoryList;

        DataService.subscribeToListeners = subscribeToListeners;
        DataService.unsubscribeToListeners = unsubscribeToListeners;

        ////////////////
        var cachedData = {};
        var dataListeners = {};
        activate();

        function activate() {
            for (var key in DATA_TYPE) {
                cachedData[DATA_TYPE[key]] = [];
                dataListeners[DATA_TYPE[key]] = [];
            }
            var tokenString = loadTokenStringFromStorage();
            if (tokenString) {
                var token = parseTokenString(loadTokenStringFromStorage());
                if (token) {
                    updateCachedData(token, DATA_TYPE.CREDENTIALS);
                } else {
                    removeTokenStringFromStorage();
                }
            }

            getLatestPlaceList();
            getLatestCategoryList();
            // login("xw1173", "Wpb637611!!");
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
                if (DEBUG) console.log("Listener <" + listener.title + "> subscribed to " + type + " listeners");
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
                    if (DEBUG) console.log("Listener <" + listener.title + "> unsubscribed to data listeners");
                    return true;
                }
            }
            return false;
        }

        function httpPostToServer(data, tokenNeeded) {
            var deferred = $q.defer();
            delete $http.defaults.headers.common.Authorization;
            if (tokenNeeded) {
                var tokenString = loadTokenStringFromStorage();
                if (tokenString && validateToken(parseTokenString(tokenString))) {
                    $http.defaults.headers.common.Authorization = 'Bearer ' + tokenString;
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
         * Login with username and password
         * @param username Username
         * @param pwd Password
         * @returns {Promise}
         */
        function login(username, pwd) {
            httpPostToServer({OPERATION: "LOGIN", USERNAME: username, PWD: pwd}, false)
                .then(function (successResponse) {
                        if (typeof successResponse == 'object') {
                            var token = parseTokenString(successResponse.jwt);
                            saveTokenStringToStorage(successResponse.jwt);
                            updateCachedData(token, DATA_TYPE.CREDENTIALS);
                            getLatestPlaceList();
                            $state.go('table/')
                        } else {
                            alert(successResponse);
                        }
                    }, function (errorResponse) {
                        alert(errorResponse);
                    }
                );
        }

        /**
         * Check if the current token is expired
         */
        function validateToken(token) {
            return token && (token.exp > new Date().getTime() / 1000);
        }

        function parseTokenString(tokenString) {
            try {
                var arr = tokenString.split(".");
                var token = JSON.parse(atob(arr[1]));
                if (validateToken(token)) {
                    return token;
                } else {
                    return null;
                }
            } catch (err) {
                return null;
            }
        }

        // Mark: Local storage utility functions, subject to changes
        function loadTokenStringFromStorage() {
            return localStorage.getItem(TOKEN_KEY);
        }

        function saveTokenStringToStorage(tokenString) {
            localStorage.setItem(TOKEN_KEY, tokenString);
        }

        function removeTokenStringFromStorage() {
            localStorage.removeItem(TOKEN_KEY);
        }

        /**
         * Logout and return the promise
         * @returns {Promise}
         */
        function logout() {
            updateCachedData([], DATA_TYPE.CREDENTIALS);
            removeTokenStringFromStorage();
        }

        /**
         * Get the latest place list information from server and notify listeners
         */
        function getLatestPlaceList() {
            var isAdmin = cachedData[DATA_TYPE.CREDENTIALS].admin_access;
            httpPostToServer({OPERATION: isAdmin ? "GET_PLACE_ADMIN" : "GET_PLACE"}, isAdmin)
                .then(function (data) {
                    if (typeof data == 'object') {
                        updateCachedData(data, DATA_TYPE.PLACE_LIST);
                    } else {
                        alert(data);
                    }
                }, function (errorResponse) {
                    alert(errorResponse);
                })
        }

        /**
         * Get the latest category list information from server and notify listeners
         */
        function getLatestCategoryList() {
            httpPostToServer({OPERATION: "GET_CATEGORY"}, false)
                .then(function (data) {
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
                        alert(data);
                    }
                }, function (errorResponse) {
                    alert(errorResponse);
                })

        }

        /**
         * Remove the place both locally and remotely, then notify listeners
         * @param {object} place The place object to delete
         */
        function deletePlace(place) {
            httpPostToServer({OPERATION: "DELETE_PLACE", place_id: place["place_id"]}, true)
                .then(function (successResponse) {
                    var index = cachedData[DATA_TYPE.PLACE_LIST].indexOf(place);
                    cachedData[DATA_TYPE.PLACE_LIST].splice(index, 1);
                    updateCachedData(cachedData[DATA_TYPE.PLACE_LIST], DATA_TYPE.PLACE_LIST);
                    alert(successResponse);
                }, function (errorResponse) {
                    alert(errorResponse);
                });
        }

        /**
         * Add place to remote server and notice it will call getLatestPlaceList()
         * @param place The input form from add new place view
         */
        function addPlace(place) {
            place['OPERATION'] = "ADD_PLACE";
            httpPostToServer(place, true)
                .then(function (successResponse) {
                    getLatestPlaceList();
                    alert(successResponse);
                }, function (errorResponse) {
                    alert(errorResponse);
                });
        }

        /**
         * Update place to remote server and notice it will call getLatestPlaceList()
         * @param place The input form to update place
         */
        function updatePlace(place) {
            place['OPERATION'] = "UPDATE_PLACE";
            httpPostToServer(place, true)
                .then(function (successResponse) {
                    getLatestPlaceList();
                    alert(successResponse);
                }, function (errorResponse) {
                    alert(errorResponse);
                });
        }

        function updatePublishStatus(place, newStatus) {
            httpPostToServer({
                OPERATION: "UPDATE_PUBLISH_STATUS",
                place_id: place["place_id"],
                publish_status: newStatus
            }, true)
                .then(function (successResponse) {
                    place["publish_status"] = newStatus;
                    alert(successResponse);
                }, function (errorResponse) {
                    place["new_publish_status"] = place["publish_status"];
                    alert(errorResponse);
                });
        }
    }
})();


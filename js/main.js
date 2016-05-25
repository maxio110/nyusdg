var errSwitch = function (status) {
    switch (status) {
        case '1' :
            return "Please Login";
            break;
        default:
            return "Sorry, some undefined error occurred";
    }
};
var GEO_NOT_ALLOWED = "Geolocation is not supported or allowed by user";
var EMPTY_FIELD = "Some fields are empty in the form: ";
var vHeight = $(window).height(),
    vWidth = $(window).width();
var app = angular.module("NYUsdg", ['angularUtils.directives.dirPagination', 'smoothScroll', 'ngRoute']);

app.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('template/dirPagination.tpl.html');
});

app.config(function ($routeProvider) {
    $routeProvider

    // route for the home page
        .when('/', {
            templateUrl: 'template/main.html',
            controller: 'MainController'
        })
        .when('/map/:idfilter', {
            templateUrl: 'template/map.html',
            controller: 'MapController'
        })
        .when('/map', {
            templateUrl: 'template/map.html',
            controller: 'MapController'
        })
        .otherwise({redirectTo: '/'});
});


app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
// MainController
app.controller("MainController",
    function ($scope, $http) {

        var cover = $('.cover');
        cover.css({"height": vHeight, "width": vWidth});
        var http_GET = 'GET';
        var url = 'http://104.131.39.117:7003/';
        //var url = 'http://localhost:7003/';
        var categories = [
            {
                name: "Fashion",
                barber: "Barber",
                cloth: "Cloth",
                shoes: "Shoes",
                beauty: "Beauty"
            },
            {
                name: "Food&Drink",
                restaurant: "Restaurant",
                foodtruck: "FoodTruck",
                bar: "Bar!",
                drink: "Drink"
            },
            {
                name: "Entertainment",
                museum: "Museum",
                cinema: "Cinema"
            },
            {
                name: "Stores",
                gift: "Gift",
                game: "Game",
                supermarket: "Supermarket"
            }

        ];
        var input_Dic = {
            name: "Store Name",
            category: "Category",
            discount: "Discount Given",
            requirement: "Requirements",
            info: "Additional Requirements",
            web: "Web",
            logo: "Logo Url",
            location: "Address",
            phone: "Phone",
            lng: "Longitude",
            lat: "Latitude"
        };
        $scope.categories = categories;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.pagination = {
            current: 1
        };

        // Initilize content using get
        $http({method: http_GET, url: url + 'data/'}).then(function (response) {
            $scope.data = response.data;
            $scope.form = $scope.data[0];
            $scope.form.phone = '1234';
            $scope.form.location = 'test';
        }, function (response) {
            alert(errSwitch(response.data));
        });

        // Same as above but you can assign function to buttons -> ng-click="get()"
        $scope.get = function () {
            $http({method: http_GET, url: url + 'data/'}).then(function (response) {
                $scope.data = response.data;
            }, function (response) {
                alert(errSwitch(response.data));
            });
        };

        // Classify information using category field -> ng-click="classify(xxx)"
        $scope.classify = function (classifier) {
            $scope.classifier = classifier;
        };

        // Remove information using its MongoDB "id" field -> ng-click="remove(xxx)"
        $scope.remove = function (id) {
            //alert(id);
            $http.delete(url + 'data/' + id).then(function (response) {
                if (response.data.length == 1) {
                    alert(errSwitch(response.data));
                }
                else {
                    $scope.data = response.data;
                }
            }, function (response) {
                alert(errSwitch(response.data));
            });
        };


        // Inside data are in JSON format : {name : xxx}
        $scope.addNew = function (form) {
            var emptyArr = [];
            var judge = true;
            if (!form) {
                judge = false;
                for (var key in input_Dic) {
                    emptyArr.push(input_Dic[key]);
                }
            }
            else {
                for (var key in input_Dic) {
                    if (!form[key]) {
                        emptyArr.push(input_Dic[key]);
                        judge = false;
                    }
                }
            }
            if (judge) {
                $http.post(url + 'data/', form).then(function (response) {
                    if (response.data == '1') {
                        alert('Please login');
                    }
                    else {
                        $scope.data = response.data;
                    }
                }, function (response) {
                    alert(errSwitch(response.data));
                });
            }
            else {
                alert(EMPTY_FIELD + emptyArr);
            }

        };

        // Login function -> ng-click="login()"
        $scope.login = function () {
            var tmp = $scope.form;
            $http.post(url + 'login/', tmp).then(function (response) {
                alert(response.data);
                //$location.path('/');
            }, function (response) {
                alert(errSwitch(response.data));
            });
        };

        //To certain map mark
        $scope.toMap = function (id) {
            window.location = ('#/map/' + id);
        };

        $scope.toggle = function (s) {
            window.location.replace(s);
        };

        $scope.setCurPos = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    $scope.input_lat = pos.coords.latitude;
                    $scope.input_lng = pos.coords.longitude;
                });
            }
            else {
                alert(GEO_NOT_ALLOWED);
            }
        }

    });

// MapController
app.controller('MapController', function ($scope, $controller, $routeParams) {
    //$controller('MainController', {$scope: $scope}); //This works
    var idfilter = $routeParams.idfilter;
    var map;
    var myCenter;
    var nyuCenter;
    var infowindow;
    var centermarker;
    var markerMap = {};

    function initialize() {

        var mapcover = $('.mapcover');
        mapcover.css({"height": 0.85 * vHeight, "width": 0.9 * vWidth});

        nyuCenter = new google.maps.LatLng(40.731104, -73.994007);
        myCenter = nyuCenter;
        var mapProp = {
            center: myCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: true
        };

        map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
        var image = {
            url: 'images/bluebubble.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(64, 64),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32),
            scaledSize: new google.maps.Size(45, 45)
        };
        //Center Marker
        centermarker = new google.maps.Marker({
            position: myCenter,
            icon: image
        });
        centermarker.setMap(map);


        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
                myCenter = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                if (!idfilter) {
                    map.panTo(myCenter);
                    centermarker.setPosition(myCenter);
                }
            });
            navigator.geolocation.watchPosition(function (pos) {

                myCenter = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                centermarker.setPosition(myCenter);

                //centermarker.setMap(map);
            });
        }

        else {
            alert(GEO_NOT_ALLOWED);
        }

        for (var i in $scope.data) {
            var tmp = $scope.data[i];
            //alert(tmp.category+"|||"+$scope.classifier);
            //if ($scope.classifier && tmp.category != $scope.classifier) {
            //    continue;
            //}
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(tmp.lat, tmp.lng),
                data: tmp,
                icon: 'images/map/' + tmp.category + '.png'
            });

            marker.setMap(map);

            google.maps.event.addListener(marker, 'click', function () {
                if (infowindow) {
                    infowindow.close();
                }
                map.setZoom(17);
                map.panTo(this.getPosition());

                infowindow = new google.maps.InfoWindow({
                    content: '<div id="iw-container">' +
                    '<div class="iw-title"><a href="' + this.data.web + '">' + this.data.name + '</a></div>' +
                    '<div class="iw-content">' +

                    '<img src="' + (this.data.logo ? this.data.logo : 'images/noimage.jpg') + '" alt="Porcelain Factory of Vista Alegre" height="80" width="80">' +
                    '<p><strong>Discount : </strong> <a>' + this.data.discount + '</a></p>' +
                    '<p><strong>Require : </strong> ' + this.data.requirement + '</p>' +
                    '<p><strong>Note : </strong> ' + this.data.info + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>',
                    maxWidth: 300
                });

                infowindow.open(map, this);
            });
            google.maps.event.addListener(marker, 'visible_changed', function () {
                //alert(""+$scope.classifier);
            });
            markerMap[marker.data._id] = marker;
        }
        google.maps.event.addListener(map, 'click', function () {
            infowindow.close();
        });
    }

    initialize();
    $scope.initmap = function () {
        for (var key in markerMap) {
            if ($scope.classifier && (markerMap[key].data.category != $scope.classifier)) {
                markerMap[key].setVisible(false);
            }
            else {
                markerMap[key].setVisible(true);
            }
        }
    };

    $scope.set_nyu = function () {
        map.panTo(nyuCenter);
        map.setZoom(15);
    };
    $scope.set_user = function () {
        map.panTo(myCenter);
        map.setZoom(15);
    };
    if (idfilter) {
        google.maps.event.trigger(markerMap[idfilter], 'click');
    }
    google.maps.event.addDomListener(window, 'load', initialize);

});


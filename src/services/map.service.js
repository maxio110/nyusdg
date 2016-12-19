/**
 * Created by xiangwang on 12/9/16.
 */
(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .service('MapService', MapService);

    MapService.$inject = ['NYU_CENTER', 'WINDOW_SIZE'];

    /* @ngInject */
    function MapService(NYU_CENTER, WINDOW_SIZE) {
        var MapService = this;
        var centerData = {
            nyuCenter: {
                pos: new google.maps.LatLng(NYU_CENTER.latitude, NYU_CENTER.longitude),
                name: "NYU Center"
            },

            userCenter: {
                pos: new google.maps.LatLng(NYU_CENTER.latitude, NYU_CENTER.longitude),
                name: "User Center"
            }
        };

        MapService.centerData = centerData;

        MapService.initMap = initMap;
        MapService.initPlaceMarkers = initPlaceMarkers;

        MapService.filterPlaceMarkers = filterPlaceMarkers;
        MapService.setCenter = setCenter;
        MapService.updateUserPosition = updateUserPosition;
        MapService.triggerMarker = triggerMarker;

        ////////////////
        var cached_map;
        var infoWindow;
        var markerMap = {};
        var userMarker;

        function initMap() {
            if (!cached_map) {
                var mapCover = angular.element(document.getElementById("google-map"))[0];
                mapCover.style.height = 0.85 * WINDOW_SIZE.height + "px";
                mapCover.style.width = 0.9 * WINDOW_SIZE.width + "px";
                var mapProp = {
                    center: centerData.nyuCenter.pos,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scaleControl: true
                };
                cached_map = new google.maps.Map(document.getElementById("google-map"), mapProp);
                // User marker
                var userImage = {
                    url: 'images/bluebubble.png', // This marker is 20 pixels wide by 32 pixels high.
                    size: new google.maps.Size(64, 64), // The origin for this image is (0, 0).
                    origin: new google.maps.Point(0, 0), // The anchor for this image is the base of the flagpole at (0, 32).
                    anchor: new google.maps.Point(0, 32), scaledSize: new google.maps.Size(45, 45)
                };
                userMarker = new google.maps.Marker({
                    position: centerData.userCenter.pos, icon: userImage
                });
                userMarker.setMap(cached_map);
                google.maps.event.addListener(cached_map, 'click', function () {
                    if (infoWindow != null) {
                        infoWindow.close();
                    }
                });
            }
        }

        function initPlaceMarkers(placeList) {
            for (var id in markerMap) {
                markerMap[id].setMap(null);
            }
            for (var i in placeList) {
                var place = placeList[i];
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(parseFloat(place.latitude), parseFloat(place.longitude)),
                    data: place,
                    icon: 'images/map/' + place.category + '.png'
                });
                marker.setMap(cached_map);
                google.maps.event.addListener(marker, 'click', function () {
                    if (infoWindow) {
                        infoWindow.close();
                    }
                    cached_map.setZoom(17);
                    cached_map.panTo(this.getPosition());
                    infoWindow = new google.maps.InfoWindow({
                        content: ''
                        + '<div id="iw-container">'
                        + '     <div class="iw-title">'
                        + '         <a href="#/table/' + this.data.place_id + '">' + this.data.place_name + '</a>'
                        + '     </div>'
                        + '     <div class="iw-content">'
                        + '         <img src="' + (this.data.logo_url ? this.data.logo_url : 'images/noimage.jpg') + '" alt="Logo" height="80" width="80">'
                        + '         <p><strong>Discount : </strong> <a>' + this.data.discount_percent + '</a></p>'
                        + '         <p><strong>Require : </strong> ' + this.data.discount_detail + '</p>'
                        + '         <p><strong>Category : </strong> ' + this.data.category + '</p>'
                        + '         <p><strong>Address : </strong> ' + this.data.address + '</p>'
                        + (this.data.google_place_url ? ('<p><a href="' + this.data.google_place_url + '" target="_blank">To Google Place</a></p>'):'')
                        + (this.data.web_url ? ('<p><a href="' + this.data.web_url + '" target="_blank">To Website</a></p>'):'')
                        + '     </div>'

                        + '</div>',
                        maxWidth: 1000
                    });
                    infoWindow.open(cached_map, this);
                });
                google.maps.event.addListener(marker, 'visible_changed', function () {
                });
                markerMap[marker.data.place_id] = marker;
            }
        }

        function triggerMarker(idFilter) {
            if (markerMap[idFilter]) {
                google.maps.event.trigger(markerMap[idFilter], 'click');
            }
        }

        function filterPlaceMarkers(categoryFilter, searchFilter) {
            for (var key in markerMap) {
                if (
                    (categoryFilter && (markerMap[key].data.category != categoryFilter))
                    || (searchFilter && (JSON.stringify(markerMap[key].data).indexOf(searchFilter) == -1))
                ) {
                    markerMap[key].setVisible(false);
                } else {
                    markerMap[key].setVisible(true);
                }
            }
        }

        function setCenter(centerPosistion) {
            cached_map.panTo(centerPosistion);
            cached_map.setZoom(15);
        }

        function updateUserPosition(pos) {
            centerData.userCenter.pos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            userMarker.setPosition(centerData.userCenter.pos);
        }
    }

})();


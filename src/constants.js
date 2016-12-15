/**
 * Created by xiangwang on 11/28/16.
 */

(function () {
    'use strict';

    angular
        .module('studentDiscount')
        .constant("WINDOW_SIZE", {
            height: window.innerHeight,
            width: window.innerWidth
        })
        .constant("ERROR", {
            GEO_NOT_ALLOWED: "Geolocation is not supported or allowed by user",
            UNKNOWN_SERVER_ERROR: "Unknown server error, maybe corrupted data received"
        })
        .constant("SERVER_BASE_URL", "server/process.php")
        //  For Base64 encoding service
        .constant("PLACE_INPUT_REQUIRED_DIC", {
            place_name: "Store Name",
            category: "Category",
            discount_percent: "Discount Given",
            discount_detail: "Requirements",
            // information: "Place Information",
            // web_url: "Web",
            // logo_url: "Logo Url",
            address: "Address",
            // phone: "Phone",
            longitude: "Longitude",
            latitude: "Latitude"
            // google_place_id: "google_place_id"
        })
        .constant("PLACE_INPUT_GOOGLE_DIC", { // Location not handled
            place_name: "name",
            web_url: "website",
            logo_url: "icon",
            address: "vicinity",
            phone: "formatted_phone_number",
            google_place_id: "place_id",
            google_place_url: "url"
        })
        .constant("DEBUG", true)
        .constant("NYU_CENTER", {latitude: 40.731104, longitude: -73.994007})
        .constant("DATA_TYPE", {
            PLACE_LIST: "PLACE_LIST",
            CATEGORY_LIST: "CATEGORY_LIST",
            CREDENTIALS: "CREDENTIALS"
        })
        .constant("TOKEN_KEY", "NYU_STUDENT_DISCOUNT_TOKEN")

})();

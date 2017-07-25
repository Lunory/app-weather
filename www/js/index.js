/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        this.renderCities();
        var geoBtn = document.querySelector('[data-option="geo"]');
        var favoriteBtn = document.querySelector('[data-option="favorite"]');
        var cities = document.querySelectorAll('.table-cities .table-view-cell');

        geoBtn.addEventListener(
            'click',
            this.getPositionGeolocation.bind(this)
        )
        geoBtn.click();

        favoriteBtn.addEventListener(
            'click',
            this.getPositionFromStorage.bind(this)
        )

        for (var i = 0; i < cities.length; i++) {
            cities[i].addEventListener(
                'click',
                this.setFavorite.bind(this)
            )
        }

    },

    cityList: [
        {'key': 'moscow', 'name': 'Москва', 'position': {'lat': 55.75222, 'lon': 37.61556}},
        {'key': 'ba','name': 'Буэнос-Айрес', 'position': {'lat': -34.6156541, 'lon': -58.5734073}},
        {'key': 'amst', 'name': 'Амстердам', 'position': {'lat': 52.37403, 'lon': 4.88969}},
        {'key': 'kas', 'name': 'Касабланка', 'position': {'lat': 33.58831, 'lon': -7.61138}}
    ],

    setFavorite: function(event) {
        event.preventDefault();

        document.querySelector('#myModalexample').classList.remove('active');

        var key = event.currentTarget.dataset.option;

        for (var i = 0; i < this.cityList.length; i++) {
            if (this.cityList[i].key === key) {
                NativeStorage.setItem('favorite', this.cityList[i].position, setSuccess);
            }
        }

        function setSuccess() {
            document.querySelector('[data-option="favorite"]').click();
        }
    },

    getPositionGeolocation: function(event) {
        event.preventDefault();
        var self = this;
        var target = event.currentTarget;
        var favoriteBtn = document.querySelector('[data-option="favorite"]');

        navigator.geolocation.getCurrentPosition(onSuccess, onFail);

        function onSuccess(position) {
            position = {
                'lat': position.coords.latitude,
                'lon': position.coords.longitude
            };
            self.getWeather(position);
            target.classList.add('active');
            favoriteBtn.classList.remove('active');
        }

        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    },

    getPositionFromStorage: function(event) {
        event.preventDefault();

        var self = this;
        var target = event.currentTarget;
        var geoBtn = document.querySelector('[data-option="geo"]');

        NativeStorage.getItem('favorite', getSuccess, getFail);

        function getSuccess(obj) {
            self.getWeather(obj);
            target.classList.add('active');
            geoBtn.classList.remove('active');
        }

        function getFail() {
            alert('Добавьте город в избранное');
        }

    },

    getWeather: function(position) {
        var self = this;

        if (navigator.connection.type === 'none') {
            alert("Нет подключения к сети");
        }

        var x = new XMLHttpRequest();
        x.open("GET", `https://api.darksky.net/forecast/375063b5d2b4f31f222103403b8733f7/${position.lat},${position.lon}?units=si&lang=ru`);
        x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        x.send();
        x.onload = function() {
            var dataWeather = JSON.parse(this.responseText);
            self.renderWeather(dataWeather);
        };

        x.onerror = function() {
            console.log('Error send: ' + this.status);
        };
    },

    getTime: function(dataWeather) {
        var time = new Date(dataWeather.currently.time * 1000);
        var time = new Date(
            dataWeather.currently.time * 1000 +
            time.getTimezoneOffset() * 60000 +
            dataWeather.offset * 3600000
        );

        return time;
    },

    renderWeather: function(dataWeather) {
        var dateNow = this.getTime(dataWeather);

        document.querySelector('.name-town').innerHTML = dataWeather.timezone.replace('/', '\n')
        document.querySelector('.weather-description').innerHTML = dataWeather.currently.summary;
        document.querySelector('.weather-temp').innerHTML = Math.round(dataWeather.currently.temperature) + '&#176;';
        document.querySelector('.info-day').innerText = 'Сегодня ' + dateNow.getDate();
        var weatherDaily = document.querySelector('.weather-daily');
        var dayNow = dateNow.getDate();

        var inner = '';

        for (var i = 1; i < 8; i++) {
            dayNow++;
            inner += '<li class="table-view-cell">' +
                '<span>' + dayNow + '</span>' +
                '<img src="img/' + dataWeather.daily.data[i].icon + '.svg">' +
                '<span>' + Math.round(dataWeather.daily.data[i].temperatureMin) + '&#176; - ' +
                    + Math.round(dataWeather.daily.data[i].temperatureMax) + '&#176;' +
                '</span>' +
            '</li>';
        }

        weatherDaily.innerHTML = inner;
    },

    renderCities: function() {
        var container = document.querySelector('.table-cities');

        for (var i = 0; i < this.cityList.length; i++) {
            container.innerHTML +=
                '<li class="table-view-cell" data-option="' + this.cityList[i].key + '">' +
                    this.cityList[i].name +
                '</li>';
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:none;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

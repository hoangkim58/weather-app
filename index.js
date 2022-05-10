
const API = 'daa0212fbd13a05d0ba5bc59cfd50f8a'

// components that need to be rendered
const inputCity = $('.app_header-search-input')
const DEFAULT_VALUE = '--'
const position = $('.app_main-position')
const weatherIcon = $('.app_main-conditions-icon')
const condition = $('.app_main-conditions')
const temperature = $('.app_main-temperature')
const microphone = $('.microphone')
const sunrise = $('.sunrise')
const sunset = $('.sunset')
const humidity = $('.humidity')
const windSpeed = $('.wind-speed')
const mapContainer = $('.map.container')
const mapContent = $('#map')

//map input 
let latMap = ''
let lonMap = ''

// method used time format  
const convertTime = (time) => {
    const timeStr = new Date(time * 1000).toString()
    const timeArr = timeStr.split(' ')

    return timeArr[4]
}

const renderContent = (data) => {

    position.html(data.name || DEFAULT_VALUE)
    condition.html(data.weather[0].description || DEFAULT_VALUE)
    temperature.html(data.main.temp || DEFAULT_VALUE)
    sunrise.html(convertTime(data.sys.sunrise) || DEFAULT_VALUE)
    sunset.html(convertTime(data.sys.sunset) || DEFAULT_VALUE)
    humidity.html(data.main.humidity || DEFAULT_VALUE)
    windSpeed.html(data.wind.speed || DEFAULT_VALUE)
    weatherIcon.attr('src', ` http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)

}

inputCity.change((e) => {

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${e.target.value}&appid=${API}&lang=vi&units=metric`)
        .then(async res => {
            const data = await res.json()
            console.log(data);
            //reset input
            e.target.value = ''
            inputCity.focus()

            if (data.cod == 404) {

                renderContent()
                return
            }

            // render information
            renderContent(data)
            // asssignment
            latMap = data.coord.lat
            lonMap = data.coord.lon

            // check map existence
            var container = L.DomUtil.get('map');
            if (container != null) {
                container._leaflet_id = null;
            }

            //
            var accessToken = 'pk.eyJ1IjoiaGtpbTU4OCIsImEiOiJjbDMwN2ZldnMwMHVlM2NvMm1kcWw3am10In0.L0Tywl3fahbhNvK6MY3EDw'

            var map = L.map('map').setView([latMap, lonMap], 11);

            var config = L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
                attribution: `${data.name} | ${data.sys.country}`,
                maxZoom: 30,
                minZoom: 4,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'your.mapbox.access.token',
            })

            config.addTo(map);

            // insert icon check-in at the selected position
            var marker = L.marker([latMap, lonMap]).addTo(map);
            marker.bindPopup("The place you choose").openPopup();

            return
        })

})

// virtual assistance
microphone.click(() => {
    console.log('listning... ')
})

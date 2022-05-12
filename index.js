
const API = 'daa0212fbd13a05d0ba5bc59cfd50f8a'

// components that need to be rendered
const app = $('.app')
const inputCity = $('.app_header-search-input')
const DEFAULT_VALUE = '--'
const position = $('.app_main-position')
const weatherIcon = $('.app_main-conditions-icon')
const condition = $('.app_main-conditions')
const temperature = $('.app_main-temperature')
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

//print weather conditions
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

//handle data and show location on map
const handleData = (position) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${position}&appid=${API}&lang=vi&units=metric`)
        .then(async res => {
            const data = await res.json()
            console.log(data);
            //reset input


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

}

inputCity.change((e) => {

    const value = e.target.value
    const lowerCaseStr = value.toLowerCase()
    const currentTime = hour + ' : ' + minute
    const voiceResponse = hour + 'hour' + minute + 'minute'
    const currentTimeStr = new SpeechSynthesisUtterance(voiceResponse);

    if (lowerCaseStr == 'mấy giờ' || lowerCaseStr == 'may gio') {

        clockContainer.attr('style', 'display: flex !important;')
        time.html(currentTime)

        synth.speak(currentTimeStr)

        setTimeout(() => {
            clockContainer.removeAttr('style')
        }, 3000);

        return
    } else {
        handleData(value)

    }

    inputCity.focus()

    return

})

inputCity.click((e) => {
    e.target.value = ''
})

///////////////////////////
// virtual assistance 
const microphone = document.querySelector('.microphone')
const searchInput = $('.app_header-search-input')
const clockContainer = $('.clock-container')
const time = $('.time')

const requestBackground = ['sáng', 'tối', 'mặc định']
const backgroundColor = ['#fff', '#333', '#3498DB']

const hour = new Date().getHours()
const minute = new Date().getMinutes()

const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;
// set config 
recognition.lang = 'vi-VI';
recognition.continuous = false;


let commandStr = ''

// get position from voice message
const getPosition = (str) => {
    const arr = str.split('tại')
    const result = arr[1].trim()
    console.log(result);
    return result
}

const getColor = (str) => {
    const arr = str.split('màu nền')
    const request = arr[1].trim()
    const index = requestBackground.indexOf(request)
    return backgroundColor[index]
}

const errorVoiceMessage = () => {
    const voiceResponse = 'Try again'
    const currentTimeStr = new SpeechSynthesisUtterance(voiceResponse);

    synth.speak(currentTimeStr)

}

// start Recognition
microphone.addEventListener('click', (e) => {
    e.preventDefault
    searchInput.val('')
    recognition.start();
    microphone.classList.add('microphone--listening')
    console.log('Listening...');

})

// stop Recognition
recognition.onspeechend = function () {
    recognition.stop();
    microphone.classList.remove('microphone--listening')
    console.log('end...');
}

recognition.onerror = (err) => {

    microphone.classList.remove('microphone--listening')
    errorVoiceMessage()
    console.error(err);
}



recognition.onresult = (e) => {

    commandStr = e.results[0][0].transcript
    const requestStr = commandStr.toLowerCase()

    var isRequestWeatherForecast = requestStr.includes('thời tiết')
    var isRequestBackgroundColor = requestStr.includes('màu nền')
    var isRequestPresentTime = requestStr.includes('mấy giờ')

    // enter content of voice message to show
    searchInput.val(commandStr)

    console.log('voice: ', requestStr);
    //
    if (isRequestWeatherForecast) {
        const position = getPosition(requestStr)
        handleData(position)

        return
    }

    //
    if (isRequestBackgroundColor) {
        const color = getColor(requestStr)

        if (color == '#fff') {
            app.attr('style', `background-color: ${color}; color: #333 `)
        } else {
            app.attr('style', `background-color: ${color}; color: #fff `)
        }
        console.log(color);

        return
    }

    //show current time 
    if (isRequestPresentTime) {
        const currentTime = hour + ' : ' + minute
        const voiceResponse = hour + 'hour' + minute + 'minute'
        const currentTimeStr = new SpeechSynthesisUtterance(voiceResponse);

        clockContainer.attr('style', 'display: flex !important;')
        time.html(currentTime)

        synth.speak(currentTimeStr)

        setTimeout(() => {
            clockContainer.removeAttr('style')
        }, 3000);

        return
    }

    // Error message
    errorVoiceMessage()

    return
}

// login
const loginBtn = $('.btn-login')
const loginFb = $('#fb-root')
const loginContainer = $('.login-container')


loginBtn.click(() => {
    loginContainer.attr('style', 'display: flex')
})

loginContainer.click(() => {
    loginContainer.attr('style', 'display: none')
})

loginFb.click(function( event ) {
    event.stopPropagation();
    // Do something
  });

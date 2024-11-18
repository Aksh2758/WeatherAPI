const apiKey = 'API_KEY'; 

let map; // Declare map variable globally
let marker; // To hold the marker on the map

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    console.log("API URL:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);
        displayWeather(data);
    } catch (error) {
        console.error('Failed to fetch the weather data', error);
        alert('Failed to fetch weather data.');
        const weatherDisplay = document.getElementById('weatherDisplay');
        weatherDisplay.innerHTML = `<p style="color: red;">Error: ${error.message}. Please enter a valid city name.</p>`;
        weatherDisplay.style.display = "block";

        document.getElementById('map').style.display = "none";
    }
}

function displayWeather(data) {
    const { coord: { lat, lon }, main: { temp, humidity }, weather, wind: { speed }, sys,  name } = data;
    const [{ main: weatherMain, description, icon }] = weather;

    const country = sys && sys.country ? sys.country : 'Unknown';

    const weatherDisplay = document.getElementById('weatherDisplay');
    if (data.cod !== 200) {
        weatherDisplay.innerHTML = `<p>Error: ${data.message}</p>`;
        weatherDisplay.style.display = "block";
        document.getElementById('map').style.display = "none";
        return;
    }
    if (weatherMain !== "Rain") {
        stopRainEffect();
    }
    if (weatherMain === "Clear") {
        document.body.style.background = 'linear-gradient(to right, rgba(135, 206, 235, 0.7), rgba(255, 255, 255, 0.7))'; // Clear
    } else if (weatherMain === "Clouds") {
        document.body.style.background = 'linear-gradient(to right, rgba(192, 192, 192, 0.7), rgba(255, 255, 255, 0.7))'; // Cloudy
    } else if (weatherMain === "Rain") {
        addRainEffect();
        document.body.style.background = 'linear-gradient(to right, rgba(0, 0, 139, 0.7), rgba(173, 216, 230, 0.7))';  // Rainy
    } else if (weatherMain === "Snow") {
        document.body.style.background = 'linear-gradient(to right, rgba(255, 250, 250, 0.7), rgba(173, 216, 230, 0.7))'; // Snowy
    } else if (weatherMain === "Haze") {
        document.body.style.background = 'linear-gradient(to right, rgba(169, 169, 169, 0.7), rgba(211, 211, 211, 0.7))'; // Hazy
    }else {
        document.body.style.background = 'linear-gradient(to right, rgba(0, 0, 255, 0.7), rgba(173, 216, 230, 0.7))'; // Cold
    }


    const weatherHTML = `
        <h2>Weather in ${name}, ${country}</h2>
        <p>Temperature: ${temp} °C</p>
        <p>Weather: ${weatherMain} (${description})</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind: ${speed} m/s</p>
        <img src="https://openweathermap.org/img/w/${icon}.png" alt="Weather icon">
    `;
    weatherDisplay.innerHTML = weatherHTML;
    weatherDisplay.style.display = "block";

    initMap(lat, lon, name, country);
}

function addRainEffect() {
    let rainContainer = document.querySelector('.rain');

    // Remove any existing rain effect before adding new raindrops
    if (rainContainer) {
        rainContainer.remove();
    }
    
    rainContainer = document.createElement('div');
    rainContainer.classList.add('rain');
    document.body.appendChild(rainContainer);

    // Create multiple raindrops
    for (let i = 0; i < 100; i++) {
        let drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${Math.random() * 2 + 1.5}s`; // Vary the speed of drops
        drop.style.animationDelay = `${Math.random() * 1.5}s`; // Delay for staggered effect
        rainContainer.appendChild(drop);
    }
    
}
function stopRainEffect() {
    let rainContainer = document.querySelector('.rain');
    if (rainContainer) {
        rainContainer.remove(); // Remove the rain container to stop the rain effect
    }
}

function initMap(lat, lon, name, country='Unknown') {
    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block'; // Make the map container visible

    if (!map) {
        // Initialize the map if it doesn't exist
        map = L.map('map').setView([lat, lon], 10);

        // Add the tile layer (OpenStreetMap tiles)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        // If map already exists, just set the new view
        map.setView([lat, lon], 10);
    }

    if (marker) {
        // Remove existing marker
        map.removeLayer(marker);
    }

    // Add a marker at the location
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${name}, ${country}</b>`).openPopup();
}



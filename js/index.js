// Creating the map object
const map = L.map('map')

// Jawg_Dark Map Style
const tileUrl = 'https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=SzrSvA5Rb0Pewv0YPkhpOftwqAJZTFJApRlriSuJRXroUWg0uD3nhJxtNvc1ahWF'
const attribution = '<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors';

const tiles = L.tileLayer(tileUrl, { attribution, minZoom: 2, maxZoom: 22, accessToken: 'SzrSvA5Rb0Pewv0YPkhpOftwqAJZTFJApRlriSuJRXroUWg0uD3nhJxtNvc1ahWF' });
tiles.addTo(map);

// Day night overlay on the map
const terminator = L.terminator({fillOpacity: "0.2"});
terminator.addTo(map);

function updateTerminator(terminator) {
    terminator.setTime();
}

setInterval(function(){updateTerminator(terminator)}, 10000);

// Creating and customizing the marker
const issMarker = L.icon({
    iconUrl: './img/marker.png',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
});

const marker = L.marker([0, 0], {icon: issMarker}).addTo(map);


// Fetching JSON data from the api
const location_api_url = 'https://api.wheretheiss.at/v1/satellites/25544';

let firstTime = true;

async function getISSData() {
    const response = await fetch(location_api_url);
    const data = await response.json();
    const { latitude, longitude, altitude, velocity, visibility } = data;

    marker.setLatLng([latitude, longitude]);
    if (firstTime) {
        map.setView([latitude, longitude], 3);
        firstTime = false;
    }

    document.getElementById('latitude').textContent = latitude.toFixed(4);
    document.getElementById('longitude').textContent = longitude.toFixed(4);
    document.getElementById('altitude').textContent = altitude.toFixed(2);
    document.getElementById('velocity').textContent = velocity.toFixed(2);
    document.getElementById('visibility').textContent = visibility;

    getCountryData(latitude, longitude);
}

getISSData();

setInterval(getISSData, 1000);


// Center map, when a button is clicked
document.getElementById('center-map').addEventListener('click', function () {
    firstTime = true;
    getISSData();
}); 


// fetching country name from lat & lon
function getCountryData(latitude, longitude) {
    var api_key = 'd1016dcd31d240f1bd9bbd31009e8b14';
    var coords = `${latitude},${longitude}`;
    
    var api_url = 'https://api.opencagedata.com/geocode/v1/json'
    
    var request_url = api_url
      + '?'
      + 'key=' + api_key
      + '&q=' + encodeURIComponent(coords)
      + '&pretty=1'
      + '&no_annotations=1';
    
    // see full list of required and optional parameters:
    // https://opencagedata.com/api#forward
    
    var request = new XMLHttpRequest();
    request.open('GET', request_url, true);
    
    request.onload = function() {
        // see full list of possible response codes:
        // https://opencagedata.com/api#codes
        var data = JSON.parse(request.responseText);
        if (request.status === 200){  // Success!
            var country = 'Ocean';
            if (data.results[0].components.country != null){
                country = data.results[0].components.country;
            }
            document.getElementById('above').textContent = country;
        } else {
            console.log("unable to geocode! Response code: " + request.status);
            console.log('error msg: ' + data.status.message);
        }
    };
    
    request.onerror = function() {
        // There was a connection error of some sort
        console.log("unable to connect to server");
    };
    request.send();  // make the request
}

// Fetch information about the people onboard ISS
const onboard_api_url = 'http://api.open-notify.org/astros.json';

async function getISSOnboard() {

    const response = await fetch(onboard_api_url);
    const data = await response.json();
    const { number, people } = data;

    document.getElementById('onboard-number').textContent = number;

    people.forEach(function (person) {

        const onboard_people = document.createElement('div');
        const onboard_people_div = document.createElement('div');
        document.getElementById('onboard-people').appendChild(onboard_people);
        onboard_people.appendChild(onboard_people_div);


        const onboard_person = document.createElement('h4');
        const onboard_person_details = document.createElement('p');
        const onboard_person_link = document.createElement('a');

        Object.assign(onboard_person_link, {
            href: 'https://en.wikipedia.org/wiki/' + person.name,
            target: '_blank',
            rel: 'noreferrer'
        })

        onboard_people_div.appendChild(onboard_person);
        onboard_people_div.appendChild(onboard_person_details);
        onboard_people_div.appendChild(onboard_person_link);

        // Fetching details of each person
        var people_wiki_url = "https://en.wikipedia.org/w/api.php"; 
    
        var params = {
            action: 'query',
            list: 'search',
            srsearch: person.name,
            format: 'json',
            srlimit: 1,
        };
        
        people_wiki_url = people_wiki_url + "?origin=*";
        
        Object.keys(params).forEach(function(key){people_wiki_url += "&" + key + "=" + params[key];});
    
        fetch(people_wiki_url)
            .then(function(response){return response.json();})
            .then(function(response) {
                // if (response.query.search[0].title === person.name){
                onboard_person.innerHTML += person.name;
                onboard_person_details.innerHTML += response.query.search[0].snippet + "...";
                onboard_person_link.innerHTML += "read more";
                // }
            })
            .catch(function(error){console.log(error);});
    });
}

getISSOnboard();
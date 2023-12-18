import data from './data.js'
const iconOlive = L.icon({
  iconUrl: './assets/icons/olive-logo.png',
  iconSize: [42, 24],
  iconAnchor: [21, 24],
  popupAnchor: [-3, -76],
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});
const iconRocket = L.icon({
  iconUrl: './assets/icons/rocket-logo.png',
  iconSize: [84, 47],
  iconAnchor: [42, 47],
  popupAnchor: [-3, -76],
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});
const iconCurrent = L.icon({
  iconUrl: './assets/icons/current-location.png',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  shadowSize: [30, 60],
  shadowAnchor: [30, 30]
});

let currentLongitude;
let currentLatitude;
let dataFilter = data;

const capitalize = (sentence) =>{
  return sentence.replace(/\b\w/g, (char) => {
    return char.toUpperCase();
  });
}

// akses lokasi perangkat
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

const  showPosition = (position) => {
  currentLongitude = position.coords.latitude;
  currentLatitude = position.coords.longitude;
  // -7.8203922, 110.3580546 --> kos
  const currentPos = [];
  currentPos.push({
    "longitude": `${currentLongitude}`,
    "latitude": `${currentLatitude}`,
  });
  loadingMarker(currentPos, 'current');

  // apply jarak ke tiap outlet
  data.map( outlet => {
    outlet.jarak = haversineDistance(outlet.longitude, outlet.latitude, currentLongitude, currentLatitude);
  });
  console.log(data);
}

const showError = (error) => {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert('User denied the request for Geolocation.');
      break;
    case error.POSITION_UNAVAILABLE:
      alert('Location information is unavailable.');
      break;
    case error.TIMEOUT:
      alert('The request to get user location timed out.');
      break;
    case error.UNKNOWN_ERROR:
      alert('An unknown error occurred.');
      break;
  }
}

getLocation();

// pengerjaan map
const map = L.map('map').setView([-7.7969014, 110.3775107], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let markers = [];
let currentMarker = [];
const loadingMarker = (dataToLoad, pinMode) => {
  if (pinMode === "outlet") {
    markers.map(marker => map.removeLayer(marker));
    markers = [];
  } else if (pinMode === "current") {
    currentMarker.map( marker => map.removeLayer(marker));
    currentMarker = [];
  }

  dataToLoad.map( mark => {
    let newMark;
    if (mark.brand === "olive") {
      newMark = new L.marker([mark.longitude, mark.latitude], 
        {icon: iconOlive}
      ).bindPopup(`${capitalize(mark.brand)} ${capitalize(mark.nama_outlet)}`);
      markers.push(newMark); 
    } else if (mark.brand === "rocket"){
      newMark = L.marker([mark.longitude, mark.latitude], 
        {icon: iconRocket}
      ).bindPopup(`
        ${capitalize(mark.brand)} ${capitalize(mark.nama_outlet)}
      `).addTo(map);
      markers.push(newMark);
    } else {
      newMark = new L.marker([mark.longitude, mark.latitude], 
        {icon: iconCurrent}
      );
      currentMarker.push(newMark);
    }
  });

  if (pinMode === "outlet") {
    markers.map(marker => map.addLayer(marker));
  } else if (pinMode === "current") {
    currentMarker.map(marker => map.addLayer(marker));
  }
};

let route;
// routing machine
function ruteKeOutlet(coordinates, mode) {
  if (route) {
    route.setWaypoints([]);
  }
  route = L.Routing.control({
    waypoints: [
        L.latLng(currentLongitude, currentLatitude),
        L.latLng(coordinates[0], coordinates[1])
    ],
    routeWhileDragging: true
  });
  if (mode === 'routing') {
    route.addTo(map);
  } else if (mode === 'distance') {
    return route.summary.totalDistance;
  }
}

// filter
const cariBrand = (brand) => {
  const recordsBrand = data.filter(record => record.brand === brand);
  return recordsBrand;
};

window.onload = loadingMarker(data, 'outlet');

document.addEventListener('DOMContentLoaded', function() {
  loadingMarker(data, 'outlet');
  const checkboxes = document.querySelectorAll('input[name="brand"]');
  const searchBar = document.querySelector('#search');
  const outletContainer = document.querySelector('#list_outlet');
  outletContainer.innerHTML = '';
  dataFilter.map( data => {
    outletContainer.innerHTML += container(data);
  });

  // event ketika filter checkbox ditrigger
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      outletContainer.innerHTML = '';
      if (e.target.checked) {
        dataFilter = dataFilter.concat(cariBrand(`${e.target.value}`));
      } else {
        dataFilter = dataFilter.filter(record => record.brand !== e.target.value);
      }
      dataFilter.sort((a, b) => a.id - b.id );
      dataFilter.map( data => {
        outletContainer.innerHTML += container(data);
      });
    });
  });

  // menambahkan event saat outlet card diclick
  const destinations = document.querySelectorAll('h3');
  console.log(destinations)
  destinations.forEach( destination => {
  destination.addEventListener('click', (e) => {
    getLocation();
    ruteKeOutlet([destination.getAttribute("longitude"), destination.getAttribute("latitude")], 'route');
  })
})
});

// outlet listing
const container = (data) => {
  return `
    <div class="outlet-card border rounded-3 px-3 py-1">
      <h3 longitude="${data.longitude}" latitude="${data.latitude}" class="fs-5">${capitalize(data.brand)} ${capitalize(data.nama_outlet)}</h3>
      <p>Jarak: </p>
    </div>
  `
};

// fungsi nyari jarak menggunakan latitude-longitude
const degreesToRadians = (degrees) => {
  return degrees * (Math.PI/180);
}

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371000; // Radius bumi dalam meter
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance;
};

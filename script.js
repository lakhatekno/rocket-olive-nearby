import data from './data.js'
import { haversineDistance } from './programs/distance.js';
import { ruteKeOutlet } from './programs/routing-machine.js';
import { capitalize } from './programs/capitalize.js';
import { iconOlive, iconRocket, iconCurrent } from './programs/icons-settings.js';
import { outletCard } from './elements/outlet-card.js';
import { cariBrand } from './programs/filters.js';

let currentLongitude;
let currentLatitude;
let dataFilter = data;
let route;
let coordinate;
let currentPos;

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
  currentPos = [];
  currentPos.push({
    "longitude": `${currentLongitude}`,
    "latitude": `${currentLatitude}`,
  });
  loadingMarker(currentPos, 'current');
  // apply jarak ke tiap outlet
  data.map( outlet => {
    outlet.jarak = (haversineDistance(outlet.longitude, outlet.latitude, currentLongitude, currentLatitude)/1000).toFixed(2);
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

const removeMarker = () => {
  markers.map(marker => map.removeLayer(marker));
  currentMarker.map( marker => map.removeLayer(marker));
};

document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(getLocation(), 500);
  loadingMarker(data, 'outlet');
  const checkboxes = document.querySelectorAll('input[name="brand"]');
  const outletContainer = document.querySelector('#list_outlet');
  const btnEnd = document.querySelector('#end')
  outletContainer.innerHTML = '';
  setTimeout(() => {
    dataFilter.sort((a, b) => a.jarak - b.jarak );
    dataFilter.slice(0, 10).map( data => {
      outletContainer.innerHTML += outletCard(data);
    });
    loadingMarker(dataFilter.slice(0, 10), 'outlet');

  // menambahkan event saat outlet card diclick
    const destinations = document.querySelectorAll('#outlet-card');
    destinations.forEach( destination => {
      destination.addEventListener('click', (e) => {
        coordinate = [
          parseFloat(destination.getAttribute("longitude")),
          parseFloat(destination.getAttribute("latitude")),
          currentLongitude,
          currentLatitude
        ];
        route = ruteKeOutlet(coordinate, map, route, 'ganti');
        btnEnd.removeAttribute('disabled');
        btnEnd.classList.remove('disabled');
        removeMarker();
      });
    });
  }, 500);

  // event ketika filter checkbox ditrigger
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      outletContainer.innerHTML = '';
      if (e.target.checked) {
        dataFilter = dataFilter.concat(cariBrand(`${e.target.value}`));
      } else {
        dataFilter = dataFilter.filter(record => record.brand !== e.target.value);
      }
      dataFilter.sort((a, b) => a.jarak - b.jarak );
      dataFilter.slice(0, 10).map( data => {
        outletContainer.innerHTML += outletCard(data);
      });
      loadingMarker(dataFilter.slice(0, 10), 'outlet');
    });
  });

  btnEnd.addEventListener('click', () => {
    if (!btnEnd.disabled) { // disable false -> aktif
      ruteKeOutlet(coordinate, map, route, 'hapus');
      btnEnd.setAttribute('disabled', true); // nonaktifin
      btnEnd.classList.add('disabled'); // nonaktifin
      loadingMarker(dataFilter.sort((a, b) => a.jarak - b.jarak ).slice(0, 10), 'outlet');
      loadingMarker(currentPos, 'current');
    }
  });
});

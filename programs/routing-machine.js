import { iconFinish, iconStart } from "./icons-settings.js";

const removeInformation = () => {
  const box = document.getElementsByClassName('leaflet-routing-container');
  box[0].remove();
}

const ruteKeOutlet = (coordinates, map, route, mode) => {
  if (mode === 'ganti') {
    if (route) {
      route.setWaypoints([]);
    }
    route = L.Routing.control({
      waypoints: [
        L.latLng(coordinates[2], coordinates[3]),
        L.latLng(coordinates[0], coordinates[1])
      ],
      router: L.Routing.graphHopper('15fb4f2f-5e2d-427e-a02d-e14e5dab17ad')
    }).addTo(map);

    route.on('routesfound', () => {
      removeInformation();
    })
    return route;
  } else {
    if (route) {
      route.setWaypoints([]);
    }
  }
};

export { ruteKeOutlet };
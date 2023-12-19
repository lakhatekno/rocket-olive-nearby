import { capitalize } from "../programs/capitalize.js";
const outletCard = (data) => {
  return `
    <div id="outlet-card" class="outlet-card border col-md-5 rounded-3 px-3 py-1" longitude="${data.longitude}" latitude="${data.latitude}">
      <h3 class="fs-5">${capitalize(data.brand)} ${capitalize(data.nama_outlet)}</h3>
      <p>${data.jarak} Km</p>
    </div>
  `
};

export { outletCard };
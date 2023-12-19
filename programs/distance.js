// fungsi menghitung jarak

const degreesToRadians = (degrees) => {
  return degrees * (Math.PI/180);
};

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

export { haversineDistance };
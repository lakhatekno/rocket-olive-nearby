import data from "../data.js";
const cariBrand = (brand) => {
  const recordsBrand = data.filter(record => record.brand === brand);
  return recordsBrand;
};

export { cariBrand };
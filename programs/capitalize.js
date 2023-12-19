const capitalize = (sentence) =>{
  return sentence.replace(/\b\w/g, (char) => {
    return char.toUpperCase();
  });
};

export { capitalize };
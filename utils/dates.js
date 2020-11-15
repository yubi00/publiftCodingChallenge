function formatDate(date) {
  const year = date.substr(0, 4);
  const month = date.substr(4, 2);
  const day = date.substr(6);
  return `${year}-${month}-${day}`;
}

module.exports = {
  formatDate
};

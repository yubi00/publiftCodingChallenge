const csvToJson = require('csvtojson');

const getData = async (csvfile) => {
  if (!csvfile) throw new Error('file doesnot exist');
  const data = await csvToJson().fromString(csvfile.toString());
  return data;
};

module.exports = getData;

function groupBy(objectArray, property) {
  return [
    ...Object.values(
      objectArray.reduce(function (acc, obj) {
        let key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {})
    )
  ];
}

module.exports = {
  groupBy
};
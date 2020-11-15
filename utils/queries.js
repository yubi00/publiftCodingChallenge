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

function avg(sum, count) {
  return Math.floor(sum / count);
}

function ratio(num_1, num_2) {
  for (num = num_2; num > 1; num--) {
    if (num_1 % num == 0 && num_2 % num == 0) {
      num_1 = num_1 / num;
      num_2 = num_2 / num;
    }
  }
  return `${num_1}:${num_2}`;
}

module.exports = {
  groupBy,
  avg,
  ratio
};

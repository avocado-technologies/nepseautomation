

export function lowHigh(n) {
  let a = 0.98 * n;
  let b = 1.02 * n;
  // console.log({
  //   low: parseFloat(a.toFixed(1)),
  //   high: parseFloat(b.toFixed(1))
  // },"price")
  return {
    low: parseFloat(a.toFixed(1)),
    high: parseFloat(b.toFixed(1))
  };
}
export function lowHighwith(n,changePercentage) {
  let a = n - 0.02 * n;
  let b = n + 0.02 * n;
  return {
    low: parseFloat(a.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]),
    high: parseFloat(b.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]),
  };
}
export function fivelowHigh(n) {
  let a = n - 0.05 * n;
  let b = n + 0.05 * n;
  return { low: a, high: b };
}
export function getPriceFromStrategy(lh, goal) {
  let price;
  if (goal.strategy.toUpperCase() === "LOW") {
    price = lh.low 
  } else if (goal.strategy.toUpperCase() === "HIGH") {
    price = lh.high;
  } else if (goal.strategy.toUpperCase() === "FIXED" && goal.price) {
    // if (goal.price >= lh.low && goal.price <= lh.high) {
    //   price = goal.price;
    // } else if (goal.price > lh.high) {
    //   price = lh.high;
    // } else if (goal.price < lh.price) {
    //   price = lh.low;
    // } else {
    //   if (goal.type == "buy") {
    //     price = lh.low;
    //   } else {
    //     price = lh.high;
    //   }
    // }
    return parseFloat(goal.price).toFixed(1);
  }
  return price;
}

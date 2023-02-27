export const bankPosition = {
  top: -5,
  left: 330,
}
export const coinPositions = [
  {
      top: 37,
      left: 55,
  },
  {
      top: -26,
      left: 170,
  },
  {
      top: -26,
      left: 438,
  },
  {
      top: 52,
      left: 550,
  },
  {
      top: 185,
      left: 550,
  },
  {
      top: 284,
      left: 495,
  },
  {
      top: 270,
      left: 310,
  },
  {
      top: 270,
      left: 85,
  },
  {
      top: 185,
      left: 45,
  }
]

export const coinValues = [50000, 10000, 5000, 1000, 500, 100, 50, 10, 5, 1];

export function sumToCoins(sum: number, values: Array<number>) {
  if(sum < 0) {
    throw new Error('sum coins is negative');
  }
  let leftSum = sum;
  const res = values.map(it => {
      const current = Math.floor(leftSum / it);
      leftSum = Math.floor(leftSum % it);
      return { count: current, coinValue: it };
  })
  return res;
}

export function sumToCoinsMerged(sum: number, values: Array<number>, lastCoins: Array<{ count: number, coinValue: number }>) {
  const lastSum = lastCoins.reduce((ac, it) => ac + it.count * it.coinValue, 0);
  let leftSum = sum - lastSum;
  if (leftSum < 0) {
      return sumToCoins(sum, coinValues);
  }
  const res = values.map(it => {
      const current = Math.floor(leftSum / it);
      leftSum = Math.floor(leftSum % it);
      return { count: current, coinValue: it };
  })
  res.forEach(it => {
      const ex = lastCoins.find(lastCoin => it.coinValue == lastCoin.coinValue);
      if (ex) {
          ex.count += it.count;
      } else {
          lastCoins.push(it);
      }
  })
  return lastCoins;
}

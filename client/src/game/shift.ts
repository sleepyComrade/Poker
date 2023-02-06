export function shift<T>(arr: Array<T>, count: number) {
    for(let i = 0; i < count; i++) {
      arr.push(arr.shift());
    }
    return arr;
  }
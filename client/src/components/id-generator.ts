export const createIdGenerator = (pref: string) => {
  let id = 0;

  return () => {
    return pref + id++
  }
}
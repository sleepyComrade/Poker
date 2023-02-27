import * as fs from "fs/promises"

export const exists = (path: string): Promise<boolean> => fs.stat(path).then(() => true).catch(() => false)

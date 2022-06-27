export const waitForMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function doTaskWithRetry(
  times: number,
  doTask: () => Promise<void>,
  onRetry?: (error: Error, time: number) => void
) {
  let it = times;
  while (it > 0) {
    try {
      await doTask();
      return;
    } catch (error) {
      it--;
      const canRetry = it > 0;
      if (!canRetry) throw error;
      onRetry && onRetry(error as Error, times - it);
    }
  }
}

export function boolFromString(inp: any) {
  if (inp === '1' || inp === 'true') return true;
  return false;
}

export function isArrayIncludeAll(array: any[], contain: any[]) {
  for (const itm of contain) {
    if (!array.includes(itm)) return false;
  }
  return true;
}

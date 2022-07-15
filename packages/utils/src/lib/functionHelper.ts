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

export function byte2number(bytes: number[]) {
  return parseInt(Buffer.from(bytes).toString('hex'), 16);
}

export function isHexStrict(hex: string) {
  return (
    (typeof hex === 'string' || typeof hex === 'number') &&
    /^(-)?0x[0-9a-f]*$/i.test(hex)
  );
}

export function hexToBytes(hex: string) {
  hex = (hex as any).toString(16);

  if (!isHexStrict(hex)) {
    throw new Error('Given value "' + hex + '" is not a valid hex string.');
  }

  hex = hex.replace(/^0x/i, '');

  const bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.slice(c, c + 2), 16));
  return bytes;
}

export function splitPackedHexBy32Bytes(hex: string) {
  hex = hex.replace(/^0x/i, '');
  const fixedSize = 64;

  const res = [];
  for (let i = 0; i < hex.length; i += fixedSize) {
    const chunk = hex.slice(i, i + fixedSize);
    res.push(chunk);
  }
  return res;
}

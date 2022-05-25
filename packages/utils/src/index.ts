export * from './lib/axiosHelper';
export * from './lib/typeConvertHelper';
export * from './lib/cryptoHelper';
export * from './lib/deferred';

export const waitForMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

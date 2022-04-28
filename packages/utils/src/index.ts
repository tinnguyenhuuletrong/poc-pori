import { promisify } from 'util';
export * from './lib/axiosHelper';
export * from './lib/typeConvertHelper';

export const waitForMs = promisify(setTimeout);

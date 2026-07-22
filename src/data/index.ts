import { StaticJsonRepository } from './staticJsonRepository';
import type { DataRepository } from './repository';

export type { DataRepository } from './repository';
export { StaticJsonRepository } from './staticJsonRepository';

/** Shared repository instance used across the app. */
export const repository: DataRepository = new StaticJsonRepository();

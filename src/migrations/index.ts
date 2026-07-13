import * as migration_20260713_061205 from './20260713_061205';

export const migrations = [
  {
    up: migration_20260713_061205.up,
    down: migration_20260713_061205.down,
    name: '20260713_061205'
  },
];

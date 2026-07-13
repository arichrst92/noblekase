import * as migration_20260713_061205 from './20260713_061205';
import * as migration_20260713_064549__ from './20260713_064549__';

export const migrations = [
  {
    up: migration_20260713_061205.up,
    down: migration_20260713_061205.down,
    name: '20260713_061205',
  },
  {
    up: migration_20260713_064549__.up,
    down: migration_20260713_064549__.down,
    name: '20260713_064549__'
  },
];

import * as migration_20260713_061205 from './20260713_061205';
import * as migration_20260713_064549__ from './20260713_064549__';
import * as migration_20260713_070721__ from './20260713_070721__';
import * as migration_20261002_155719 from './20261002_155719';
import * as migration_20261002_160239 from './20261002_160239';

export const migrations = [
  {
    up: migration_20260713_061205.up,
    down: migration_20260713_061205.down,
    name: '20260713_061205',
  },
  {
    up: migration_20260713_064549__.up,
    down: migration_20260713_064549__.down,
    name: '20260713_064549__',
  },
  {
    up: migration_20260713_070721__.up,
    down: migration_20260713_070721__.down,
    name: '20260713_070721__',
  },
  {
    up: migration_20261002_155719.up,
    down: migration_20261002_155719.down,
    name: '20261002_155719',
  },
  {
    up: migration_20261002_160239.up,
    down: migration_20261002_160239.down,
    name: '20261002_160239'
  },
];

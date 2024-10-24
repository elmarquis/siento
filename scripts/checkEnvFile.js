import { copyFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';

import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFilePath = resolve(__dirname, '../.env');
const envExampleFilePath = resolve(__dirname, '.env.example');

if (!existsSync(envFilePath)) {
  copyFileSync(envExampleFilePath, envFilePath);
  console.log('.env file was not found. .env.example has been copied to .env');
} else {
  console.log('.env file already exists.');
}
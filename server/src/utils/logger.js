/**
 * Minimal console logger with colour coding.
 * Kept dependency-free; swap for winston/pino later without changing call sites.
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const stamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${colors.gray}${stamp()}${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset}   ${colors.gray}${stamp()}${colors.reset} ${msg}`),
  warn: (msg) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${colors.gray}${stamp()}${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERR]${colors.reset}  ${colors.gray}${stamp()}${colors.reset} ${msg}`),
};

export default logger;

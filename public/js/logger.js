// Centralized logging service with log levels and pluggable outputs

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const ConsoleOutput = {
  log(level, moduleName, message, ...args) {
    const prefix = `[${moduleName}]`;
    const fn =
      level === 'debug'
        ? console.debug
        : level === 'info'
          ? console.info
          : level === 'warn'
            ? console.warn
            : console.error;
    fn(prefix, message, ...args);
  },
};

const Logger = {
  _level: LOG_LEVELS.debug,
  _outputs: [ConsoleOutput],

  setLevel(level) {
    if (!(level in LOG_LEVELS)) {
      console.error(`[Logger] Unknown log level: ${level}`);
      return;
    }
    this._level = LOG_LEVELS[level];
  },

  addOutput(output) {
    this._outputs.push(output);
  },

  removeOutput(output) {
    this._outputs = this._outputs.filter((o) => o !== output);
  },

  create(moduleName) {
    const instance = {};
    for (const level of Object.keys(LOG_LEVELS)) {
      instance[level] = (message, ...args) => {
        if (LOG_LEVELS[level] < this._level) return;
        for (const output of this._outputs) {
          output.log(level, moduleName, message, ...args);
        }
      };
    }
    return instance;
  },
};

window.Logger = Logger;

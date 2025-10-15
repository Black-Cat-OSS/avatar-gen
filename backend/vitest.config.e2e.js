"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts'],
        setupFiles: ['./test/vitest-setup.ts'],
    },
    resolve: {
        alias: {
            src: (0, path_1.resolve)(__dirname, './src'),
        },
    },
});
//# sourceMappingURL=vitest.config.e2e.js.map
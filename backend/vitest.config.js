"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/__tests__/**/*.spec.ts'],
        setupFiles: ['./test/vitest-setup.ts'],
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            exclude: [
                '**/*.interface.ts',
                '**/*.enum.ts',
                '**/*.dto.ts',
                '**/index.ts',
            ],
        },
        mockReset: true,
        restoreMocks: true,
    },
    resolve: {
        alias: {
            src: (0, path_1.resolve)(__dirname, './src'),
        },
    },
});
//# sourceMappingURL=vitest.config.js.map
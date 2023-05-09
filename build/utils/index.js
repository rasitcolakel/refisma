"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUIFramework = exports.getDependencies = exports.getPackageJson = void 0;
const cli_1 = require("@refinedev/cli");
const fs_1 = require("fs");
const getPackageJson = () => {
    if (!(0, fs_1.existsSync)("package.json")) {
        throw new Error("./package.json not found");
    }
    return JSON.parse((0, fs_1.readFileSync)("package.json", "utf8"));
};
exports.getPackageJson = getPackageJson;
const getDependencies = () => {
    const { dependencies, devDependencies } = (0, exports.getPackageJson)();
    return [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})];
};
exports.getDependencies = getDependencies;
const getUIFramework = () => {
    // read dependencies from package.json
    const dependencies = (0, exports.getDependencies)();
    // check for antd
    if (dependencies.includes("@refinedev/antd")) {
        return cli_1.UIFrameworks.ANTD;
    }
    // check for mui
    if (dependencies.includes("@refinedev/mui")) {
        return cli_1.UIFrameworks.MUI;
    }
    // check for chakra
    if (dependencies.includes("@refinedev/chakra-ui")) {
        return cli_1.UIFrameworks.CHAKRA;
    }
    // check for mantine
    if (dependencies.includes("@refinedev/mantine")) {
        return cli_1.UIFrameworks.MANTINE;
    }
    return cli_1.UIFrameworks.MUI;
};
exports.getUIFramework = getUIFramework;

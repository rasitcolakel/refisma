"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependencies = exports.getPackageJson = void 0;
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
    console.log("dependencies", dependencies, devDependencies);
    return [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})];
};
exports.getDependencies = getDependencies;

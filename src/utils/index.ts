import { UIFrameworks } from "@refinedev/cli";
import { existsSync, readFileSync } from "fs";

export const getPackageJson = (): any => {
    if (!existsSync("package.json")) {
        throw new Error("./package.json not found");
    }

    return JSON.parse(readFileSync("package.json", "utf8"));
};

export const getDependencies = (): string[] => {
    const { dependencies, devDependencies } = getPackageJson();

    return [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})];
}

export const getUIFramework = (): UIFrameworks | undefined => {
    // read dependencies from package.json
    const dependencies = getDependencies();

    // check for antd
    if (dependencies.includes("@refinedev/antd")) {
        return UIFrameworks.ANTD;
    }

    // check for mui
    if (dependencies.includes("@refinedev/mui")) {
        return UIFrameworks.MUI;
    }

    // check for chakra
    if (dependencies.includes("@refinedev/chakra-ui")) {
        return UIFrameworks.CHAKRA;
    }

    // check for mantine
    if (dependencies.includes("@refinedev/mantine")) {
        return UIFrameworks.MANTINE;
    }

    return UIFrameworks.MUI;
};
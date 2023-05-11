import { UIFrameworks } from '@refinedev/cli'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

export const getPackageJson = (): any => {
    if (!existsSync('package.json')) {
        throw new Error('./package.json not found')
    }

    return JSON.parse(readFileSync('package.json', 'utf8'))
}

export const getDependencies = (): string[] => {
    const { dependencies, devDependencies } = getPackageJson()

    return [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})]
}

export const getUIFramework = (): UIFrameworks | undefined => {
    // read dependencies from package.json
    const dependencies = getDependencies()

    // check for antd
    if (dependencies.includes('@refinedev/antd')) {
        return UIFrameworks.ANTD
    }

    // check for mui
    if (dependencies.includes('@refinedev/mui')) {
        return UIFrameworks.MUI
    }

    // check for chakra
    if (dependencies.includes('@refinedev/chakra-ui')) {
        return UIFrameworks.CHAKRA
    }

    // check for mantine
    if (dependencies.includes('@refinedev/mantine')) {
        return UIFrameworks.MANTINE
    }

    return UIFrameworks.MUI
}

export const checkFolderExists = (p: string) => {
    if (!existsSync(path.join(process.cwd(), p))) {
        mkdirSync(path.join(process.cwd(), p))
    }
}

export const writeFile = (filePath: string, content: string) => {
    const folders = filePath.split('/').slice(0, -1)
    for (let i = 0; i < folders.length; i++) {
        const folder = folders.slice(0, i + 1).join('/')
        checkFolderExists(folder)
    }

    writeFileSync(path.join(process.cwd(), filePath), content)
}

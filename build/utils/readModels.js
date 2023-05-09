"use strict";
// read models from  prisma/schema.prisma
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSchema = exports.getModels = void 0;
const fs_1 = require("fs");
const getModels = () => {
    const schema = (0, fs_1.readFileSync)("prisma/schema.prisma", "utf-8");
    const models = (0, exports.parseSchema)(schema);
    return models;
};
exports.getModels = getModels;
const parseSchema = (schema) => {
    const models = [];
    const lines = schema.split("\n");
    let model = undefined;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("//") || line.trim().startsWith("@"))
            continue;
        if (line.startsWith("model ")) {
            const name = line.split(" ")[1];
            model = {
                name,
                fields: [],
            };
        }
        if (line.startsWith("}")) {
            if (model) {
                models.push(model);
                model = undefined;
            }
        }
        if (line.startsWith("  ")) {
            if (model) {
                const field = parseField(line);
                model.fields.push(field);
            }
        }
    }
    return models;
};
exports.parseSchema = parseSchema;
const parseField = (line) => {
    // replace all spaces with a single space
    const arrayLine = line.replace(/\s+/g, " ").trim();
    const [name, type, ...options] = arrayLine.split(" ");
    console.log({ name, type, options });
    console.log("type of type", typeof type.startsWith);
    const isList = type.startsWith("[") && type.endsWith("]");
    const isRequired = type.endsWith("!");
    const isUnique = options.includes("@unique");
    const isId = options.includes("@id");
    const isUpdatedAt = options.includes("@updatedAt");
    const isCreatedAt = options.includes("@createdAt");
    const isOptional = options.includes("@optional");
    const isReadOnly = options.includes("@readOnly");
    const isGenerated = options.includes("@generated");
    return {
        name,
        type,
        isList,
        isRequired,
        isUnique,
        isId,
        isUpdatedAt,
        isCreatedAt,
        isOptional,
        isReadOnly,
        isGenerated,
    };
};

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const readModels_1 = require("./utils/readModels");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const models = (0, readModels_1.getModels)();
    console.log(JSON.stringify(models));
    //   const response = (await prompt({
    //     type: "input",
    //     name: "resourceName",
    //     message: "Which resource name are you trying to create?",
    //   })) as { resourceName: string };
    if (models.length === 0)
        console.log(chalk_1.default.green("There are no models in your schema.prisma file. Please create a model first."));
    else
        console.log(chalk_1.default.green("Your models are:"));
    models.forEach((model) => {
        console.log(chalk_1.default.green(model.name));
    });
});
main();

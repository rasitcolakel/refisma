import { prompt } from "enquirer";
import chalk from "chalk";
import { getUIFramework } from "./utils";
import { getModels } from "./utils/readModels";

const main = async () => {
  const models = getModels();
  console.log(JSON.stringify(models));

  //   const response = (await prompt({
  //     type: "input",
  //     name: "resourceName",
  //     message: "Which resource name are you trying to create?",
  //   })) as { resourceName: string };
  if (models.length === 0)
    console.log(
      chalk.green(
        "There are no models in your schema.prisma file. Please create a model first."
      )
    );
  else console.log(chalk.green("Your models are:"));
  models.forEach((model) => {
    console.log(chalk.green(model.name));
  });
};

main();

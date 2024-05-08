import { Lambda } from "@aws-sdk/client-lambda";
import { writeFileSync } from "fs";
import { checkHasOwn, coloredLog } from "./utils.js";

// const ELASTICNODE = '';
// const NEW_NODE_URL = "https://search-dev-incidentreports-new-4seo6ojdvic5dsym24glxzk3d4.us-east-2.es.amazonaws.com"; //previous dev url
const NEW_NODE_URL =
  "https://search-staging-incidentreports-new-dogdmwughex626gnbtxgnfx5by.us-east-2.es.amazonaws.com";
const ELASTICNODE = "ELASTICNODE";
const REGION = "us-east-2";

const lambda = new Lambda({
  region: REGION,
});

async function listAllLambdas() {
  let allFunctions = [];
  let nextMarker;
  do {
    try {
      const response = await lambda.listFunctions({
        Marker: nextMarker,
      });

      const lambdaFunctions = response.Functions;
      allFunctions = allFunctions.concat(lambdaFunctions);
      nextMarker = response.NextMarker;
    } catch (error) {
      console.error("Error listing Lambda functions:", error);
      break;
    }
  } while (nextMarker);
  return allFunctions;
}

async function updateEnvironmentVariables(functionName, oldVars, newVars) {
  const environmentVariables = {
    ...oldVars,
    ...newVars,
  };

  const params = {
    FunctionName: functionName,
    Environment: {
      Variables: environmentVariables,
    },
  };

  try {
    const result = await lambda.updateFunctionConfiguration(params);
    console.log(
      `Environment variables updated successfully for ${functionName}`
    );
    writeFileSync("res.json", JSON.stringify(result));
    if (
      result &&
      result?.Environment &&
      result?.Environment?.Variables &&
      checkHasOwn(result?.Environment?.Variables, ELASTICNODE)
    ) {
      console.log(`Sucessful for ${functionName}`);
    }
  } catch (error) {
    coloredLog.red(`Error updating environment variables for ${functionName}:`);
    console.error(error);
  }
}

async function handler() {
  const lambdas = await listAllLambdas();

  coloredLog.green("All functions count: ");
  console.log(lambdas?.length);

  if (Array.isArray(lambdas)) {
    lambdas?.forEach((lambda) => {
      // console.log(lambda?.FunctionName);
      if (
        lambda?.Environment &&
        lambda?.Environment?.Variables &&
        (lambda?.Environment?.Variables?.ELASTICNODE || lambda?.Environment?.Variables?.ELASTIC_NODE)
      ) {
        const variables = { ...lambda?.Environment?.Variables };
      
        if (lambda?.Environment?.Variables?.ELASTICNODE) {
          variables.ELASTICNODE = NEW_NODE_URL;
        }
      
        if (lambda?.Environment?.Variables?.ELASTIC_NODE) {
          variables.ELASTIC_NODE = NEW_NODE_URL;
        }
      
        updateEnvironmentVariables(
          lambda?.FunctionName,
          lambda?.Environment?.Variables,
          variables
        );
      }
      
    });
  }
}

handler();

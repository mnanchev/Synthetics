#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SyntheticsProjectPipeline } from "../lib/SyntheticsProjectPipeline";
import { canaryName, lambdaFunctionName } from "../lib/Properties";
const replaceOnce = require("replace-once");
const fsReadDashboard = require("fs");
const app = new cdk.App();
let rawData = fsReadDashboard.readFileSync("./bin/dashboard.json");
let json = JSON.parse(rawData);

var replaceJsonValues = JSON.stringify(json);
const REGION = "eu-central-1";
var find = ["REPLACE_FUNCTION_NAME", "REPLACE_CANARY_NAME", "REPLACE_REGION"];
var replace = [lambdaFunctionName, canaryName, REGION];
var dashboardAsString = replaceOnce(replaceJsonValues, find, replace, "gi");

const syntheticsStack = new SyntheticsProjectPipeline(app, "Codepipeline", {
  env: { account: "184790871423", region: REGION },
  dashboard: dashboardAsString,
});

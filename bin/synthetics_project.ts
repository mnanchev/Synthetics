#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SyntheticsProjectPipeline } from "../lib/SyntheticsProjectPipeline";

const app = new cdk.App();
const syntheticsStack = new SyntheticsProjectPipeline(app, "Codepipeline", {
  env: { account: "184790871423", region: "eu-central-1" },
});

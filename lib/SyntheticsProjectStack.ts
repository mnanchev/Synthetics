import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { CommonProps } from "./Properties";

export class SyntheticsProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const commonProps = new CommonProps();
    const lambda_function = new DockerImageFunction(
      this,
      "PredictiveLambda",
      commonProps.getDockerLambdaProperties()
    );
    const url = commonProps.setLambdaUrl(lambda_function);
    new CfnOutput(this, "LambdaURL", {
      value: url.url,
    });
  }
}

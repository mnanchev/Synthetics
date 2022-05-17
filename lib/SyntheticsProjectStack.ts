import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { CommonProps, predictingLambdaUrlParameter } from "./Properties";

export class SyntheticsProjectStack extends Stack {
  public readonly urlParameter: StringParameter;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const commonProps = new CommonProps();
    const lambda_function = new DockerImageFunction(
      this,
      "PredictiveLambda",
      commonProps.getDockerLambdaProperties()
    );
    const url = commonProps.setLambdaUrl(lambda_function);
    const urlEncoded = url.url.replace("https://", "").replace("/", "");
    new StringParameter(this, "predictingLambdaUrl", {
      description: "The url for predicting lambda",
      parameterName: predictingLambdaUrlParameter,
      stringValue: urlEncoded,
    });
  }
}

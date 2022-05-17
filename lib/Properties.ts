import { Duration } from "aws-cdk-lib";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
  DockerImageFunctionProps,
  FunctionUrl,
  FunctionUrlAuthType,
  Tracing,
} from "aws-cdk-lib/aws-lambda";
import { StrictBuilder } from "builder-pattern";
import { join } from "path";

enum PredictingLambdaProperties {
  memorySize = 4096,
  timeout = 15,
}

export enum CanaryProperties {
  evaluationPeriods = 2,
  threshold = 90,
}

export enum Emails {
  email = "martinn@helecloud.com",
}

export const predictingLambdaUrlParameter = "/predicting/lambda/url";

export class CommonProps {
  setLambdaUrl(lambda_function: DockerImageFunction): FunctionUrl {
    return lambda_function.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
  }

  getDockerLambdaProperties(
    folder: string = "src",
    functionName: string = "dockerLambdaFunction"
  ): DockerImageFunctionProps {
    return StrictBuilder<DockerImageFunctionProps>()
      .architecture(Architecture.X86_64)

      .memorySize(PredictingLambdaProperties.memorySize)

      .timeout(Duration.seconds(PredictingLambdaProperties.timeout))

      .tracing(Tracing.ACTIVE)

      .functionName(functionName)

      .code(DockerImageCode.fromImageAsset(join(__dirname, folder)))

      .build();
  }
}

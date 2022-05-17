import { SyntheticsProjectStage } from "./SyntheticsProjectStage";
import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import {
  Canary,
  Test,
  Code as CanaryCode,
  Runtime as CanaryRuntime,
  Schedule,
} from "@aws-cdk/aws-synthetics-alpha";
import { join } from "path";
import {
  AnyPrincipal,
  ManagedPolicy,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import {
  Alarm,
  ComparisonOperator,
  TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import {
  CanaryProperties,
  Emails,
  predictingLambdaUrlParameter,
} from "./Properties";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { pipeline } from "stream";

export class SyntheticsProjectPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipelineName = "MlOpsPipeline";
    const ml_repo = new Repository(this, "MlOpsPipelineRepo", {
      repositoryName: `${pipelineName}Repo`,
    });
    const canary = new Canary(this, "End2EndTesting", {
      schedule: Schedule.once(),
      test: Test.custom({
        code: CanaryCode.fromAsset(join(__dirname, "canary")),
        handler: "index.handler",
      }),
      runtime: CanaryRuntime.SYNTHETICS_NODEJS_PUPPETEER_3_5,
      environmentVariables: {
        HOSTNAME: predictingLambdaUrlParameter,
      },
    });
    const buildPhase = new CodeBuildStep("SynthStep", {
      input: CodePipelineSource.codeCommit(ml_repo, "master"),
      installCommands: ["npm install -g aws-cdk"],
      commands: ["npm ci", "npm run build", "npx cdk synth"],
    });
    canary.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMFullAccess")
    );

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: pipelineName,
      synth: buildPhase,
    });

    const postDeploymentChecks = new CodeBuildStep("postDeploymentChecks", {
      commands: [`aws synthetics start-canary --name ${canary.canaryName}`],
      rolePolicyStatements: [
        new PolicyStatement({
          actions: ["*"],
          resources: ["*"],
        }),
      ],
    });

    const topic = new Topic(this, "DeploymentFailedTopic", {
      displayName: "deploymentFailed",
    });

    topic.addSubscription(new EmailSubscription(Emails.email));

    const alarm = new Alarm(this, "CanaryAlarm", {
      metric: canary.metricSuccessPercent(),
      evaluationPeriods: CanaryProperties.evaluationPeriods,
      threshold: CanaryProperties.threshold,
      comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });
    alarm.addAlarmAction(new SnsAction(topic));

    const deploy = new SyntheticsProjectStage(this, "Deploy");
    pipeline.addStage(deploy, {
      post: [postDeploymentChecks],
    });
  }
}

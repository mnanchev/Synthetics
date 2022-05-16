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

export class SyntheticsProjectPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipelineName = "MlOpsPipeline";
    const ml_repo = new Repository(this, "MlOpsPipelineRepo", {
      repositoryName: `${pipelineName}Repo`,
    });

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: pipelineName,
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.codeCommit(ml_repo, "master"),
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth", "npx cdk diff"],
      }),
    });
    const deploy = new SyntheticsProjectStage(this, "Deploy");
    pipeline.addStage(deploy, {
      pre: [new ManualApprovalStep("Approval Step")],
    });
  }
}

import { Construct } from "constructs";
import { Stage, StageProps } from "aws-cdk-lib";
import { SyntheticsProjectStack } from "./SyntheticsProjectStack";

export class SyntheticsProjectStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    // =========================================
    //
    //  Backend creation
    //
    // =========================================
    new SyntheticsProjectStack(this, "backend", {});
  }
}

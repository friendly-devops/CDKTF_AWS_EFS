import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { EcsCluster } from '@cdktf/provider-aws/lib/ecs-cluster';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamInstanceProfile } from '@cdktf/provider-aws/lib/iam-instance-profile';

export class EcsClusterStack extends AwsStackBase {
    public cluster: EcsCluster
    public instanceProfile: IamInstanceProfile;
    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
         this.cluster = new EcsCluster(this, `${props.name}-ecs-cluster`, {
            name: `${props.name}-${props.project}-cluster`
        });

        const ecsRole = new IamRole(this, `${props.name}-ecs-role`, {
          name: `${props.name}-ecs-role`,
          inlinePolicy: [
            {
              name: "deploy-ecs",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["ecs:*", "ec2:*", "kms:*", "efs:*"],
                    Resource: "*",
                  },
                ],
              }),
            },
          ],
          assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ecs.amazonaws.com",
                },
              },
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ec2.amazonaws.com",
                },
              },
            ],
          }),
        });

        this.instanceProfile = new IamInstanceProfile(this, `${props.name}-instance-profile`, {
            name: ecsRole.name,
            role: ecsRole.name,
        })
    }
}

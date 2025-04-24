import { Construct } from 'constructs';
import { Fn } from 'cdktf';
import { AwsStackBase } from './stackbase';
import { DbConfigs } from './db-stack';
import { EcsTaskDefinition} from '@cdktf/provider-aws/lib/ecs-task-definition';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { CloudwatchLogGroup} from '@cdktf/provider-aws/lib/cloudwatch-log-group';

export class taskDefinitionStack extends AwsStackBase {
    public td: EcsTaskDefinition;
    constructor(scope: Construct, id: string, props: DbConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })

        const executionRole = new IamRole(this, `${props.name}-execution-role`, {
          name: `${props.name}-execution-role`,
          inlinePolicy: [
            {
              name: "allow-ecr-pull",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "ecr:GetAuthorizationToken",
                      "ecr:BatchCheckLayerAvailability",
                      "ecr:GetDownloadUrlForLayer",
                      "ecr:BatchGetImage",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents",
                    ],
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
                  Service: "ecs-tasks.amazonaws.com",
                },
              },
            ],
          }),
        });

        const taskRole = new IamRole(this, `${props.name}-task-role`, {
          name: `${props.name}-task-role`,
          inlinePolicy: [
            {
              name: "allow-logs",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                    Resource: "*",
                  },
                ],
              }),
            },
            {
              name: "kms",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["kms:*"],
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
                  Service: "ecs-tasks.amazonaws.com",
                },
              },
            ],
          }),
        });

        const logGroup = new CloudwatchLogGroup(this, `${props.name}-loggroup`, {
          name: `${props.name}-loggroup/${props.name}`,
          retentionInDays: 30,
        });

        this.td = new EcsTaskDefinition(this, `${props.name}-task-definition`, {
            family: `${props.name}-client`,
            memory: "900",
            cpu: "2000",
            networkMode: "awsvpc",
            requiresCompatibilities: ["EC2"],
            executionRoleArn: executionRole.arn,
            taskRoleArn: taskRole.arn,

            containerDefinitions: Fn.jsonencode([
              {
                name: "client",
                image: "nextcloud:stable",
                essential: true,
                portMappings: [
                  {
                    containerPort: 80,
                    hostPort: 80,
                    protocol: "tcp",
                  },
                ],
                logConfiguration: {
                    logDriver: "awslogs",
                    options: {
                      // Defines the log
                      "awslogs-group": logGroup.name,
                      "awslogs-region": props.region,
                      "awslogs-stream-prefix": props.name,
                    },
                },
                mountPoints: [
                    {
                        sourceVolume: `${props.name}-efs-volume`,
                        containerPath: "/var/www/html/",
                        readOnly: false
                    }
                ],
                environment: [
                  {
                    name: "NAME",
                    value: `${props.name}-container`,
                  },
                  {
                    name: "MYSQL_HOST",
                    value: props.dbAddress,
                  },
                  {
                    name: "MYSQL_USER",
                    value: `${process.env.USER}`,
                  },
                  {
                    name: "MYSQL_PASSWORD",
                    value: `${process.env.PASS}`,
                  },
                  {
                    name: "MYSQL_DATABASE",
                    value: props.dbName,
                  }
                ]
              }
            ]),
            volume: [
                {
                    name: `${props.name}-efs-volume`,
                    efsVolumeConfiguration: {
                        fileSystemId: `${props.fileSystemId}`,
                        transitEncryption: "ENABLED",
                        authorizationConfig: {
                           accessPointId: `${props.accessPointId}`,
                           iam: "ENABLED", 
                        }
                    }
                }
            ]
        })
    }
}

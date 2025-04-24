import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';

export class sgStack extends AwsStackBase {
    public sg: SecurityGroup;
    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        this.sg = new SecurityGroup(this,  `${props.name}-security-group`, {
            name: props.name,
            ingress: [
                {
                    protocol: "-1",
                    fromPort: 0,
                    toPort: 0,
                    selfAttribute: true
                },
                {
                    protocol: "TCP",
                    fromPort: 80,
                    toPort: 80,
                    cidrBlocks: ["0.0.0.0/0"],
                    ipv6CidrBlocks: ["::/0"]
                },
                {
                    protocol: "TCP",
                    fromPort: 443,
                    toPort: 443,
                    cidrBlocks: ["0.0.0.0/0"],
                    ipv6CidrBlocks: ["::/0"]
                }
            ],
            egress: [
              // allow all traffic to every destination
                {
                  fromPort: 0,
                  toPort: 0,
                  protocol: "-1",
                  cidrBlocks: ["0.0.0.0/0"],
                  ipv6CidrBlocks: ["::/0"],
                },
                {
                    protocol: "-1",
                    fromPort: 0,
                    toPort: 0,
                    selfAttribute: true
                }
            ],
        });
    }
}

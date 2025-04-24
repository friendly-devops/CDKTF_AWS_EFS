import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';

export interface RouteConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    zoneId: string,
    dnsName: string,
    lbZoneId:string,
}

export class Route53Stack extends AwsStackBase {
    constructor(scope: Construct, id: string, props: RouteConfigs) {
        super(scope, `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })

        new Route53Record (this, `${props.name}-${id}`, {
            name: props.name,
            type: "A",
            zoneId: props.zoneId,
            alias: {
                name: props.dnsName,
                zoneId: props.lbZoneId,
                evaluateTargetHealth: false,
            }
        })
    }
}

import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { AutoscalingGroup, AutoscalingGroupLaunchTemplate } from '@cdktf/provider-aws/lib/autoscaling-group'
import { AutoscalingPolicy } from '@cdktf/provider-aws/lib/autoscaling-policy'

export interface AutoScalingConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    desiredCapacity: number,
    minSize: number,
    maxSize: number,
    launchTemplate: AutoscalingGroupLaunchTemplate,
    vpcZoneIdentifier: string[],
    cpuTargetValue: number,
    memoryTargetValue: number,
    ecsClusterName: string,
}

export class AutoScalingStack extends AwsStackBase {
    constructor(scope: Construct, id: string, props: AutoScalingConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        const autoScaling = new AutoscalingGroup(this, `${props.name}-auto-scaler`, {
            name: `${props.name}-${props.project}`,
            desiredCapacity: props.desiredCapacity,
            minSize: props.minSize,
            maxSize: props.maxSize,
            launchTemplate: props.launchTemplate,
            vpcZoneIdentifier: props.vpcZoneIdentifier,

        });

        new AutoscalingPolicy(this, `${props.name}-cpu-auto-scaler`, {
            autoscalingGroupName: autoScaling.name,
            name: `${props.name}-${props.project}-cpu-scaler`,
            policyType: "TargetTrackingScaling",
            targetTrackingConfiguration: {
                targetValue: props.cpuTargetValue,
                customizedMetricSpecification: {
                   metricName: "CPUReservation",
                   namespace: "AWS/ECS",
                   statistic: "Average", 
                   metricDimension: [{
                    name: "ClusterName",
                    value: props.ecsClusterName,
                   }],
                },
            },

        });

        new AutoscalingPolicy(this, `${props.name}-memory-auto-scaler`, {
            autoscalingGroupName: autoScaling.name,
            name: `${props.name}-${props.project}-memory-scaler`,
            policyType: "TargetTrackingScaling",
            targetTrackingConfiguration: {
                targetValue: props.memoryTargetValue,
                customizedMetricSpecification: {
                   metricName: "MemoryReservation",
                   namespace: "AWS/ECS",
                   statistic: "Average", 
                   metricDimension: [{
                    name: "ClusterName",
                    value: props.ecsClusterName,
                   }],
                },
            },

        });
    }
}

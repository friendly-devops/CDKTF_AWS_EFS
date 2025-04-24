import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { AppautoscalingTarget } from '@cdktf/provider-aws/lib/appautoscaling-target'
import { AppautoscalingPolicy } from '@cdktf/provider-aws/lib/appautoscaling-policy'

export interface AppAutoScalingConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    minCapacity: number,
    maxCapacity: number,
    cpuTargetValue: number,
    memoryTargetValue: number,
    ecsClusterName: string,
    ecsServiceName: string,
}

export class AppAutoScalingStack extends AwsStackBase {
    constructor(scope: Construct, id: string, props: AppAutoScalingConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        const appAutoScaling = new AppautoscalingTarget(this, `${props.name}-application-auto-scaler`, {
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity,
            resourceId: `service/${props.ecsClusterName}/${props.ecsServiceName}`,
            scalableDimension: "ecs:service:DesiredCount",
            serviceNamespace: "ecs",

        });

         new AppautoscalingPolicy(this, `${props.name}-cpu-app-auto-scaler-policy`, {
            name: `${props.name}-${props.project}-cpu-scaling-policy`,
            policyType: "TargetTrackingScaling",
            scalableDimension: appAutoScaling.scalableDimension,
            serviceNamespace: appAutoScaling.serviceNamespace,
            resourceId: appAutoScaling.resourceId,
            targetTrackingScalingPolicyConfiguration: {
                targetValue: props.cpuTargetValue,
                predefinedMetricSpecification: {
                   predefinedMetricType: "ECSServiceAverageCPUUtilization",
                },
            }

        });

         new AppautoscalingPolicy(this, `${props.name}-memory-app-auto-scaler-policy`, {
            name: `${props.name}-${props.project}-memory-scaling-policy`,
            policyType: "TargetTrackingScaling",
            scalableDimension: appAutoScaling.scalableDimension,
            serviceNamespace: appAutoScaling.serviceNamespace,
            resourceId: appAutoScaling.resourceId,
            targetTrackingScalingPolicyConfiguration: {
                targetValue: props.memoryTargetValue,
                predefinedMetricSpecification: {
                   predefinedMetricType: "ECSServiceAverageMemoryUtilization",
                },
            }

        });
    }
}

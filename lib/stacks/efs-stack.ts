import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { EfsFileSystem } from '@cdktf/provider-aws/lib/efs-file-system';
import { EfsAccessPoint } from '@cdktf/provider-aws/lib/efs-access-point';
import { EfsMountTarget } from '@cdktf/provider-aws/lib/efs-mount-target';
import { KmsKey } from '@cdktf/provider-aws/lib/kms-key';

export interface EfsConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    securityGroups: string[],
}

export class efsStack extends AwsStackBase {
    public efsAp: EfsAccessPoint;
    public efs: EfsFileSystem;
    constructor(scope: Construct, id: string, props: EfsConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: `${props.name}`,
            project: `${props.project}`,
            region: `${props.region}`,
        })

        const kmsKey = new KmsKey(this, `${props.name}-kms-key`, {
            description: "Encryption key for the efs filesystem",
        })

        this.efs = new EfsFileSystem(this, `${props.name}-efs`, {
            creationToken: `${props.name}-${props.project}-efs`,
            encrypted: true, 
            kmsKeyId: kmsKey.arn,


            tags: {
                Name: `${props.name}-${props.project}-efs`,
            }
        })

        new EfsMountTarget(this, `${props.name}-mount-target`, {
            fileSystemId: this.efs.id,
            subnetId: `${process.env.SUBNET}`,
            securityGroups: props.securityGroups,
        })

        this.efsAp = new EfsAccessPoint (this, `${props.name}-efsAP`, {
            fileSystemId: this.efs.id
        })
    }
}

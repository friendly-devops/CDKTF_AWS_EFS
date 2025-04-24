import { Construct } from 'constructs';
import { DbInstance } from '@cdktf/provider-aws/lib/db-instance';
import { AwsStackBase, BaseStackProps } from './stackbase';

export interface DbConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    dbAddress: string,
    dbName: string,
    fileSystemId: string,
    accessPointId: string
}

export class dbStack extends AwsStackBase {
    public db: DbInstance;
    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope,  `${props.name}-${id}`, {
            name: `${props.name}`,
            project: `${props.project}`,
            region: `${props.region}`
        })
        this.db = new DbInstance(this, `${props.name}-database`, {
            dbName: "nextcloud",
            username: `${process.env.USER}`,
            password: `${process.env.PASS}`,
            allocatedStorage : 8,
            engine: "mysql",
            publiclyAccessible: false,
            instanceClass: "db.t3.micro",
            skipFinalSnapshot: true,
            deleteAutomatedBackups: true
        });
    }
}

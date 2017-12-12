exports.handler = (event, context, callback) => {

    console.log('==== Recebendo evento:  ' + event);

    if (event.server !== undefined) {
        return require('./launching').provisionSite(event, callback);
    }
    if (event.detail.hasOwnProperty('LifecycleTransition')) {
        if (event.detail.LifecycleTransition == 'autoscaling:EC2_INSTANCE_LAUNCHING') {
            return require('./launching').provision(event.detail, context, callback);
        }
        if (event.detail.LifecycleTransition == 'autoscaling:EC2_INSTANCE_TERMINATING') {
            return require('./terminating').init(event.detail, context, callback);
        }
    }


}


if (process.env.NODE_ENV === 'local') {
    exports.handler({
        "version": "0",
        "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
        "detail-type": "EC2 Instance-launch Lifecycle Action",
        "source": "aws.autoscaling",
        "account": "123456789012",
        "time": "2015-12-22T18:43:48Z",
        "region": "us-east-1",
        "resources": [
    "arn:aws:autoscaling:us-east-1:123456789012:autoScalingGroup:59fcbb81-bd02-485d-80ce-563ef5b237bf:autoScalingGroupName/sampleASG"
  ],
        "detail": {
            "LifecycleActionToken": "c613620e-07e2-4ed2-a9e2-ef8258911ade",
            "AutoScalingGroupName": "sampleASG",
            "LifecycleHookName": "SampleLifecycleHook-12345",
            "EC2InstanceId": "i-01a3600dcdef47473",
            "LifecycleTransition": "autoscaling:EC2_INSTANCE_LAUNCHING"
        }
    }, null, function(data) {
        console.log(data);
    });
}

var self = module.exports = {};

var dotenv = require('dotenv');
if (process.env.NODE_ENV === 'local') {
    dotenv.load();
}

var request = require('axios');
var aws = require('./aws');
var forge = require('./forge-sdk');
var SSH = require('simple-ssh');

forge.config({
    baseURL: 'https://forge.laravel.com/api/v1/',
    headers: {
        'Authorization': 'Bearer ' + process.env.FORGE_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    //    agent: false
});

self.init = function(event_detail, callback) {
    aws.getServerInfo(event_detail.EC2InstanceId, function(instance) {

        public_ip = instance.Reservations[0].Instances[0].PublicIpAddress;
        private_ip = instance.Reservations[0].Instances[0].PrivateIpAddress;

        var servers = forge.servers().then(res => {
            var server = res.data.servers.find(item => item.ip_address === public_ip && item.private_ip_address === private_ip && item.region === 'VPS');

            if (server !== undefined && server.id) {
                forge.deleteServer(server.id).then(() => {
                    aws.completeLifecycleAction(event_detail);
                });
            }

        });


    });
}

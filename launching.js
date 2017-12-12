var self = module.exports = {};

var dotenv = require('dotenv');
if (process.env.NODE_ENV === 'local') {
    dotenv.load();
}

var request = require('axios');
var aws = require('./aws');
var forge = require('./forge-sdk');
var SSH = require('simple-ssh');

require('./utils');



forge.config({
    baseURL: 'https://forge.laravel.com/api/v1/',
    headers: {
        'Authorization': 'Bearer ' + process.env.FORGE_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    //    agent: false
});

self.provision = function(event_detail, context, callback) {

    aws.getServerInfo(event_detail.EC2InstanceId, function(instance) {

        public_ip = instance.Reservations[0].Instances[0].PublicIpAddress;
        private_ip = instance.Reservations[0].Instances[0].PrivateIpAddress;
        ram = 0;

        console.log('Public IP: ' + public_ip + ' - Private IP: ' + private_ip + ' - RAM: ' + ram);

        self.createServer(public_ip, private_ip, ram, res => {


            self.mount_provision(res.data);
            var server = res.data.server;
            // server = {

            //     "id": 168607,
            //     "credential_id": null,
            //     "name": "forge_autoscaling_12120520",
            //     "size": "0GB",
            //     "region": "VPS",
            //     "php_version": "php71",
            //     "ip_address": "54.83.178.106",
            //     "private_ip_address": "172.31.2.104",
            //     "blackfire_status": null,
            //     "papertrail_status": null,
            //     "revoked": false,
            //     "created_at": "2017-12-12 05:20:10",
            //     "is_ready": true,
            //     "network": []

            // };

            aws.createCloudWatchEventsRule(event_detail, context, server);
            //criar trigger

            //forge.deleteServer(server.id);

            // var server = {
            //     id: 168584,
            // };




            //forge.deleteServer(server.id);


        });
    });
}
self.provisionSite = function(event, callback) {

    self.createSite(event.server, site => {

        aws.disableCloudWatchEventsRule(server);

        self.installGitRepository(server, site);


        self.enableQuickDeploy(server, site);
        self.updateEnvFile(server, site, () => {
            self.updateSiteDeploymentScript(server, site, () => {
                self.deploy(server, site, () => {
                    aws.completeLifecycleAction(event.lifecycle_detail);
                });
            });
        });
        // });
    });
}

self.createServer = function(public_ip, private_id, ram, callback) {
    console.log('-- Creating server');

    var data = {
        provider: "custom",
        ip_address: public_ip,
        private_ip_address: private_ip,
        name: process.env.SITE_DOMAIN.replace('.', '_') + '_' + new Date().toISOString().replace(/[^0-9]/g, '').slice(4, 12),
        php_version: process.env.PHP_VERSION || 'php71',
        size: ram,
        region: process.env.AWS_REGION
    }

    return forge.createServer(data).then(callback);

}


self.mount_provision = function(res, callback) {

    if (res.server.is_ready === false) {
        var command = res.provision_command;
        command = command.replace('bash forge.sh', '; bash forge.sh; rm forge.sh');


        var ssh = new SSH({
            host: res.server.ip_address,
            user: 'ubuntu',
            key: Buffer.from(process.env.SSH_KEY, 'base64')
        });

        console.log('-- Executing provision commands by SSH');

        ssh
            //.exec('nohup /home/username/script.sh > /dev/null 2>&1 &', { // Nohup runs script in BG, > /dev/null redirects output. & also runs in BG. Trying to keep things fast to make alexa response time good.
            .exec("nohup sudo -s eval '" + command + "' > /tmp/provision.log 2>&1 &").start();
    }
}

self.checkProvision = function(server, callback) {

    console.log('-- Checking Server Provision');

    forge.server(server.id).then(res => {

        if (res.data.server.is_ready === true) {
            callback();
        }
    });


}
self.createSite = function(server, callback) {

    self.checkProvision(server, () => {
        console.log('-- Installing Site');

        forge.createSite(server.id, {
            domain: process.env.SITE_DOMAIN,
            project_type: process.env.SITE_PROJECT_TYPE || 'php',
            directory: process.env.SITE_DIRECTORY || '/public'
        }).then(res => {
            callback(res.data.site);
        });

    });
}
self.checkSiteInstallation = function(server, site, callback) {
    var interval = setInterval(function() {
        console.log('-- Checking Site Installation');

        forge.site(server.id, site.id).then(res => {
            if (res.data.site.status === 'installed') {
                clearInterval(interval);
                callback();
            }
        });

    }, 30000);
}
self.installGitRepository = function(server, site) {
    self.checkSiteInstallation(server, site, () => {
        console.log('-- Installing Git Repository');
        return forge.installGitRepositoryOnSite(server.id, site.id, {
            provider: process.env.GIT_PROVIDER || 'github',
            repository: process.env.GIT_REPOSITORY,
            branch: process.env.GIT_BRANCH || 'master',
            composer: process.env.RUN_COMPOSER || false,
            migrate: process.env.RUN_MIGRATE || false
        });
    })
}
self.checkGitInstallation = function(server, site, callback) {
    var interval = setInterval(function() {
        console.log('-- Checking Git Installation');
        forge.site(server.id, site.id).then(res => {
            if (res.data.site.repository_status === 'installed') {
                clearInterval(interval);
                callback();
            }
        });

    }, 10000);
}
self.updateEnvFile = function(server, site, callback) {

    callback = (typeof callback === 'function') ? callback : function() {};

    self.checkGitInstallation(server, site, () => {
        console.log('-- Getting Site Enviroment File');

        forge.siteEnvironmentFile(server.id, site.id).then(res => {

            var env_vars = dotenv.parse(res.data);

            var to_replace = Object.filter(process.env, 'ENV_');

            var data = [];
            var obj = Object.assign(env_vars, to_replace);


            Object.keys(obj).map(function(key) {
                data.push(key + '=' + obj[key]);
            });

            console.log('-- Updating Site Environment File');

            forge.updateSiteEnvironmentFile(server.id, site.id, data.join("\n")).then(callback);
        });
    });
}

self.updateSiteDeploymentScript = function(server, site, callback) {

    callback = (typeof callback === 'function') ? callback : function() {};

    self.checkGitInstallation(server, site, () => {
        console.log('-- Getting Site Deployment Script');

        forge.siteDeploymentScript(server.id, site.id).then(res => {

            var data = res.data.replace('migrate --force', 'inspire');

            console.log('-- Updating Site Deployment Script');

            forge.updateSiteDeploymentScript(server.id, site.id, data).then(callback);
        });
    });
}

self.enableQuickDeploy = function(server, site) {
    self.checkGitInstallation(server, site, () => {
        console.log('-- Enabling Quick Deploy');

        return forge.enableQuickDeploy(server.id, site.id);
    });
}
self.deploy = function(server, site, callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    console.log('-- Deploying...');
    return forge.deploySite(server.id, site.id).then(callback);
}

var fs = require('fs');
var forge = require('./forge-sdk')();

var request = require('./request')({
    host: 'forge.laravel.com',
    port: 443,
    headers: {
        'Authorization': 'Bearer ' + process.env.FORGE_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    agent: false
});



global.pullServerToForge = function(region, public_ip, private_ip, ram, callback) {
    var body = '';
    console.log('-- Pulling server to Forge');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers',
        method: 'POST'
    }), function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var data = JSON.parse(body);
            var id = data.server.id;
            console.log('Forge Server ID: ' + id);
            callback(data.server.ip_address, id, data.provision_command);
        });
    });

    request.write(JSON.stringify({
        provider: "custom",
        ip_address: public_ip,
        private_ip_address: private_ip,
        name: process.env.APP_NAME + '_' + new Date().toISOString().replace(/[^0-9]/g, '').slice(4, 12),
        php_version: process.env.PHP_VERSION,
        size: ram,
        region: region
    }));

    request.end();
}

global.provision = function(ip, command) {

    console.log('-- Accessing via SSH');

    var ssh = new SSH({
        host: ip,
        user: 'ubuntu',
        key: process.env.SSH_KEY
    });

    console.log('-- Provisioning...');


    //FORGE PROVISION COMAND FIX
    command = command.replace('bash forge.sh', '; sudo -S bash forge.sh; rm forge.sh');

    ssh.exec('sudo -S ' + command, {
        pty: true,
        out: console.log.bind(console)
    }).start();

}

global.checkProvision = function(forge_id, callback) {
    var body = '';
    console.log('-- Checking Provision...');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + forge_id,
        method: 'GET'
    }), function(res) {
        res.on('data', function(chunk) {

            body += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(body);
            callback(data.server.is_ready);
        });
    });

    request.write('');
    request.end();
}

global.createForgeSite = function(server_id, site_domain, site_project_type, site_directory, callback) {
    var body = '';
    console.log('-- Creating site on server');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites',
        method: 'POST'
    }), function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {

            var data = JSON.parse(body);


            var id = data.site.id;
            console.log('SiteID: ' + id);

            callback(id);
        });
    });

    request.write(JSON.stringify({
        domain: site_domain,
        project_type: site_project_type,
        directory: site_directory
    }));

    request.end();

}

global.installGitRepository = function(server_id, site_id, git_provider, git_repository, git_branch, run_composer, run_migrate, callback) {
    var body = '';
    console.log('-- Installing git on site: ' + git_provider + ' ' + git_repository + ' ' + git_branch);

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/git',
        method: 'POST'
    }), function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            callback();
        });
    });

    request.write(JSON.stringify({
        provider: git_provider,
        repository: git_repository,
        branch: git_branch,
        composer: run_composer,
        migrate: run_migrate
    }));

    request.end();
}

global.getEnvFile = function(server_id, site_id, callback) {
    var body = '';
    console.log('-- Getting .env');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/env',
        method: 'GET'
    }), function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            callback(body);
        });
    });

    request.write('');
    request.end();
}
global.updateEnvFile = function(server_id, site_id, callback) {
    getEnvFile(server_id, site_id, function(content) {


        console.log('-- Updating .env');


        var env_vars = dotenv.parse(content);
        var to_replace = Object.filter(process.env, 'ENV_');

        var data = [];
        var obj = Object.assign(env_vars, to_replace);

        Object.keys(obj).map(function(key) {
            data.push(key + '=' + obj[key]);
        });

        var body = '';
        var request = http.request(Object.assign(request_opts, {
            path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/env',
            method: 'PUT'
        }), function(res) {
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                console.log('-- Updated');
                callback();
            });
        });

        request.write(JSON.stringify({
            content: data.join("\n")
        }));

        request.end();


    });
}

global.enableQuickDeploy = function(server_id, site_id) {
    var body = '';
    console.log('-- Enabling Quick Deploy (Deploy on commit to branch)...');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/deployment',
        method: 'POST'
    }));

    request.write('');
    request.end();
}

global.deploy = function(server_id, site_id, callback) {
    var body = '';
    console.log('-- Deploying...');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/deployment/deploy',
        method: 'POST'
    }), function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            callback();
        });
    });

    request.write('');

    request.end();
}

global.updateDeploymentScript = function(server_id, site_id) {
    var body = '';
    console.log('-- Updating deployment script...');

    var request = http.request(Object.assign(request_opts, {
        path: '/api/v1/servers/' + server_id + '/sites/' + site_id + '/deployment/script',
        method: 'PUT'
    }));

    fs.readFile('deployment_script.sh', 'utf8', function(err, data) {
        if (err) {
            return console.log('No deployment script file founded... Aborting update');
        }

        request.write(JSON.stringify({
            content: data
        }));

        request.end();
    });

}

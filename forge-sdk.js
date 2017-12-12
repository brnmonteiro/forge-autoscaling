var axios = require('axios');

var request = axios.create();

module.exports = {



    config: function(config) {
        request = axios.create(config);
        request.interceptors.response.use(function(response) {
            // Do something with response data
            return response;
        }, function(error) {
            // Do something with response e
            console.log(error.response.data);
            return Promise.reject(error);
        });
    },

    // ---------------------------------
    // Servers
    // ---------------------------------

    servers: function() {
        return request.get(`servers`)
    },

    server: function(serverId) {
        return request.get(`servers/${serverId}`)
    },
    createServer: function(data) {
        return request.post(`servers`, data)
    },
    deleteServer: function(serverId) {
        return request.delete(`servers/${serverId}`)
    },
    rebootServer: function(serverId) {
        return request.post(`servers/${serverId}/reboot`)
    },






    // ---------------------------------
    // Services
    // ---------------------------------

    // MySQL
    rebootMysql: function(serverId) {
        return request.post(`servers/${serverId}/mysql/reboot`)
    },

    stopMysql: function(serverId) {
        return request.post(`servers/${serverId}/mysql/stop`)
    },

    // Postgres
    rebootPostgres: function(serverId) {
        return request.post(`servers/${serverId}/postgres/reboot`)
    },

    stopPostgres: function(serverId) {
        return request.post(`servers/${serverId}/postgres/stop`)
    },

    // NginX
    rebootNginx: function(serverId) {
        return request.post(`servers/${serverId}/nginx/reboot`)
    },

    stopNginx: function(serverId) {
        return request.post(`servers/${serverId}/nginx/stop`)
    },

    siteNginxFile: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/nginx`)
    },

    updateSiteNginxFile: function(serverId, siteId, content) {
        return request.put(`servers/${serverId}/sites/${siteId}/nginx`, {
            content
        })
    },

    // Blackfire 
    installBlackfire: function(serverId, data) {
        return request.post(`servers/${serverId}/blackfire/install`, data)
    },

    removeBlackfire: function(serverId) {
        return request.delete(`servers/${serverId}/blackfire/remove`)
    },

    // Papertrail
    installPapertrail: function(serverId, data) {
        return request.post(`servers/${serverId}/papertrail/install`, data)
    },

    removePapertrail: function(serverId) {
        return request.delete(`servers/${serverId}/papertrail/remove`)
    },






    // ---------------------------------
    // Daemons
    // ---------------------------------

    daemons: function(serverId) {
        return request.get(`servers/${serverId}/daemons`)
    },

    daemon: function(serverId, daemonId) {
        return request.get(`servers/${serverId}/daemons/${daemonId}`)
    },

    createDaemon: function(serverId, data) {
        return request.post(`servers/${serverId}/daemons`, data)
    },

    restartDaemon: function(serverId, daemonId) {
        return request.post(`servers/${serverId}/daemons/${daemonId}/restart`)
    },

    deleteDaemon: function(serverId, daemonId) {
        return request.delete(`servers/${serverId}/daemons/${daemonId}`)
    },






    // ---------------------------------
    // Firewall Rules
    // ---------------------------------

    firewallRules: function(serverId) {
        return request.get(`servers/${serverId}/firewall-rules`)
    },

    firewallRule: function(serverId, ruleId) {
        return request.get(`servers/${serverId}/firewall-rules/${ruleId}`)
    },

    createFirewallRule: function(serverId, data) {
        return request.post(`servers/${serverId}/firewall-rules`, data);
    },

    deleteFirewallRule: function(serverId, ruleId) {
        return request.delete(`servers/${serverId}/firewall-rules/${ruleId}`)
    },






    // ---------------------------------
    // Sites
    // ---------------------------------

    sites: function(serverId) {
        return request.get(`servers/${serverId}/sites`)
    },

    site: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}`)
    },

    createSite: function(serverId, data) {
        return request.post(`servers/${serverId}/sites`, data)
    },

    updateSite: function(serverId, siteId, data) {
        return request.put(`servers/${serverId}/sites/${siteId}`)
    },

    // NOT FOUND IN API DOCS --- @TODO: CHECK OUT FORGE PHP SDK
    // refreshSiteToken: function(serverId, siteId){}

    deleteSite: function(serverId, siteId) {
        return request.delete(`servers/${serverId}/sites/${siteId}`)
    },


    // Environment File
    siteEnvironmentFile: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/env`)
    },

    updateSiteEnvironmentFile: function(serverId, siteId, content) {
        return request.put(`servers/${serverId}/sites/${siteId}/env`, {
            content: content
        })
    },


    // Site Repositories and Deployments
    installGitRepositoryOnSite: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/git`, data)
    },

    // NOT FOUND IN API DOCS --- @TODO: CHECK OUT FORGE PHP SDK
    // updateSiteGitRepository: function(serverId, siteId, data){}

    destroySiteGitRepository: function(serverId, siteId) {
        return request.delete(`servers/${serverId}/sites/${siteId}/git`)
    },

    siteDeploymentScript: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/deployment/script`)
    },

    updateSiteDeploymentScript: function(serverId, siteId, content) {
        return request.put(`servers/${serverId}/sites/${siteId}/deployment/script`, {
            content: content
        })
    },

    enableQuickDeploy: function(serverId, siteId) {
        return request.post(`servers/${serverId}/sites/${siteId}/deployment`)
    },

    disableQuickDeploy: function(serverId, siteId) {
        return request.delete(`servers/${serverId}/sites/${siteId}/deployment`)
    },

    deploySite: function(serverId, siteId) {
        return request.post(`servers/${serverId}/sites/${siteId}/deployment/deploy`)
    },

    resetDeploymentState: function(serverId, siteId) {
        return request.post(`servers/${serverId}/sites/${siteId}/deployment/reset`)
    },

    siteDeploymentLog: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/deployment/log`)
    },


    // Notifications
    enableHipchatNotifications: function(serverId, siteId, data) {},

    disableHipchatNotifications: function(serverId, siteId) {},


    // Installing Wordpress
    installWordPress: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/wordpress`, data)
    },

    removeWordPress: function(serverId, siteId) {
        return request.delete(`servers/${serverId}/sites/${siteId}/wordpress`)
    },


    // Updating Load balancing Configuration
    updateLoadBalancingConfiguration: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/balancing`, data)
    },



    // ---------------------------------
    // Workers
    // ---------------------------------

    workers: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/workers`)
    },

    worker: function(serverId, siteId, workerId) {
        return request.get(`servers/${serverId}/sites/${siteId}/workers/${workerId}`)
    },

    createWorker: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/workers`, data)
    },

    deleteWorker: function(serverId, siteId, workerId) {
        return request.delete(`servers/${serverId}/sites/${siteId}/workers/${workerId}`)
    },

    restartWorker: function(serverId, siteId, workerId) {
        return request.post(`servers/${serverId}/sites/${siteId}/workers/${workerId}/restart`)
    },



    // ---------------------------------
    // Site SSL Certificates
    // ---------------------------------
    certificates: function(serverId, siteId) {
        return request.get(`servers/${serverId}/sites/${siteId}/certificates`)
    },

    certificate: function(serverId, siteId, certificateId) {
        return request.get(`servers/${serverId}/sites/${siteId}/certificates/${certificateId}`)
    },

    createCertificate: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/certificates`, data)
    },

    deleteCertificate: function(serverId, siteId, certificateId) {
        return request.delete(`servers/${serverId}/sites/${siteId}/certificates/${certificateId}`)
    },

    getCertificateSigningRequest: function(serverId, siteId, certificateId) {
        return request.get(`servers/${serverId}/sites/${siteId}/certificates/${certificateId}/csr`)
    },

    installCertificate: function(serverId, siteId, certificateId) {
        return request.post(`servers/${serverId}/sites/${siteId}/certificates/${certificateId}/install`, data)
    },

    activateCertificate: function(serverId, siteId, certificateId) {
        return request.post(`servers/${serverId}/sites/${siteId}/certificates/${certificateId}/activate`)
    },

    obtainLetsEncryptCertificate: function(serverId, siteId, data) {
        return request.post(`servers/${serverId}/sites/${siteId}/certificates/letsencrypt`, data)
    },



    // ---------------------------------
    // MySQL
    // ---------------------------------

    mysqlDatabases: function(serverId) {
        return request.get(`servers/${serverId}/mysql`, data)
    },

    mysqlDatabase: function(serverId, databaseId) {
        return request.get(`servers/${serverId}/mysql/${databaseId}`, data)
    },

    createMysqlDatabase: function(serverId, data) {
        return request.post(`servers/${serverId}/mysql`, data)
    },

    updateMysqlDatabase: function(serverId, databaseId, data) {
        return request.put(`servers/${serverId}/mysql/${databaseId}`, data)
    },

    deleteMysqlDatabase: function(serverId, databaseId) {
        return request.delete(`servers/${serverId}/mysql/${databaseId}`)
    },

    // Users
    mysqlUsers: function(serverId) {
        return request.get(`servers/${serverId}/mysql-users`, data)
    },

    mysqlUser: function(serverId, userId) {
        return request.get(`servers/${serverId}/mysql-users/${userId}`, data)
    },

    createMysqlUser: function(serverId, data) {
        return request.post(`servers/${serverId}/mysql-users`, data)
    },

    updateMysqlUser: function(serverId, userId, data) {
        return request.put(`servers/${serverId}/mysql-users/${userId}`, data)
    },

    deleteMysqlUser: function(serverId, userId) {
        return request.delete(`servers/${serverId}/mysql-users/${userId}`)
    }
}

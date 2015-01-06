'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // HTTP
        // HTTP BY DOMAIN
            var http_by_domain = require('../../controllers/http/http_by_domain')(pool);
            app.route('/api/http/http_by_domain')
            .get(auth.permission, http_by_domain.render);
            // HTTP BY DOMAIN LOCAL
                var http_by_domain_local = require('../../controllers/http/http_by_domain_local')(pool);
                app.route('/api/http/http_by_domain_local')
                .get(auth.permission, http_by_domain_local.render);
                // HTTP BY DOMAIN LOCAL DRILL
                    var http_by_domain_local_drill = require('../../controllers/http/http_by_domain_local_drill')(pool);
                    app.route('/api/http/http_by_domain_local_drill')
                    .get(auth.permission, http_by_domain_local_drill.render);
        // HTTP BY USER AGENT
            var http_by_user_agent = require('../../controllers/http/http_by_user_agent')(pool);
            app.route('/api/http/http_by_user_agent')
            .get(auth.permission, http_by_user_agent.render);
            // HTTP BY USER AGENT LOCAL
                var http_by_user_agent_local = require('../../controllers/http/http_by_user_agent_local')(pool);
                app.route('/api/http/http_by_user_agent_local')
                .get(auth.permission, http_by_user_agent_local.render);
                // HTTP BY USER AGENT LOCAL DRILL
                    var http_by_user_agent_local_drill = require('../../controllers/http/http_by_user_agent_local_drill')(pool);
                    app.route('/api/http/http_by_user_agent_local_drill')
                    .get(auth.permission, http_by_user_agent_local_drill.render);
        // HTTP LOCAL
            var http_local = require('../../controllers/http/http_local')(pool);
            app.route('/api/http/http_local')
            .get(auth.permission, http_local.render);    
            // HTTP LOCAL BY DOMAIN
                var http_local_by_domain = require('../../controllers/http/http_local_by_domain')(pool);
                app.route('/api/http/http_local_by_domain')
                .get(auth.permission, http_local_by_domain.render);
        // HTTP REMOTE
            var http_remote = require('../../controllers/http/http_remote')(pool);
            app.route('/api/http/http_remote')
            .get(auth.permission, http_remote.render);
            // HTTP REMOTE2LOCAL
                var http_remote2local = require('../../controllers/http/http_remote2local')(pool);
                app.route('/api/http/http_remote2local')
                .get(auth.permission, http_remote2local.render);
                // HTTP REMOTE2LOCAL DRILL
                    var http_remote2local_drill = require('../../controllers/http/http_remote2local_drill')(pool);
                    app.route('/api/http/http_remote2local_drill')
                    .get(auth.permission, http_remote2local_drill.render);
        // HTTP LOCAL BLOCKED
            var http_local_blocked = require('../../controllers/http/http_local_blocked')(pool);
            app.route('/api/http/http_local_blocked')
            .get(auth.permission, http_local_blocked.render);    
            // HTTP LOCAL BY DOMAIN BLOCKED
                var http_local_by_domain_blocked = require('../../controllers/http/http_local_by_domain_blocked')(pool);
                app.route('/api/http/http_local_by_domain_blocked')
                .get(auth.permission, http_local_by_domain_blocked.render);
                // HTTP BY DOMAIN LOCAL DRILL BLOCKED
                    var http_by_domain_local_drill_blocked = require('../../controllers/http/http_by_domain_local_drill_blocked')(pool);
                    app.route('/api/http/http_by_domain_local_drill_blocked')
                    .get(auth.permission, http_by_domain_local_drill_blocked.render);
    
};

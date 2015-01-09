'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // HTTP
        // HTTP BY DOMAIN
            var http_by_domain = require('../../controllers/http/http_by_domain')(pool);
            // TABLE
            app.route('/api/http/http_by_domain/table').get(auth.permission, http_by_domain.table);
            // HTTP BY DOMAIN LOCAL
                var http_by_domain_local = require('../../controllers/http/http_by_domain_local')(pool);
                // TABLE
                app.route('/api/http/http_by_domain_local/table').get(auth.permission, http_by_domain_local.table);
                // HTTP BY DOMAIN LOCAL DRILL
                    var http_by_domain_local_drill = require('../../controllers/http/http_by_domain_local_drill')(pool);
                    // TABLE
                    app.route('/api/http/http_by_domain_local_drill/table').get(auth.permission, http_by_domain_local_drill.table); 
        // HTTP BY USER AGENT
            var http_by_user_agent = require('../../controllers/http/http_by_user_agent')(pool);
            // CROSSFILTER
            app.route('/api/http/http_by_user_agent/crossfilter').get(auth.permission, http_by_user_agent.crossfilter);
            // TABLE
            app.route('/api/http/http_by_user_agent/table').get(auth.permission, http_by_user_agent.table);
            // HTTP BY USER AGENT LOCAL
                var http_by_user_agent_local = require('../../controllers/http/http_by_user_agent_local')(pool);
                // TABLE
                app.route('/api/http/http_by_user_agent_local/table').get(auth.permission, http_by_user_agent_local.table); 
                // HTTP BY USER AGENT LOCAL DRILL
                    var http_by_user_agent_local_drill = require('../../controllers/http/http_by_user_agent_local_drill')(pool);
                // TABLE
                app.route('/api/http/http_by_user_agent_local_drill/table').get(auth.permission, http_by_user_agent_local_drill.table); 
        // HTTP LOCAL
            var http_local = require('../../controllers/http/http_local')(pool);   
            // TABLE
            app.route('/api/http/http_local/table').get(auth.permission, http_local.table); 
            // HTTP LOCAL BY DOMAIN
                var http_local_by_domain = require('../../controllers/http/http_local_by_domain')(pool);
                // TABLE
                app.route('/api/http/http_local_by_domain/table').get(auth.permission, http_local_by_domain.table); 
        // HTTP REMOTE
            var http_remote = require('../../controllers/http/http_remote')(pool);
            // CROSSFILTER
            app.route('/api/http/http_remote/crossfilter').get(auth.permission, http_remote.crossfilter);
            // TABLE
            app.route('/api/http/http_remote/table').get(auth.permission, http_remote.table);
            // HTTP REMOTE2LOCAL
                var http_remote2local = require('../../controllers/http/http_remote2local')(pool);
                // TABLE
                app.route('/api/http/http_remote2local/table').get(auth.permission, http_remote2local.table); 
                // HTTP REMOTE2LOCAL DRILL
                    var http_remote2local_drill = require('../../controllers/http/http_remote2local_drill')(pool);
                    // TABLE
                    app.route('/api/http/http_remote2local_drill/table').get(auth.permission, http_remote2local_drill.table); 
        // HTTP LOCAL BLOCKED
            var http_local_blocked = require('../../controllers/http/http_local_blocked')(pool);
            // TABLE
            app.route('/api/http/http_local_blocked/table').get(auth.permission, http_local_blocked.table);    
            // HTTP LOCAL BY DOMAIN BLOCKED
                var http_local_by_domain_blocked = require('../../controllers/http/http_local_by_domain_blocked')(pool);
                // TABLE
                app.route('/api/http/http_local_by_domain_blocked/table').get(auth.permission, http_local_by_domain_blocked.table); 
                // HTTP BY DOMAIN LOCAL DRILL BLOCKED
                    var http_by_domain_local_drill_blocked = require('../../controllers/http/http_by_domain_local_drill_blocked')(pool);
                    // TABLE
                    app.route('/api/http/http_by_domain_local_drill_blocked/table').get(auth.permission, http_by_domain_local_drill_blocked.table); 
    
};

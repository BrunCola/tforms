'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // EXTRACTED FILES
        // BY MIME TYPE
            var files_by_mime_type = require('../../controllers/extracted_files/files_by_mime_type')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_mime_type/crossfilter').get(auth.permission, files_by_mime_type.crossfilter);
            // TABLE
            app.route('/api/extracted_files/files_by_mime_type/table').get(auth.permission, files_by_mime_type.table);
            // FILE MIME LOCAL
                var files_mime_local = require('../../controllers/extracted_files/files_mime_local')(pool);
                app.route('/api/extracted_files/files_mime_local')
                .get(auth.permission, files_mime_local.render);
        // BY LOCAL IP
            var files_by_local_ip = require('../../controllers/extracted_files/files_by_local_ip')(pool);
            // TABLE
            app.route('/api/extracted_files/files_by_local_ip/table').get(auth.permission, files_by_local_ip.table);
            // BY FILE NAME
                var files_by_file_name = require('../../controllers/extracted_files/files_by_file_name')(pool);
                app.route('/api/extracted_files/files_by_file_name')
                .get(auth.permission, files_by_file_name.render);
                // FILE LOCAL
                    var files_local = require('../../controllers/extracted_files/files_local')(pool);
                    app.route('/api/extracted_files/files_local')
                    .get(auth.permission, files_local.render);
        // BY REMOTE IP
            var files_by_remote_ip = require('../../controllers/extracted_files/files_by_remote_ip')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_remote_ip/crossfilter').get(auth.permission, files_by_remote_ip.crossfilter);
            // TABLE
            app.route('/api/extracted_files/files_by_remote_ip/table').get(auth.permission, files_by_remote_ip.table);
            // BY FILE NAME REMOTE
                var files_by_file_name_remote = require('../../controllers/extracted_files/files_by_file_name_remote')(pool);
                app.route('/api/extracted_files/files_by_file_name_remote')
                .get(auth.permission, files_by_file_name_remote.render); 
               // FILE REMOTE
                    var files_remote = require('../../controllers/extracted_files/files_remote')(pool);
                    app.route('/api/extracted_files/files_remote')
                    .get(auth.permission, files_remote.render);
        // BY DOMAIN
            var files_by_domain = require('../../controllers/extracted_files/files_by_domain')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_domain/crossfilter').get(auth.permission, files_by_domain.crossfilter);
            // TABLE
            app.route('/api/extracted_files/files_by_domain/table').get(auth.permission, files_by_domain.table);
            // BY DOMAIN LOCAL
                var files_by_domain_local = require('../../controllers/extracted_files/files_by_domain_local')(pool);
                app.route('/api/extracted_files/files_by_domain_local')
                .get(auth.permission, files_by_domain_local.render);
                // BY DOMAIN LOCAL MIME
                    var files_by_domain_local_mime = require('../../controllers/extracted_files/files_by_domain_local_mime')(pool);
                    app.route('/api/extracted_files/files_by_domain_local_mime')
                    .get(auth.permission, files_by_domain_local_mime.render);
                    // BY DOMAIN LOCAL MIME DRILL
                        var files_by_domain_local_mime_drill = require('../../controllers/extracted_files/files_by_domain_local_mime_drill')(pool);
                        app.route('/api/extracted_files/files_by_domain_local_mime_drill')
                        .get(auth.permission, files_by_domain_local_mime_drill.render);
    
};

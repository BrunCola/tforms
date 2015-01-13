'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // EXTRACTED FILES
        // BY MIME TYPE
            var files_by_mime_type = require('../../controllers/extracted_files/files_by_mime_type')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_mime_type/crossfilter').get(auth.permission, files_by_mime_type.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/extracted_files/files_by_mime_type/crossfilterpie').get(auth.permission, files_by_mime_type.crossfilterpie);
            // TABLE
            app.route('/api/extracted_files/files_by_mime_type/table').get(auth.permission, files_by_mime_type.table);
            // FILE MIME LOCAL
                var files_mime_local = require('../../controllers/extracted_files/files_mime_local')(pool);
                // TABLE
                app.route('/api/extracted_files/files_mime_local/table').get(auth.permission, files_mime_local.table);
        // BY LOCAL IP
            var files_by_local_ip = require('../../controllers/extracted_files/files_by_local_ip')(pool);
            // TABLE
            app.route('/api/extracted_files/files_by_local_ip/table').get(auth.permission, files_by_local_ip.table);
            // BY FILE NAME
                var files_by_file_name = require('../../controllers/extracted_files/files_by_file_name')(pool);
                // TABLE
                app.route('/api/extracted_files/files_by_file_name/table').get(auth.permission, files_by_file_name.table);
                // FILE LOCAL
                    var files_local = require('../../controllers/extracted_files/files_local')(pool);
                    // TABLE
                    app.route('/api/extracted_files/files_local/table').get(auth.permission, files_local.table);
        // BY REMOTE IP
            var files_by_remote_ip = require('../../controllers/extracted_files/files_by_remote_ip')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_remote_ip/crossfilter').get(auth.permission, files_by_remote_ip.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/extracted_files/files_by_remote_ip/crossfilterpie').get(auth.permission, files_by_remote_ip.crossfilterpie);
            // TABLE
            app.route('/api/extracted_files/files_by_remote_ip/table').get(auth.permission, files_by_remote_ip.table);
            // BY FILE NAME REMOTE
                var files_by_file_name_remote = require('../../controllers/extracted_files/files_by_file_name_remote')(pool);
                // TABLE
                app.route('/api/extracted_files/files_by_file_name_remote/table').get(auth.permission, files_by_file_name_remote.table);
               // FILE files_by_file_name_remote
                    var files_remote = require('../../controllers/extracted_files/files_remote')(pool);
                    // TABLE
                    app.route('/api/extracted_files/files_remote/table').get(auth.permission, files_remote.table);
        // BY DOMAIN
            var files_by_domain = require('../../controllers/extracted_files/files_by_domain')(pool);
            // CROSSFILTER
            app.route('/api/extracted_files/files_by_domain/crossfilter').get(auth.permission, files_by_domain.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/extracted_files/files_by_domain/crossfilterpie').get(auth.permission, files_by_domain.crossfilterpie);
            // TABLE
            app.route('/api/extracted_files/files_by_domain/table').get(auth.permission, files_by_domain.table);
            // BY DOMAIN LOCAL
                var files_by_domain_local = require('../../controllers/extracted_files/files_by_domain_local')(pool);
                // TABLE
                app.route('/api/extracted_files/files_by_domain_local/table').get(auth.permission, files_by_domain_local.table);
                // BY DOMAIN LOCAL MIME
                    var files_by_domain_local_mime = require('../../controllers/extracted_files/files_by_domain_local_mime')(pool);
                    // TABLE
                    app.route('/api/extracted_files/files_by_domain_local_mime/table').get(auth.permission, files_by_domain_local_mime.table);
                    // BY DOMAIN LOCAL MIME DRILL
                        var files_by_domain_local_mime_drill = require('../../controllers/extracted_files/files_by_domain_local_mime_drill')(pool);
                        // TABLE
                        app.route('/api/extracted_files/files_by_domain_local_mime_drill/table').get(auth.permission, files_by_domain_local_mime_drill.table);
    
};

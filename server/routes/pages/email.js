'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // EMAIL
        // LOCAL SMTP
            var smtp_senders = require('../../controllers/email/smtp_senders')(pool);
            // TABLE
            app.route('/api/email/smtp_senders/table').get(auth.permission, smtp_senders.table);
            // SMTP SENDER2RECEIVER
                var smtp_sender2receiver = require('../../controllers/email/smtp_sender2receiver')(pool);
                // TABLE
                app.route('/api/email/smtp_sender2receiver/table').get(auth.permission, smtp_sender2receiver.table);
                // SMTP FROM SENDER
                    var smtp_from_sender = require('../../controllers/email/smtp_from_sender')(pool);
                    // TABLE
                    app.route('/api/email/smtp_from_sender/table').get(auth.permission, smtp_from_sender.table);
        // SMTP RECEIVERS
            var smtp_receivers = require('../../controllers/email/smtp_receivers')(pool);
            // TABLE
            app.route('/api/email/smtp_receivers/table').get(auth.permission, smtp_receivers.table);
            // SMTP RECEIVER2SENDER
                var smtp_receiver2sender = require('../../controllers/email/smtp_receiver2sender')(pool)
                // TABLE
                app.route('/api/email/smtp_receiver2sender/table').get(auth.permission, smtp_receiver2sender.table);
        // SMTP SUBJECTS
            var smtp_subjects = require('../../controllers/email/smtp_subjects')(pool);
            // TABLE
            app.route('/api/email/smtp_subjects/table').get(auth.permission, smtp_subjects.table);
            // SMTP SUBJECT SENDER RECEIVER PAIRS
                var smtp_subject_sender_receiver_pairs = require('../../controllers/email/smtp_subject_sender_receiver_pairs')(pool)
                // TABLE
                app.route('/api/email/smtp_subject_sender_receiver_pairs/table').get(auth.permission, smtp_subject_sender_receiver_pairs.table);
                // SMTP FROM SENDER BY SUBJECT
                    var smtp_from_sender_by_subject = require('../../controllers/email/smtp_from_sender_by_subject')(pool)
                    // TABLE
                    app.route('/api/email/smtp_from_sender_by_subject/table').get(auth.permission, smtp_from_sender_by_subject.table);
};
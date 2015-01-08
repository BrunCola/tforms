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
                app.route('/api/email/smtp_sender2receiver')
                .get(auth.permission, smtp_sender2receiver.render);
                // SMTP FROM SENDER
                    var smtp_from_sender = require('../../controllers/email/smtp_from_sender')(pool);
                    app.route('/api/email/smtp_from_sender')
                    .get(auth.permission, smtp_from_sender.render);
        // SMTP RECEIVERS
            var smtp_receivers = require('../../controllers/email/smtp_receivers')(pool);
            // TABLE
            app.route('/api/email/smtp_receivers/table').get(auth.permission, smtp_receivers.table);
            // SMTP RECEIVER2SENDER
                var smtp_receiver2sender = require('../../controllers/email/smtp_receiver2sender')(pool)
                app.route('/api/email/smtp_receiver2sender')
                .get(auth.permission, smtp_receiver2sender.render);
        // SMTP SUBJECTS
            var smtp_subjects = require('../../controllers/email/smtp_subjects')(pool);
            // TABLE
            app.route('/api/email/smtp_subjects/table').get(auth.permission, smtp_subjects.table);
            // SMTP SUBJECT SENDER RECEIVER PAIRS
                var smtp_subject_sender_receiver_pairs = require('../../controllers/email/smtp_subject_sender_receiver_pairs')(pool)
                app.route('/api/email/smtp_subject_sender_receiver_pairs')
                .get(auth.permission, smtp_subject_sender_receiver_pairs.render);
                // SMTP FROM SENDER BY SUBJECT
                    var smtp_from_sender_by_subject = require('../../controllers/email/smtp_from_sender_by_subject')(pool)
                    app.route('/api/email/smtp_from_sender_by_subject')
                    .get(auth.permission, smtp_from_sender_by_subject.render);
};

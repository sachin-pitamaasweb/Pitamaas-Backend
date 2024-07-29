const nodemailer = require('nodemailer');
// Placeholder functions for sending notifications
const sendNotification = (recipient, message) => {
    // Implement your notification logic here
    console.log(`Notification sent to ${recipient}: ${message}`);
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or another email service
    auth: {
        user: 'sachingautam6239@gmail.com',
        pass: 'nxajuvwkblihqind'
    }
});

// Helper function to send emails
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'sachingautam6239@gmail.com',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


const getPost = async (postId, clientId, socialAccount) => {
    try {
        const response = await axios.get(`http://localhost:3000/IdeaUploader`, {
            params: {
                Id: postId,
                ClientId: clientId,
                SocialAccount: socialAccount
            }
        });
        return response.data[0];
    } catch (err) {
        console.error('JSON server query error', err);
        throw err;
    }
};

// Helper function to update post status on JSON server
const updatePostStatus = async (postId, status, automated = false) => {
    try {
        const response = await axios.patch(`http://localhost:3000/IdeaUploader/${postId}`, {
            status,
            automated
        });
        return response.data;
    } catch (err) {
        console.error('JSON server update error', err);
        throw err;
    }
};

const approvePost = async (req, res) => {
    const postId = req.params.postId;
    const clientId = req.body.clientId;
    const socialAccount = req.body.socialAccount;

    try {
        const post = await getPost(postId, clientId, socialAccount);
        if (post) {
            await updatePostStatus(postId, clientId, socialAccount, 'approved');
            sendEmail('admin@example.com', 'Post Approved', `Post ${postId} has been approved.`);
            sendNotification('admin', `Post ${postId} has been approved.`);
            if (post.automated) {
                sendNotification('client', `Post ${postId} has been approved automatically.`);
                sendEmail('client@example.com', 'Post Approved', `Your post ${postId} has been approved automatically.`);
            }
            res.status(200).send({ message: 'Post approved successfully.' });
        } else {
            res.status(404).send({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal server error.' });
    }
};

const rejectPost = async (req, res) => {
    const postId = req.params.postId;
    const reason = req.body.reason;
    const clientId = req.body.clientId;
    const socialAccount = req.body.socialAccount;

    try {
        const post = await getPost(postId, clientId, socialAccount);
        if (post) {
            await updatePostStatus(postId, clientId, socialAccount, 'rejected');
            sendEmail('admin@example.com', 'Post Rejected', `Post ${postId} has been rejected. Reason: ${reason}`);
            sendEmail('design@example.com', 'Post Rejected', `Post ${postId} has been rejected. Reason: ${reason}`);
            sendNotification('admin', `Post ${postId} has been rejected. Reason: ${reason}`);
            sendNotification('design', `Post ${postId} has been rejected. Reason: ${reason}`);
            res.status(200).send({ message: 'Post rejected successfully.' });
        } else {
            res.status(404).send({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal server error.' });
    }
};

const correctionPost = async (req, res) => {
    const postId = req.params.postId;
    const reason = req.body.reason;
    const clientId = req.body.clientId;
    const socialAccount = req.body.socialAccount;

    try {
        const post = await getPost(postId, clientId, socialAccount);
        if (post) {
            await updatePostStatus(postId, clientId, socialAccount, 'correction');
            sendEmail('admin@example.com', 'Post Correction', `Post ${postId} requires correction. Reason: ${reason}`);
            sendEmail('design@example.com', 'Post Correction', `Post ${postId} requires correction. Reason: ${reason}`);
            sendNotification('admin', `Post ${postId} requires correction. Reason: ${reason}`);
            sendNotification('design', `Post ${postId} requires correction. Reason: ${reason}`);
            res.status(200).send({ message: 'Correction requested successfully.' });
        } else {
            res.status(404).send({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal server error.' });
    }
};

// Automatic Approval after 1 hour
const autoApprovePost = (postId, clientId, socialAccount) => {
    setTimeout(async () => {
        try {
            const post = await getPost(postId, clientId, socialAccount);
            if (post && post.status === 'pending') {
                await updatePostStatus(postId, clientId, socialAccount, 'approved', true);
                sendNotification('admin', `Post ${postId} has been approved automatically.`);
                sendEmail('admin@example.com', 'Post Approved Automatically', `Post ${postId} has been approved automatically.`);
                sendNotification('client', `Your post ${postId} has been approved automatically.`);
                sendEmail('client@example.com', 'Post Approved Automatically', `Your post ${postId} has been approved automatically.`);
            }
        } catch (error) {
            console.error('Auto-approval error', error);
        }
    }, 3600000); // 1 hour in milliseconds
};

module.exports = {
    approvePost,
    rejectPost,
    correctionPost,
    autoApprovePost
};

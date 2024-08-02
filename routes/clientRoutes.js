const express = require('express');
const {
    getClients,
    getNonRepeatedClients,
    getUniqueRecords,
    getDuplicateRecords,
    getClientEnrollment,
    getIdeaUploader,
    getPostSchedular,
    getIdeaUploaderByClientId,
    getPlans,
    getPannsByPlanId,
    getClientEnrollmentByClientId,
    getIdeaUploaderByClientIdAndSocialAccount,
    getActiveClients,
    login,
    getIdeaUploaderByClientIdAndSocialAccountAndPostId,
    getAddMonthlyAmount,
    getAddVouchar,
    getClientData,
    staffDetials,
    getStaffDetailsById,
    postApprovedByClient,
    domNotifications,
    postRejectedByClient,
    postCorrectedByClient,
    newStaffDetials,
    getClientInfoByClientId,
    getActiveClient
} = require('../controllers/clientController');

const router = express.Router();

// Define routes
router.get('/clients', getClients);
router.post('/login', login);
router.get('/non-repeated-clients', getNonRepeatedClients);
router.get('/active-clients', getActiveClients);
router.get('/unique-records', getUniqueRecords);
router.get('/duplicate-records', getDuplicateRecords);
router.get('/client-enrollment', getClientEnrollment);
router.get('/idea-uploader', getIdeaUploader);
router.get('/post-schedular', getPostSchedular);
router.get('/idea-uploader/:clientId', getIdeaUploaderByClientId);
router.get('/plans', getPlans);
router.get('/get-plans-by-plan-id/:planId', getPannsByPlanId);
router.get('/client-enrollment/:clientId', getClientEnrollmentByClientId);
router.post('/idea-uploader-by-client-id-and-social-account', getIdeaUploaderByClientIdAndSocialAccount);
router.post('/idea-uploader-by-client-id-and-social-account-and-post-id', getIdeaUploaderByClientIdAndSocialAccountAndPostId);
router.get('/add-monthly-amount', getAddMonthlyAmount);
router.get('/add-vouchar', getAddVouchar);
router.post('/client-data', getClientData);
router.get('/staff-details', staffDetials);
router.get('/staff-details/:id', getStaffDetailsById);
router.post('/post-approved-by-client', postApprovedByClient);
router.get('/dom-notifications', domNotifications);
router.post('/post-reject-by-client', postRejectedByClient);
router.post('/post-corrected-by-client', postCorrectedByClient);
router.get('/new-staff-detials', newStaffDetials);
router.get('/client-info/:clientId', getClientInfoByClientId);
router.get('/active-client-data', getActiveClient);

module.exports = router;

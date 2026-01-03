import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';

const router = Router();

// POST /notifications/queue/delayed
router.post('/queue/delayed', NotificationsController.sendQueueDelayedEmail);

// POST /notifications/queue/almost-ready
router.post('/queue/almost-ready', NotificationsController.sendQueueAlmostReadyEmail);

// POST /notifications/queue/ready
router.post('/queue/ready', NotificationsController.sendQueueReadyEmail);

export default router;

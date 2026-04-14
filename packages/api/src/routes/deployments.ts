import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/deployments/:id — Get a single deployment (with logs)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!deployment) {
      return res.status(404).json({ success: false, error: 'Deployment not found' });
    }
    res.json({ success: true, data: deployment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deployment' });
  }
});

// POST /api/deployments — Trigger a new deployment for a project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, commitHash, commitMsg } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, error: 'projectId is required' });
    }

    // Create the deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        commitHash: commitHash || null,
        commitMsg: commitMsg || null,
        status: 'QUEUED',
      },
    });

    // TODO: Queue build job in Redis (next step)
    // await buildQueue.add('build', { deploymentId: deployment.id });

    res.status(201).json({
      success: true,
      message: 'Deployment queued successfully',
      data: deployment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to trigger deployment' });
  }
});

export default router;

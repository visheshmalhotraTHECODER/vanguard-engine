import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { queueBuildJob } from '../lib/queue.js';

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

    // Fetch project to get repoUrl
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        deployments: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Create deployment record in DB
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        commitHash: commitHash || null,
        commitMsg: commitMsg || null,
        status: 'QUEUED',
      },
    });

    // Get previous running container ID for zero-downtime swap
    const previousDeploy = project.deployments[0];
    const previousContainerId = previousDeploy?.containerId ?? undefined;

    // Queue the build job — build-service picks this up
    await queueBuildJob({
      deploymentId: deployment.id,
      projectId: project.id,
      repoUrl: project.repoUrl,
      previousContainerId: previousContainerId || undefined,
    });

    // Mark as BUILDING
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: 'BUILDING', startedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      message: 'Deployment queued. Connect to WebSocket for live logs.',
      data: deployment,
      wsChannel: `logs:${deployment.id}`,
    });
  } catch (error: any) {
    console.error('[Deployments] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger deployment' });
  }
});

export default router;

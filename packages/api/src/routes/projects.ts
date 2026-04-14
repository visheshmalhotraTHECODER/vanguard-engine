import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/projects — List all projects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Latest deployment only
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id — Get a single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { deployments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// POST /api/projects — Create a new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, repoUrl, subdomain, userId } = req.body;

    if (!name || !repoUrl || !subdomain || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, repoUrl, subdomain, userId',
      });
    }

    const project = await prisma.project.create({
      data: { name, repoUrl, subdomain, userId },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Subdomain already taken' });
    }
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// DELETE /api/projects/:id — Delete a project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

export default router;

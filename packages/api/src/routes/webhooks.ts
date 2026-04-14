import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { queueBuildJob } from '../lib/queue.js';
import { verifyGithubWebhook } from '../middleware/verifyWebhook.js';

const router = Router();

/**
 * POST /api/webhooks/github
 * 
 * Endpoint registered in GitHub → Settings → Webhooks.
 * Triggered on every `push` event to the connected repository.
 *
 * Flow:
 * 1. Verify HMAC signature (security)
 * 2. Parse the push payload (branch, commit info, repo URL)
 * 3. Find the matching Vanguard project by repoUrl
 * 4. Create a Deployment record
 * 5. Queue a build job → build-service picks it up
 */
router.post(
  '/github',
  verifyGithubWebhook,
  async (req: Request, res: Response) => {
    const event = req.headers['x-github-event'] as string;

    // We only care about push events
    if (event !== 'push') {
      return res.json({ ignored: true, reason: `Skipping event: ${event}` });
    }

    const payload = req.body;
    const repoUrl: string = payload?.repository?.clone_url || payload?.repository?.html_url;
    const branch: string = payload?.ref?.replace('refs/heads/', '') || 'main';
    const commitHash: string = payload?.after || '';
    const commitMsg: string = payload?.head_commit?.message || '';
    const pusherName: string = payload?.pusher?.name || 'unknown';

    console.log(`[Webhook] 📨 Push event received`);
    console.log(`[Webhook]    Repo    : ${repoUrl}`);
    console.log(`[Webhook]    Branch  : ${branch}`);
    console.log(`[Webhook]    Commit  : ${commitHash.slice(0, 7)} — "${commitMsg}"`);
    console.log(`[Webhook]    Pusher  : ${pusherName}`);

    if (!repoUrl) {
      return res.status(400).json({ error: 'Missing repository URL in payload' });
    }

    // Only deploy on pushes to main/master by default
    if (!['main', 'master'].includes(branch)) {
      console.log(`[Webhook] ⏭️  Branch "${branch}" is not main/master — skipping`);
      return res.json({
        ignored: true,
        reason: `Branch "${branch}" is not configured for auto-deploy`,
      });
    }

    // Find the project linked to this repo
    // We match on both HTTPS and SSH URL formats
    const httpsUrl = repoUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '');

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { repoUrl: repoUrl },
          { repoUrl: httpsUrl },
          { repoUrl: httpsUrl + '.git' },
        ],
      },
      include: {
        deployments: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      console.warn(`[Webhook] ⚠️  No project found for repo: ${repoUrl}`);
      return res.status(404).json({
        error: 'No project found',
        message: `No Vanguard project is linked to repo: ${repoUrl}`,
        hint: 'Create a project in the dashboard and link this repository.',
      });
    }

    console.log(`[Webhook] ✅ Matched project: ${project.name} (${project.id})`);

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId: project.id,
        commitHash: commitHash || null,
        commitMsg: commitMsg || null,
        status: 'QUEUED',
      },
    });

    // Get previous container for zero-downtime swap
    const previousContainerId = project.deployments[0]?.containerId ?? undefined;

    // Queue the build job
    await queueBuildJob({
      deploymentId: deployment.id,
      projectId: project.id,
      repoUrl: project.repoUrl,
      subdomain: project.subdomain,
      previousContainerId: previousContainerId || undefined,
    });

    // Mark as BUILDING
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: 'BUILDING', startedAt: new Date() },
    });

    console.log(`[Webhook] 🚀 Deployment queued: ${deployment.id}`);

    // Respond immediately — GitHub expects fast response (< 10s)
    return res.status(202).json({
      accepted: true,
      deploymentId: deployment.id,
      project: project.name,
      wsChannel: `logs:${deployment.id}`,
      message: `Deployment triggered for ${project.name}. Watch live logs at /deployments/${deployment.id}`,
    });
  }
);

export default router;

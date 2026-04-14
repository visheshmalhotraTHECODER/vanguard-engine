import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * GitHub Webhook Signature Verifier
 *
 * GitHub signs every webhook payload with HMAC-SHA256 using your secret.
 * We verify this signature to ensure the request is actually from GitHub
 * and not from a random attacker trying to trigger fake deployments.
 *
 * Header format: X-Hub-Signature-256: sha256=<hmac>
 *
 * IMPORTANT: We use timingSafeEqual (constant-time comparison) to prevent
 * timing attacks — a classic security gotcha that interviewers love.
 */
export function verifyGithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[Webhook] ⚠️  GITHUB_WEBHOOK_SECRET not set — skipping verification');
    return next();
  }

  const signature = req.headers['x-hub-signature-256'] as string;

  if (!signature) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-Hub-Signature-256 header',
    });
    return;
  }

  // Compute expected HMAC
  const body = JSON.stringify(req.body);
  const hmac = createHmac('sha256', secret);
  hmac.update(body);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;

  // Constant-time comparison (prevents timing attacks)
  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid webhook signature',
      });
      return;
    }
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

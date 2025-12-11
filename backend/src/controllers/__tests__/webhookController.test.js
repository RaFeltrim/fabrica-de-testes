const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const webhookController = require('../webhookController');

// Mock do dbService
jest.mock('../../services/dbService', () => ({
  saveResult: jest.fn().mockResolvedValue({ id: 1 })
}));

const app = express();
app.use(express.json());

app.post('/api/v1/webhooks/github', (req, res) => webhookController.handleGitHubWebhook(req, res));
app.post('/api/v1/webhooks/jenkins', (req, res) => webhookController.handleJenkinsWebhook(req, res));
app.post('/api/v1/webhooks/gitlab', (req, res) => webhookController.handleGitLabWebhook(req, res));

describe('WebhookController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default secret for testing
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-key';
    process.env.JENKINS_WEBHOOK_TOKEN = 'jenkins-token-123';
    process.env.GITLAB_WEBHOOK_TOKEN = 'gitlab-token-456';
  });

  describe('GitHub Webhook', () => {
    it('should validate HMAC signature correctly', async () => {
      const payload = {
        action: 'completed',
        workflow_run: {
          name: 'CI Tests',
          conclusion: 'success',
          html_url: 'https://github.com/user/repo/actions/runs/123'
        }
      };

      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload);
      const signature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-Hub-Signature-256', signature)
        .set('X-GitHub-Event', 'workflow_run')
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });

    it('should reject invalid HMAC signature', async () => {
      const payload = {
        action: 'completed',
        workflow_run: {
          name: 'CI Tests',
          conclusion: 'success'
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-Hub-Signature-256', 'sha256=invalid-signature')
        .set('X-GitHub-Event', 'workflow_run')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid signature');
    });

    it('should accept request without signature if no secret configured', async () => {
      delete process.env.GITHUB_WEBHOOK_SECRET;
      
      const payload = {
        action: 'completed',
        workflow_run: {
          name: 'CI Tests',
          conclusion: 'success'
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-GitHub-Event', 'workflow_run')
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
      
      process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-key';
    });

    it('should handle workflow_run event', async () => {
      const payload = {
        action: 'completed',
        workflow_run: {
          name: 'E2E Tests',
          conclusion: 'failure',
          html_url: 'https://github.com/user/repo/actions/runs/456'
        }
      };

      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload);
      const signature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-Hub-Signature-256', signature)
        .set('X-GitHub-Event', 'workflow_run')
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });

    it('should process unsupported events without error', async () => {
      const payload = { action: 'opened' };

      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload);
      const signature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-Hub-Signature-256', signature)
        .set('X-GitHub-Event', 'pull_request')
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });
  });

  describe('Jenkins Webhook', () => {
    it('should validate token authentication', async () => {
      const payload = {
        name: 'Test Job',
        result: 'SUCCESS',
        url: 'http://jenkins.local/job/test/123/',
        build: {
          number: 123,
          phase: 'COMPLETED'
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/jenkins')
        .set('Authorization', `Bearer ${process.env.JENKINS_WEBHOOK_TOKEN}`)
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });

    it('should reject invalid token', async () => {
      const payload = {
        name: 'Test Job',
        result: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/v1/webhooks/jenkins')
        .set('Authorization', 'Bearer invalid-token')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should accept request without token if none configured', async () => {
      const oldToken = process.env.JENKINS_WEBHOOK_TOKEN;
      delete process.env.JENKINS_WEBHOOK_TOKEN;
      
      const payload = {
        name: 'Test Job',
        result: 'SUCCESS',
        build: { number: 42 }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/jenkins')
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
      
      process.env.JENKINS_WEBHOOK_TOKEN = oldToken;
    });
  });

  describe('GitLab Webhook', () => {
    it('should validate token authentication', async () => {
      const payload = {
        object_kind: 'pipeline',
        object_attributes: {
          status: 'success',
          ref: 'main',
          sha: 'abc123'
        },
        project: {
          name: 'Test Project',
          web_url: 'https://gitlab.com/user/project'
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/gitlab')
        .set('X-Gitlab-Token', process.env.GITLAB_WEBHOOK_TOKEN)
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });

    it('should reject invalid token', async () => {
      const payload = {
        object_kind: 'pipeline',
        object_attributes: { status: 'success' }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/gitlab')
        .set('X-Gitlab-Token', 'invalid-token')
        .send(payload)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject request with missing token when token is configured', async () => {
      const payload = {
        object_kind: 'pipeline',
        project: { name: 'Test' },
        object_attributes: { id: 1, status: 'success' }
      };

      // Token is configured but not provided in request
      const response = await request(app)
        .post('/api/v1/webhooks/gitlab')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Webhook Data Processing', () => {
    it('should extract test results from GitHub payload', async () => {
      const dbService = require('../../services/dbService');
      
      const payload = {
        action: 'completed',
        workflow_run: {
          name: 'Integration Tests',
          conclusion: 'success',
          html_url: 'https://github.com/user/repo/actions/runs/789'
        }
      };

      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload);
      const signature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      await request(app)
        .post('/api/v1/webhooks/github')
        .set('X-Hub-Signature-256', signature)
        .set('X-GitHub-Event', 'workflow_run')
        .send(payload)
        .expect(200);

      expect(dbService.saveResult).toHaveBeenCalled();
    });

    it('should handle missing optional fields', async () => {
      const payload = {
        name: 'Basic Job',
        result: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/v1/webhooks/jenkins')
        .set('Authorization', `Bearer ${process.env.JENKINS_WEBHOOK_TOKEN}`)
        .send(payload)
        .expect(200);

      expect(response.body.message).toContain('processed');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbService = require('../../services/dbService');
      dbService.saveResult.mockRejectedValueOnce(new Error('Database error'));

      const payload = {
        name: 'Test Job',
        result: 'SUCCESS',
        build: { number: 42 }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/jenkins')
        .set('Authorization', `Bearer ${process.env.JENKINS_WEBHOOK_TOKEN}`)
        .send(payload)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      
      // Restore mock
      dbService.saveResult.mockResolvedValue({ id: 1 });
    });
  });
});

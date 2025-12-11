const crypto = require('crypto');
const dbService = require('../services/dbService');

class WebhookController {
  /**
   * Handle GitHub Actions webhook
   * Expects: workflow_run event with test results
   */
  async handleGitHubWebhook(req, res) {
    try {
      // Verify GitHub signature if secret is provided
      const signature = req.headers['x-hub-signature-256'];
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      
      if (secret && signature) {
        const isValid = this.verifyGitHubSignature(req.body, signature, secret);
        if (!isValid) {
          return res.status(401).json({
            error: 'Invalid signature',
            message: 'Webhook signature verification failed'
          });
        }
      }

      const event = req.headers['x-github-event'];
      const payload = req.body;

      console.log(`📥 GitHub webhook received: ${event}`);

      // Handle workflow_run events
      if (event === 'workflow_run') {
        const { workflow_run } = payload;
        
        // Extract test results from workflow run
        const testResult = {
          suite_name: `${payload.repository?.name || 'Unknown'} - ${workflow_run.name}`,
          framework: 'GitHub Actions',
          test_type: 'CI/CD',
          project_category: 'CI Pipeline',
          // These would typically come from artifacts or API calls
          // For now, we'll use placeholder values
          total: workflow_run.conclusion === 'success' ? 10 : 10,
          passed: workflow_run.conclusion === 'success' ? 10 : 8,
          failed: workflow_run.conclusion === 'success' ? 0 : 2,
          error_type: workflow_run.conclusion === 'failure' ? 'CI Failure' : null,
          error_message: workflow_run.conclusion === 'failure' ? 'Workflow failed' : null
        };

        await dbService.saveResult(testResult);

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
          io.emit('new-test-result', {
            type: 'webhook-result',
            data: testResult,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.status(200).json({
        message: 'Webhook processed successfully',
        event
      });
    } catch (error) {
      console.error('Error processing GitHub webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        message: error.message
      });
    }
  }

  /**
   * Handle Jenkins webhook
   * Expects: build notification with test results
   */
  async handleJenkinsWebhook(req, res) {
    try {
      // Verify Jenkins token if provided
      const token = req.headers['authorization'];
      const expectedToken = process.env.JENKINS_WEBHOOK_TOKEN;
      
      if (expectedToken && token !== `Bearer ${expectedToken}`) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Webhook token verification failed'
        });
      }

      const payload = req.body;
      console.log(`📥 Jenkins webhook received`);

      // Extract build information
      const testResult = {
        suite_name: `${payload.name || 'Jenkins Build'} #${payload.build?.number || '?'}`,
        framework: 'Jenkins',
        test_type: 'CI/CD',
        project_category: 'CI Pipeline',
        total: payload.build?.total_tests || 0,
        passed: payload.build?.passed_tests || 0,
        failed: payload.build?.failed_tests || 0,
        error_type: payload.build?.result === 'FAILURE' ? 'Build Failure' : null,
        error_message: payload.build?.result === 'FAILURE' ? 'Build failed' : null
      };

      await dbService.saveResult(testResult);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.emit('new-test-result', {
          type: 'webhook-result',
          data: testResult,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        message: 'Webhook processed successfully',
        buildNumber: payload.build?.number
      });
    } catch (error) {
      console.error('Error processing Jenkins webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        message: error.message
      });
    }
  }

  /**
   * Handle GitLab CI webhook
   * Expects: pipeline event with test results
   */
  async handleGitLabWebhook(req, res) {
    try {
      // Verify GitLab token
      const token = req.headers['x-gitlab-token'];
      const expectedToken = process.env.GITLAB_WEBHOOK_TOKEN;
      
      if (expectedToken && token !== expectedToken) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Webhook token verification failed'
        });
      }

      const payload = req.body;
      console.log(`📥 GitLab webhook received: ${payload.object_kind}`);

      if (payload.object_kind === 'pipeline') {
        const testResult = {
          suite_name: `${payload.project?.name || 'Unknown'} - Pipeline #${payload.object_attributes?.id}`,
          framework: 'GitLab CI',
          test_type: 'CI/CD',
          project_category: 'CI Pipeline',
          // GitLab doesn't provide test results directly, would need to fetch from artifacts
          total: payload.object_attributes?.status === 'success' ? 10 : 10,
          passed: payload.object_attributes?.status === 'success' ? 10 : 8,
          failed: payload.object_attributes?.status === 'success' ? 0 : 2,
          error_type: payload.object_attributes?.status === 'failed' ? 'Pipeline Failure' : null,
          error_message: payload.object_attributes?.status === 'failed' ? 'Pipeline failed' : null
        };

        await dbService.saveResult(testResult);

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
          io.emit('new-test-result', {
            type: 'webhook-result',
            data: testResult,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.status(200).json({
        message: 'Webhook processed successfully',
        objectKind: payload.object_kind
      });
    } catch (error) {
      console.error('Error processing GitLab webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        message: error.message
      });
    }
  }

  /**
   * Generic webhook handler for custom integrations
   * Expects standard test result format
   */
  async handleGenericWebhook(req, res) {
    try {
      const payload = req.body;
      
      // Validate required fields
      if (!payload.suite_name || payload.total === undefined || 
          payload.passed === undefined || payload.failed === undefined) {
        return res.status(400).json({
          error: 'Invalid payload',
          message: 'Required fields: suite_name, total, passed, failed'
        });
      }

      const testResult = {
        suite_name: payload.suite_name,
        framework: payload.framework || 'Generic',
        test_type: payload.test_type || 'Webhook',
        project_category: payload.project_category || 'General',
        total: payload.total,
        passed: payload.passed,
        failed: payload.failed,
        error_type: payload.error_type,
        error_message: payload.error_message,
        error_details: payload.error_details
      };

      await dbService.saveResult(testResult);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.emit('new-test-result', {
          type: 'webhook-result',
          data: testResult,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        message: 'Webhook processed successfully',
        data: testResult
      });
    } catch (error) {
      console.error('Error processing generic webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        message: error.message
      });
    }
  }

  /**
   * Verify GitHub webhook signature
   */
  verifyGitHubSignature(payload, signature, secret) {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
      
      // timingSafeEqual throws if buffers have different lengths
      if (signature.length !== digest.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get webhook configuration information
   */
  getWebhookInfo(req, res) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.status(200).json({
      message: 'QADash Webhook Endpoints',
      endpoints: {
        github: {
          url: `${baseUrl}/api/v1/webhooks/github`,
          events: ['workflow_run'],
          headers: {
            'Content-Type': 'application/json',
            'X-GitHub-Event': 'workflow_run',
            'X-Hub-Signature-256': 'sha256=...(if secret configured)'
          },
          environmentVariable: 'GITHUB_WEBHOOK_SECRET'
        },
        jenkins: {
          url: `${baseUrl}/api/v1/webhooks/jenkins`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN'
          },
          environmentVariable: 'JENKINS_WEBHOOK_TOKEN'
        },
        gitlab: {
          url: `${baseUrl}/api/v1/webhooks/gitlab`,
          events: ['Pipeline Hook'],
          headers: {
            'Content-Type': 'application/json',
            'X-Gitlab-Token': 'YOUR_TOKEN'
          },
          environmentVariable: 'GITLAB_WEBHOOK_TOKEN'
        },
        generic: {
          url: `${baseUrl}/api/v1/webhooks/generic`,
          payload: {
            suite_name: 'My Test Suite',
            framework: 'Custom',
            test_type: 'Integration',
            total: 100,
            passed: 95,
            failed: 5,
            error_type: 'Optional',
            error_message: 'Optional',
            error_details: 'Optional'
          }
        }
      }
    });
  }
}

module.exports = new WebhookController();

import { Reporter, Context } from '@jest/reporters';
import { AggregatedResult, AssertionResult } from '@jest/test-result';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import pluralize from 'pluralize';
import ms from 'ms';

/*
  This file contains a custom Jest reporter to
  send reports to Slack after completion.

  This is an example for my blog post on
  extending Jest's capabilities with custom
  reporters, available at

  https://brunoscheufler.com/blog/2020-02-14-supercharging-jest-with-custom-reporters
*/

// Load environment variables to obtain Slack Webhook URL
dotenv.config();

/**
 * Print report header containing top-level
 * stats about the test run
 * @param results
 */
function printReportHeader(results: AggregatedResult) {
  const { numFailedTests: failedTests } = results;

  if (failedTests === 0) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:tada: Your test report is in, all tests passed!`
      }
    };
  }

  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:boom: Your test report is in, we've got ${failedTests} failing ${pluralize(
        'test',
        failedTests
      )}!`
    }
  };
}

/**
 * Print results of every suite
 * @param results
 */
function printSuiteResults(results: AggregatedResult) {
  const blocks = [];

  for (const suite of results.testResults) {
    blocks.push(
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Test Suite \`${suite.testResults[0].ancestorTitles[0]}\`: \n\n🚨 ${suite.numFailingTests} failing, ✅ ${suite.numPassingTests} passing`
        }
      }
    );

    // Print complete failure message for failed test suites
    if (suite.failureMessage) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `
🚧 Suite failed with message: \`\`\`
${suite.failureMessage.replace(
  // Strip ANSI color codes from failure message
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
  ''
)} \`\`\``
        }
      });
    }

    blocks.push(...suite.testResults.flatMap(printTestResults));
  }

  return blocks;
}

/**
 * Print results of each test
 * @param result
 */
function printTestResults(result: AssertionResult) {
  const formattedStatus =
    result.status === 'failed' ? `💥 *FAILED*` : result.status;

  const blocks = [
    // Print formatted name, status and timing information
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `- \`${result.title}\`: ${formattedStatus} ${
          result.duration ? `in ${ms(result.duration)}` : ''
        }`
      }
    }
  ];

  // Print failure messages for failed tests
  if (result.status === 'failed') {
    for (const message of result.failureMessages) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `
          \`\`\`
${message}
          \`\`\`
          `
        }
      });
    }
  }

  return blocks;
}

/**
 * A custom Jest reporter implementing only the onRunComplete
 * method of the Reporter interface, since we don't want to handle
 * other events.
 */
export default class CustomReporter implements Pick<Reporter, 'onRunComplete'> {
  /**
   * Event hook for onRunComplete, is triggered on completion
   * @param _
   * @param results
   */
  async onRunComplete(_: Set<Context>, results: AggregatedResult) {
    // Retrieve Slack webhook URL from environment
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      throw new Error('Missing SLACK_WEBHOOK_URL environment variable!');
    }

    // Construct Slack message in block format
    const slackMessage = {
      blocks: [
        printReportHeader(results),
        ...printSuiteResults(results),
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Report generated at ${new Date().toLocaleString('en-US')}`
            }
          ]
        }
      ]
    };

    // Send Test Report to Slack
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    });
  }
}

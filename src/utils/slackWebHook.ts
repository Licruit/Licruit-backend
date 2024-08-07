import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';
import dotenv from 'dotenv';

dotenv.config();

interface MiddlewareError extends Error {
  status?: number | string;
  statusCode?: number | string;
  status_code?: number | string;
  output?: {
    statusCode?: number | string;
  };
}

const webhook = new IncomingWebhook(process.env.WEBHOOK_URL!);

export const sendSlackMessage = (error: MiddlewareError) => {
  webhook
    .send({
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: `${error.status} - ${error.message}`,
              value: error.stack! as string,
              short: false,
            },
          ],
          ts: Math.floor(new Date().getTime() / 1000).toString(),
        },
      ],
    })
    .catch((err: Error) => {
      if (err) Sentry.captureException(err);
    });
};

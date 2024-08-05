import { FastifyReply, FastifyRequest, RawRequestDefaultExpression } from 'fastify';
import { KubeFastifyInstance } from '../../../types';
import https from 'https';

interface RequestBody {
  url: string;
}

export default async (fastify: KubeFastifyInstance) => {
  fastify.get(
    '/',
    async (request: FastifyRequest<{ Querystring: RequestBody }>, reply: FastifyReply) => {
      const { url } = request.query;
      const decodedUrl = decodeURIComponent(url);

      return new Promise((resolve, reject) => {
        https
          .get(decodedUrl, (response) => {
            let data = '';

            // Collect data chunks
            response.on('data', (response) => {
              data = response;
            });

            response.on('end', () => {
              resolve(reply.send(data));
            });
          })
          .on('error', (err) => {
            reject(reply.status(500).send({ error: 'Failed to fetch the URL', details: err }));
          });
      });
    },
  );
};

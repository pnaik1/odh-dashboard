import { ArtifactStorage } from '~/concepts/pipelines/types';

/* eslint-disable camelcase */
export const mockArtifactStorage: ArtifactStorage = {
  artifact_id: '5',
  artifact_size: '60',
  artifact_type: 'system.HTML',
  created_at: '2024-01-31T15:46:33Z',
  download_url:
    'https://rhoaiv2-pipelines.s3.dualstack.us-east-1.amazonaws.com/metrics-visualization-pipeline/73d3e545-7fe7',

  last_updated_at: '2024-02-31T15:46:33Z',
  namespace: 'test',
  storage_path: 'metrics-visaulix=zation-pipeline',
  storage_provider: 's3',
  uri: 's3://test-pipeline/metrics',
};

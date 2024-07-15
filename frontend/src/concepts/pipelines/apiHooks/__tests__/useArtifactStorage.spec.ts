import { SupportedArea, useIsAreaAvailable } from '~/concepts/areas';
import { fetchStorageObject, fetchStorageObjectSize } from '~/services/storageService';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { useGetArtifactById } from '~/concepts/pipelines/apiHooks/useGetArtifactById';
import { Artifact } from '~/third_party/mlmd';
import { testHook } from '~/__tests__/unit/testUtils/hooks';
import { useArtifactStorage } from '~/concepts/pipelines/apiHooks/useArtifactStorage';
import { mockArtifactStorage } from '~/__mocks__/mockArtifactStorage';

global.fetch = jest.fn();
const mockFetch = jest.mocked(global.fetch);
jest.mock('~/concepts/areas', () => ({
  ...jest.requireActual('~/concepts/areas'),
  useIsAreaAvailable: jest.fn(),
}));

jest.mock('~/services/storageService', () => ({
  fetchStorageObject: jest.fn(),
  fetchStorageObjectSize: jest.fn(),
}));

jest.mock('~/concepts/pipelines/context', () => ({
  usePipelinesAPI: jest.fn(),
}));

jest.mock('~/concepts/pipelines/apiHooks/useGetArtifactById', () => ({
  useGetArtifactById: jest.fn(),
}));

const mockFetchStorageObject = fetchStorageObject as jest.Mock;
const mockFetchStorageObjectSize = fetchStorageObjectSize as jest.Mock;
const mockUsePipelinesAPI = usePipelinesAPI as jest.Mock;
const mockGetArtifactById = useGetArtifactById as jest.Mock;
const mockUseIsAreaAvailable = useIsAreaAvailable as jest.Mock;

describe('useArtifactStorage', () => {
  const artifact = new Artifact();

  mockFetch.mockResolvedValue({
    status: 200,
    text: jest.fn().mockResolvedValue('<html>hello world</html>'),
  } as unknown as Response);
  artifact.getUri = jest.fn().mockReturnValue('s3://bucket/test');
  artifact.getId = jest.fn().mockReturnValue(1);

  beforeEach(() => {
    mockUsePipelinesAPI.mockReturnValue({ namespace: 'test' });
    mockFetchStorageObject.mockResolvedValue('<html>hello world</html>');
    mockFetchStorageObjectSize.mockResolvedValue(60);
    mockGetArtifactById.mockReturnValue([mockArtifactStorage]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  const setAreaAvailable = (s3EndpointStatus: boolean, artifactApiStatus: boolean) => {
    mockUseIsAreaAvailable.mockImplementation((area) => {
      if (area === SupportedArea.S3_ENDPOINT) {
        return { status: s3EndpointStatus };
      }
      if (area === SupportedArea.ARTIFACT_API) {
        return { status: artifactApiStatus };
      }
      return { status: false };
    });
  };

  it('should return backend storage when is not available artifactApi and s3Endpoint is available', async () => {
    setAreaAvailable(true, false);
    const renderResult = testHook(useArtifactStorage)(artifact);

    expect(renderResult.result.current.artifactFeatureFlagEnabled).toBe(true);
    expect(renderResult.result.current.downloadedObject).toBe(undefined);
    expect(renderResult.result.current.objectSize).toBe(undefined);
    expect(renderResult.result.current.objectUrl).toBe('/api/storage/test?key=test');

    await renderResult.waitForNextUpdate();
    expect(renderResult.result.current.artifactFeatureFlagEnabled).toBe(true);
    expect(renderResult.result.current.downloadedObject).toBe('<html>hello world</html>');
    expect(renderResult.result.current.objectSize).toBe(60);
    expect(renderResult.result.current.objectUrl).toBe('/api/storage/test?key=test');
  });

  it('should return dsp server when artifactApi is available', async () => {
    setAreaAvailable(true, true);
    const renderResult = testHook(useArtifactStorage)(artifact);
    expect(renderResult.result.current.artifactFeatureFlagEnabled).toBe(true);
    expect(renderResult.result.current.downloadedObject).toBe(undefined);
    expect(renderResult.result.current.objectSize).toBe(60);
    expect(renderResult.result.current.objectUrl).toBe(
      'https://rhoaiv2-pipelines.s3.dualstack.us-east-1.amazonaws.com/metrics-visualization-pipeline/73d3e545-7fe7',
    );

    await renderResult.waitForNextUpdate();
    expect(renderResult.result.current.artifactFeatureFlagEnabled).toBe(true);
    expect(renderResult.result.current.downloadedObject).toBe('<html>hello world</html>');
    expect(renderResult.result.current.objectSize).toBe(60);
    expect(renderResult.result.current.objectUrl).toBe(
      'https://rhoaiv2-pipelines.s3.dualstack.us-east-1.amazonaws.com/metrics-visualization-pipeline/73d3e545-7fe7',
    );
  });

  it('should return undefined when artifact api and  s3Endpoint are absent', async () => {
    setAreaAvailable(false, false);
    const renderResult = testHook(useArtifactStorage)(artifact);
    expect(renderResult.result.current.artifactFeatureFlagEnabled).toBe(false);
    expect(renderResult.result.current.downloadedObject).toBe(undefined);
    expect(renderResult.result.current.objectSize).toBe(undefined);
    expect(renderResult.result.current.objectUrl).toBe(undefined);
  });
});

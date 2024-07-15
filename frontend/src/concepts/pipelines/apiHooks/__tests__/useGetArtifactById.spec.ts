import { act } from '@testing-library/react';
import { mockArtifactStorage } from '~/__mocks__/mockArtifactStorage';
import { useGetArtifactById } from '~/concepts/pipelines/apiHooks/useGetArtifactById';
import { standardUseFetchState, testHook } from '~/__tests__/unit/testUtils/hooks';
import { usePipelinesAPI } from '~/concepts/pipelines/context';

jest.mock('~/concepts/pipelines/context', () => ({
  usePipelinesAPI: jest.fn(),
}));
const mockUsePipelinesAPI = usePipelinesAPI as jest.Mock;
const mockGetArtifact = jest.fn();

describe('useGetArtifactById', () => {
  beforeEach(() => {
    mockUsePipelinesAPI.mockReturnValue({ api: { getArtifact: mockGetArtifact } });
  });
  it('should return artifact details', async () => {
    mockGetArtifact.mockResolvedValue(mockArtifactStorage);
    const renderResult = testHook(useGetArtifactById)('1', 'DOWNLOAD');

    expect(mockGetArtifact).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(null));
    expect(renderResult).hookToHaveUpdateCount(1);

    // wait for update
    await renderResult.waitForNextUpdate();
    expect(mockGetArtifact).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(mockArtifactStorage, true));
    expect(renderResult).hookToHaveUpdateCount(2);
    expect(renderResult).hookToBeStable([false, false, true, true]);

    // refresh
    mockGetArtifact.mockResolvedValue(mockArtifactStorage);
    await act(() => renderResult.result.current[3]());
    expect(mockGetArtifact).toHaveBeenCalledTimes(2);
    expect(renderResult).hookToHaveUpdateCount(3);
    expect(renderResult).hookToBeStable([false, true, true, true]);
  });

  it('should handle when artifact id is not present', async () => {
    const renderResult = testHook(useGetArtifactById)();
    expect(mockGetArtifact).not.toHaveBeenCalled();
    expect(renderResult).hookToStrictEqual(standardUseFetchState(null));
    expect(renderResult).hookToHaveUpdateCount(1);
  });
  it('should handle other errors', async () => {
    mockGetArtifact.mockRejectedValue(new Error('error1'));

    const renderResult = testHook(useGetArtifactById)('namespace');
    expect(mockGetArtifact).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(null));
    expect(renderResult).hookToHaveUpdateCount(1);

    // wait for update
    await renderResult.waitForNextUpdate();
    expect(mockGetArtifact).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(null, false, new Error('error1')));
    expect(renderResult).hookToHaveUpdateCount(2);
    expect(renderResult).hookToBeStable([true, true, false, true]);

    // refresh
    mockGetArtifact.mockRejectedValue(new Error('error2'));
    await act(() => renderResult.result.current[3]());
    expect(mockGetArtifact).toHaveBeenCalledTimes(2);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(null, false, new Error('error2')));
    expect(renderResult).hookToHaveUpdateCount(3);
    expect(renderResult).hookToBeStable([true, true, false, true]);
  });
});

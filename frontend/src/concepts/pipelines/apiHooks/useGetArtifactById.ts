import React from 'react';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import useFetchState, {
  FetchState,
  FetchStateCallbackPromise,
  NotReadyError,
} from '~/utilities/useFetchState';
import { ArtifactStorage } from '~/concepts/pipelines/types';

export const useGetArtifactById = (
  artifactId?: string,
  view?: 'DOWNLOAD' | 'BASIC',
): FetchState<ArtifactStorage | null> => {
  const { api } = usePipelinesAPI();

  const call = React.useCallback<FetchStateCallbackPromise<ArtifactStorage | null>>(
    (opts) => {
      if (!artifactId) {
        return Promise.reject(new NotReadyError('No artifact id'));
      }
      return api.getArtifact(opts, artifactId, view);
    },
    [api, artifactId, view],
  );
  return useFetchState(call, null);
};

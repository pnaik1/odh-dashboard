import { useEffect, useState } from 'react';

import { SupportedArea, useIsAreaAvailable } from '~/concepts/areas';
import { fetchStorageObject, fetchStorageObjectSize } from '~/services/storageService';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { Artifact } from '~/third_party/mlmd';
import {
  extractS3UriComponents,
  getArtifactUrlFromUri,
} from '~/concepts/pipelines/content/artifacts/utils';
import { useGetArtifactById } from './useGetArtifactById';

export const useArtifactStorage = (
  artifact?: Artifact,
): {
  artifactFeatureFlagEnabled: boolean;
  objectUrl: string | undefined;
  objectSize: number | undefined;
  downloadedObject: string | undefined;
} => {
  const s3EndpointAvailable = useIsAreaAvailable(SupportedArea.S3_ENDPOINT).status;
  const artifactApiAvailable = useIsAreaAvailable(SupportedArea.ARTIFACT_API).status;
  const { namespace } = usePipelinesAPI();

  const path = artifact?.getUri();
  const artifactId = artifact?.getId().toString();

  const [downloadedObject, setDownloadedObject] = useState<string>();
  const [objectUrl, setStorageUrl] = useState<string>();
  const [objectSize, setObjectSize] = useState<number>();
  const artifactFeatureFlagEnabled = s3EndpointAvailable || artifactApiAvailable;
  const [artifactResponse] = useGetArtifactById(artifactId, 'DOWNLOAD');
  const artifactSize = Number(artifactResponse?.artifact_size);

  useEffect(() => {
    if (artifactApiAvailable) {
      if (artifactResponse?.download_url) {
        fetch(artifactResponse.download_url, {
          headers: { 'Content-Type': 'text/plain' },
        })
          .then((response) => response.text())
          .then((downloadObject) => {
            setDownloadedObject(downloadObject);
          });
      }
      setObjectSize(Number.isNaN(artifactSize) ? undefined : artifactSize);
      setStorageUrl(artifactResponse?.download_url);
    } else if (s3EndpointAvailable && path) {
      const uriComponents = extractS3UriComponents(path);

      if (uriComponents) {
        fetchStorageObject(namespace, uriComponents.path)
          .then((fetchObject) => {
            setDownloadedObject(fetchObject);
          })
          .catch(() => null);

        setStorageUrl(getArtifactUrlFromUri(path, namespace));

        fetchStorageObjectSize(namespace, uriComponents.path).then((fetchSize) => {
          setObjectSize(fetchSize);
        });
      }
    }
  }, [artifactApiAvailable, artifactResponse, artifactSize, namespace, path, s3EndpointAvailable]);

  return { artifactFeatureFlagEnabled, objectUrl, objectSize, downloadedObject };
};

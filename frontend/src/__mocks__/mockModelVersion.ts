import { ModelVersion, ModelVersionState } from '~/concepts/modelRegistry/types';

type MockModelVersionType = {
  author?: string;
  registeredModelID?: string;
};

export const mockModelVersion = ({
  author = 'Test author',
  registeredModelID = '1',
}: MockModelVersionType): ModelVersion => ({
  author,
  createTimeSinceEpoch: '1712234877179',
  customProperties: {},
  id: '26',
  lastUpdateTimeSinceEpoch: '1712234877179',
  name: 'fraud detection model version 1',
  state: ModelVersionState.ARCHIVED,
  registeredModelID,
});

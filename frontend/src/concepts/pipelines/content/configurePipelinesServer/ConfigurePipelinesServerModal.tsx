import * as React from 'react';
import { Alert, Button, Form, Modal, Stack, StackItem } from '@patternfly/react-core';
import {
  EMPTY_AWS_PIPELINE_DATA,
  PIPELINE_AWS_FIELDS,
} from '~/pages/projects/dataConnections/const';
import './ConfigurePipelinesServerModal.scss';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { createPipelinesCR, deleteSecret } from '~/api';
import useDataConnections from '~/pages/projects/screens/detail/data-connections/useDataConnections';
import { PipelinesDatabaseSection } from './PipelinesDatabaseSection';
import { ObjectStorageSection } from './ObjectStorageSection';
import {
  DATABASE_CONNECTION_FIELDS,
  DATABASE_CONNECTION_KEYS,
  EMPTY_DATABASE_CONNECTION,
  EXTERNAL_DATABASE_SECRET,
} from './const';
import { configureDSPipelineResourceSpec } from './utils';
import { PipelineServerConfigType } from './types';

type ConfigurePipelinesServerModalProps = {
  open: boolean;
  onClose: () => void;
};

const FORM_DEFAULTS: PipelineServerConfigType = {
  database: { useDefault: true, value: EMPTY_DATABASE_CONNECTION },
  objectStorage: { newValue: EMPTY_AWS_PIPELINE_DATA },
};

export const ConfigurePipelinesServerModal: React.FC<ConfigurePipelinesServerModalProps> = ({
  onClose,
  open,
}) => {
  const { project, namespace } = usePipelinesAPI();
  const [dataConnections, , , refresh] = useDataConnections(namespace);
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [config, setConfig] = React.useState<PipelineServerConfigType>(FORM_DEFAULTS);

  React.useEffect(() => {
    if (open) {
      refresh();
    }
  }, [open, refresh]);

  const canSubmit = () => {
    const databaseIsValid = config.database.useDefault
      ? true
      : config.database.value.every(({ key, value }) =>
          DATABASE_CONNECTION_FIELDS.filter((field) => field.isRequired)
            .map((field) => field.key)
            .includes(key as DATABASE_CONNECTION_KEYS)
            ? !!value
            : true,
        );

    const objectStorageIsValid = config.objectStorage.newValue.every(({ key, value }) =>
      PIPELINE_AWS_FIELDS.filter((field) => field.isRequired)
        .map((field) => field.key)
        .includes(key)
        ? !!value
        : true,
    );

    return databaseIsValid && objectStorageIsValid;
  };

  const onBeforeClose = () => {
    onClose();
    setFetching(false);
    setError(null);
    setConfig(FORM_DEFAULTS);
  };

  const submit = () => {
    let objectStorage: PipelineServerConfigType['objectStorage'];
    objectStorage = {
      newValue: config.objectStorage.newValue,
    };

    setFetching(true);
    setError(null);

    const configureConfig: PipelineServerConfigType = {
      ...config,
      objectStorage,
    };

    configureDSPipelineResourceSpec(configureConfig, project.metadata.name)
      .then((spec) => {
        createPipelinesCR(namespace, spec)
          .then(() => {
            onBeforeClose();
          })
          .catch((e) => {
            setFetching(false);
            setError(e);

            // Cleanup created password secret
            deleteSecret(project.metadata.name, EXTERNAL_DATABASE_SECRET.NAME);
          });
      })
      .catch((e) => {
        setFetching(false);
        setError(e);
      });
  };

  return (
    <Modal
      title="Configure pipeline server"
      variant="medium"
      isOpen={open}
      onClose={onBeforeClose}
      actions={[
        <Button
          key="configure"
          variant="primary"
          isDisabled={!canSubmit() || fetching}
          isLoading={fetching}
          onClick={submit}
        >
          Configure
        </Button>,
        <Button key="cancel" variant="link" onClick={onBeforeClose}>
          Cancel
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <ObjectStorageSection
              setConfig={setConfig}
              config={config}
              dataConnections={dataConnections}
            />
            <PipelinesDatabaseSection setConfig={setConfig} config={config} />
          </Form>
        </StackItem>
        {error && (
          <StackItem>
            <Alert variant="danger" isInline title="Error configuring pipeline server">
              {error.message}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

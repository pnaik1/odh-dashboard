import {
  FormSection,
  Title,
  FormGroup,
  Text,
  TextInput,
  InputGroup,
  Tooltip,
  Dropdown,
  DropdownToggle,
  Menu,
  MenuItem,
  DropdownPosition,
  MenuItemAction,
  TextContent,
  MenuList,
  MenuGroup,
  MenuContent,
  TextVariants,
} from '@patternfly/react-core';
import React from 'react';
import {} from '~/pages/projects/types';
import { FieldListField } from '~/components/FieldList';
import { getDataConnectionDisplayName } from '~/pages/projects/screens/detail/data-connections/utils';
import { DataConnection, AWSDataEntry } from '~/pages/projects/types';
import { PIPELINE_AWS_FIELDS, AWS_KEYS } from '~/pages/projects/dataConnections/const';
import { PipelineServerConfigType } from './types';
import './ConfigurePipelinesServerModal.scss';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';
import { convertAWSSecretData } from '~/pages/projects/screens/detail/data-connections/utils';
import { EyeIcon } from '@patternfly/react-icons/dist/esm/icons/eye-icon';

const PIPELINE_AWS_KEY = [AWS_KEYS.ACCESS_KEY_ID, AWS_KEYS.SECRET_ACCESS_KEY, AWS_KEYS.S3_ENDPOINT];
const getLabelName = (index: string) => {
  const field = PIPELINE_AWS_FIELDS.find((field) => field.key === index);
  return field ? field.label : '';
};
export type FieldOptions = {
  key: string;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  isPassword?: boolean;
};

type ObjectStorageSectionProps = {
  setConfig: (config: PipelineServerConfigType) => void;
  config: PipelineServerConfigType;
  dataConnections: DataConnection[];
};

export const ObjectStorageSection = ({
  setConfig,
  config,
  dataConnections,
}: ObjectStorageSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [passwordHiddenStates, setPasswordHiddenStates] = React.useState(
    dataConnections.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {}),
  );

  const togglePasswordHidden = (index) => {
    setPasswordHiddenStates((prevStates) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };
  const existingDataConnection = (connection: string): AWSDataEntry | null => {
    const value = dataConnections.find((d) => d.data.metadata.name === connection);
    if (value)
      return convertAWSSecretData(value).filter((dataItem) => {
        return PIPELINE_AWS_KEY.some((filterItem) => filterItem === dataItem.key);
      });
    return null;
  };

  const onChange = (key: FieldOptions['key'], value: string) => {
    setConfig({
      ...config,
      objectStorage: {
        newValue: config.objectStorage.newValue.map((d) => (d.key === key ? { key, value } : d)),
      },
    });
  };

  const onToggle = (isOpen: boolean) => {
    setPasswordHiddenStates(
      dataConnections.reduce((acc, _, index) => {
        acc[index] = true;
        return acc;
      }, {}),
    );
    setIsOpen(isOpen);
  };
  const onSelect = (_event, option) => {
    if (typeof option === 'string') {
      const optionValue = existingDataConnection(option);
      const updatedObjectStorageValue = config.objectStorage.newValue.map((item) => {
        const matchingOption = optionValue?.find((optItem) => optItem.key === item.key);

        return {
          ...item,
          value: matchingOption ? matchingOption.value : item.value,
        };
      });

      setConfig({
        ...config,
        objectStorage: {
          newValue: updatedObjectStorageValue,
        },
      });
    }
  };
  return (
    <FormSection
      title={
        <>
          <Title headingLevel="h2">Object storage connection</Title>
          <Text component="p" className="form-subtitle-text">
            The selected S3-compatible data connection is where your pipeline artifacts are stored.
          </Text>
        </>
      }
    >
      {PIPELINE_AWS_FIELDS.map((field) =>
        field.key == 'AWS_ACCESS_KEY_ID' ? (
          <FormGroup isRequired={field.isRequired} label={field.label}>
            <InputGroup>
              <TextInput
                aria-label={`Field list ${field.key}`}
                isRequired={field.isRequired}
                value={
                  config.objectStorage.newValue.find((data) => data.key === field.key)?.value || ''
                }
                placeholder={field.placeholder}
                onChange={(value) => onChange(field.key, value)}
              />
              <Tooltip
                content={
                  <div>Populate the form with credentials from your selected data connection</div>
                }
              >
                <Dropdown
                  position={DropdownPosition.right}
                  toggle={<DropdownToggle onToggle={onToggle} icon={<KeyIcon />}></DropdownToggle>}
                  isOpen={isOpen}
                >
                  <Menu onSelect={onSelect} isScrollable isPlain>
                    <MenuContent>
                      <MenuGroup
                        labelHeadingLevel="h3"
                        label={
                          <Text component={TextVariants.p}>
                            <KeyIcon /> Populate the form with credentials from your selected data
                            connection
                          </Text>
                        }
                      >
                        <MenuList>
                          {dataConnections ? (
                            dataConnections.map((dataItem, index) => (
                              <MenuItem
                                key={dataItem.data.metadata.name}
                                actions={
                                  <MenuItemAction
                                    icon={<EyeIcon />}
                                    actionId={index}
                                    // eslint-disable-next-line no-console
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      togglePasswordHidden(index);
                                    }}
                                    aria-label={dataItem.data.metadata.name}
                                  />
                                }
                                description={
                                  passwordHiddenStates[index] ? (
                                    <TextInput
                                      value={dataItem.data.metadata.name}
                                      type="password"
                                      readOnlyVariant="default"
                                      aria-label="readonly"
                                    />
                                  ) : (
                                    <TextContent>
                                      {existingDataConnection(dataItem.data.metadata.name)?.map(
                                        (field) => (
                                          <Text component={TextVariants.small}>
                                            {getLabelName(field.key)}:{field.value}
                                          </Text>
                                        ),
                                      )}
                                    </TextContent>
                                  )
                                }
                                itemId={dataItem.data.metadata.name}
                              >
                                <Text component={TextVariants.h6}>
                                  {getDataConnectionDisplayName(dataItem)}
                                </Text>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem>NO data connection Found</MenuItem>
                          )}
                        </MenuList>
                      </MenuGroup>
                    </MenuContent>
                  </Menu>
                </Dropdown>
              </Tooltip>
            </InputGroup>
          </FormGroup>
        ) : (
          <FieldListField
            value={
              config.objectStorage.newValue.find((data) => data.key === field.key)?.value || ''
            }
            options={field}
            onChange={onChange}
          />
        ),
      )}
    </FormSection>
  );
};

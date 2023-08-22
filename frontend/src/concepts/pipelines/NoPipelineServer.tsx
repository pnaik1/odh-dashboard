import * as React from 'react';
import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import WrenchIcon from '@patternfly/react-icons/dist/esm/icons/wrench-icon';
import { CreatePipelineServerButton } from '~/concepts/pipelines/context';

type NoPipelineServerProps = {
  variant: React.ComponentProps<typeof CreatePipelineServerButton>['variant'];
};

const NoPipelineServer: React.FC<NoPipelineServerProps> = ({ variant }) => (
  <EmptyState>
    <EmptyStateIcon icon={WrenchIcon} />
    <Title headingLevel="h2" size="lg">
      Enable pipelines
    </Title>
    <EmptyStateBody>
      To create and manage pipelines, first enable them by configuring a pipeline server
    </EmptyStateBody>
    <Flex direction={{ default: 'column' }}>
      <FlexItem spacer={{ default: 'spacerLg' }} />
      <FlexItem>
        <CreatePipelineServerButton variant={variant} />
      </FlexItem>
    </Flex>
  </EmptyState>
);

export default NoPipelineServer;

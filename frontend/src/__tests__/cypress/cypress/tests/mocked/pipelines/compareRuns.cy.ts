/* eslint-disable camelcase */
import {
  buildMockExperimentKF,
  mockDashboardConfig,
  mockDataSciencePipelineApplicationK8sResource,
  mockK8sResourceList,
  buildMockPipelineV2,
  buildMockPipelines,
  buildMockPipelineVersionV2,
  mockProjectK8sResource,
  mockRouteK8sResource,
  buildMockRunKF,
} from '~/__mocks__';
import { verifyRelativeURL } from '~/__tests__/cypress/cypress/utils/url';
import {
  DataSciencePipelineApplicationModel,
  ProjectModel,
  RouteModel,
} from '~/__tests__/cypress/cypress/utils/models';
import {
  compareRunsGlobal,
  compareRunsListTable,
  compareRunParamsTable,
  compareRunsMetricsContent,
} from '~/__tests__/cypress/cypress/pages/pipelines/compareRuns';
import { mockCancelledGoogleRpcStatus } from '~/__mocks__/mockGoogleRpcStatusKF';
import { initMlmdIntercepts } from './mlmdUtils';

const projectName = 'test-project-name';
const initialMockPipeline = buildMockPipelineV2({ display_name: 'Test pipeline' });
const initialMockPipelineVersion = buildMockPipelineVersionV2({
  pipeline_id: initialMockPipeline.pipeline_id,
});
const mockExperiment = buildMockExperimentKF({
  display_name: 'Test experiment 1',
  experiment_id: '1',
});

const mockRun = buildMockRunKF({
  display_name: 'Run 1',
  run_id: 'run-1',
  pipeline_version_reference: {
    pipeline_id: initialMockPipeline.pipeline_id,
    pipeline_version_id: initialMockPipelineVersion.pipeline_version_id,
  },
  experiment_id: mockExperiment.experiment_id,
  runtime_config: {
    parameters: {
      paramOne: true,
      paramTwo: false,
    },
  },
});

const mockRun2 = buildMockRunKF({
  display_name: 'Run 2',
  run_id: 'run-2',
  pipeline_version_reference: {
    pipeline_id: initialMockPipeline.pipeline_id,
    pipeline_version_id: initialMockPipelineVersion.pipeline_version_id,
  },
  experiment_id: mockExperiment.experiment_id,
  runtime_config: {
    parameters: {
      paramOne: false,
      paramTwo: false,
      paramThree: 'Threeseretops',
    },
  },
});

const mockRun3 = buildMockRunKF({
  display_name: 'Run 3',
  run_id: 'run-3',
  pipeline_version_reference: {
    pipeline_id: initialMockPipeline.pipeline_id,
    pipeline_version_id: initialMockPipelineVersion.pipeline_version_id,
  },
  experiment_id: mockExperiment.experiment_id,
  runtime_config: { parameters: {} },
});

describe('Compare runs', () => {
  beforeEach(() => {
    initIntercepts();
  });

  it('zero runs in url', () => {
    compareRunsGlobal.visit(projectName, mockExperiment.experiment_id);
    compareRunsGlobal.findInvalidRunsError().should('exist');
  });

  it('valid number of runs', () => {
    compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
      mockRun.run_id,
      mockRun2.run_id,
    ]);
    cy.wait('@validRun');
    compareRunsGlobal.findInvalidRunsError().should('not.exist');

    compareRunsListTable.findRowByName('Run 1').should('exist');
    compareRunsListTable.findRowByName('Run 2').should('exist');
  });

  it('valid number of runs but it is invalid', () => {
    cy.interceptOdh(
      'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
      {
        path: { namespace: projectName, serviceName: 'dspa', runId: 'invalid_run_id' },
      },
      { statusCode: 404 },
    ).as('invalidRun');

    compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, ['invalid_run_id']);
    cy.wait('@invalidRun');
    compareRunsGlobal.findInvalidRunsError().should('exist');
  });

  it('invalid runs are removed from url', () => {
    cy.interceptOdh(
      'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
      {
        path: { namespace: projectName, serviceName: 'dspa', runId: 'invalid_run_id' },
      },
      { statusCode: 404 },
    ).as('invalidRun');
    compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
      'invalid_run_id',
      mockRun.run_id,
    ]);
    cy.wait('@invalidRun');
    cy.wait('@validRun');
    compareRunsGlobal.findInvalidRunsError().should('not.exist');
    verifyRelativeURL(
      `/experiments/${projectName}/${mockExperiment.experiment_id}/compareRuns?runs=${mockRun.run_id}`,
    );
  });

  it('other failed requests dont change the url ', () => {
    cy.interceptOdh(
      'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
      {
        path: { namespace: projectName, serviceName: 'dspa', runId: 'invalid_run_id' },
      },
      mockCancelledGoogleRpcStatus({ message: 'Run cancelled by caller' }),
    ).as('invalidRun');
    compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
      'invalid_run_id',
      mockRun.run_id,
    ]);
    cy.wait('@invalidRun');
    cy.wait('@validRun');
    compareRunsGlobal.findInvalidRunsError().should('not.exist');
    verifyRelativeURL(
      `/experiments/${projectName}/${mockExperiment.experiment_id}/compareRuns?runs=invalid_run_id,${mockRun.run_id}`,
    );
  });

  describe('Parameters', () => {
    beforeEach(() => {
      compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
        mockRun.run_id,
        mockRun2.run_id,
      ]);
    });

    it('shows empty state when the Runs list has no selections', () => {
      compareRunsListTable.findSelectAllCheckbox().click();
      compareRunParamsTable.findEmptyState().should('exist');
    });

    it('displays table data based on selections from Run list', () => {
      compareRunsListTable.findRowByName('Run 1').should('exist');
      compareRunsListTable.findRowByName('Run 2').should('exist');

      compareRunParamsTable.findColumnByName('Run 1').should('exist');
      compareRunParamsTable.findColumnByName('Run 2').should('exist');

      compareRunParamsTable.findParamName('paramOne').should('exist');
      compareRunParamsTable.findParamName('paramTwo').should('exist');
      compareRunParamsTable.findParamName('paramThree').should('exist');
    });

    it('removes run column from params table when run list selection is removed', () => {
      compareRunsListTable.findRowByName('Run 1').should('exist');
      compareRunsListTable.findRowByName('Run 2').should('exist');

      compareRunParamsTable.findColumnByName('Run 1').should('exist');
      compareRunParamsTable.findColumnByName('Run 2').should('exist');

      compareRunsListTable.getRowByName('Run 2').findCheckbox().click();
      compareRunParamsTable.findColumnByName('Run 1').should('exist');
      compareRunParamsTable.findColumnByName('Run 2').should('not.exist');
    });

    it('only shows parameters with differences when "Hide parameters with no differences" switch is on', () => {
      compareRunsListTable.findRowByName('Run 1').should('exist');
      compareRunsListTable.findRowByName('Run 2').should('exist');

      compareRunParamsTable.findParamName('paramOne').should('exist');
      compareRunParamsTable.findParamName('paramTwo').should('exist');
      compareRunParamsTable.findParamName('paramThree').should('exist');

      cy.pfSwitch('hide-same-params-switch').click();

      compareRunParamsTable.findParamName('paramOne').should('exist');
      compareRunParamsTable.findParamName('paramTwo').should('not.exist');
      compareRunParamsTable.findParamName('paramThree').should('exist');
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      initIntercepts();

      cy.interceptOdh(
        'GET /api/storage/:namespace/size',
        {
          query: {
            key: 'metrics-visualization-pipeline/16dbff18-a3d5-4684-90ac-4e6198a9da0f/markdown-visualization/markdown_artifact',
          },
          path: { namespace: projectName },
        },
        { body: 61 },
      );

      cy.interceptOdh(
        'GET /api/storage/:namespace',
        {
          query: {
            key: 'metrics-visualization-pipeline/16dbff18-a3d5-4684-90ac-4e6198a9da0f/markdown-visualization/markdown_artifact',
          },
          path: { namespace: projectName },
        },
        '<html>helloWorld</html>',
      );
      compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
        mockRun.run_id,
        mockRun2.run_id,
        mockRun3.run_id,
      ]);
    });

    it('shows empty state when the Runs list has no selections', () => {
      compareRunsListTable.findSelectAllCheckbox().click(); // Uncheck all
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsEmptyState()
        .should('exist');
      compareRunsMetricsContent.findConfusionMatrixTab().click();
      compareRunsMetricsContent
        .findConfusionMatrixTabContent()
        .findConfusionMatrixEmptyState()
        .should('exist');
      compareRunsMetricsContent.findRocCurveTab().click();
      compareRunsMetricsContent.findRocCurveTabContent().findRocCurveEmptyState().should('exist');
      compareRunsMetricsContent.findMarkdownTab().click();
      compareRunsMetricsContent.findMarkdownTabContent().findMarkdownEmptyState().should('exist');
    });

    it('displays scalar metrics table data based on selections from Run list', () => {
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsTable()
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsColumnByName('Run name')
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsColumnByName('Run 1')
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsColumnByName('Run 2')
        .should('exist');

      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsColumnByName('Execution name > Artifact name')
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsColumnByName('digit-classification > metrics')
        .should('exist');

      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricName('accuracy')
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricCell('accuracy', 1)
        .should('contain.text', '92');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricCell('accuracy', 2)
        .should('contain.text', '92');

      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricName('displayName')
        .should('exist');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricCell('displayName', 1)
        .should('contain.text', '"metrics"');
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricCell('displayName', 2)
        .should('contain.text', '"metrics"');
    });

    it('displays confusion matrix data based on selections from Run list', () => {
      compareRunsMetricsContent.findConfusionMatrixTab().click();

      const confusionMatrixCompare = compareRunsMetricsContent
        .findConfusionMatrixTabContent()
        .findConfusionMatrixSelect(mockRun.run_id);

      // check graph data
      const graph = confusionMatrixCompare.findConfusionMatrixGraph();
      graph.checkLabels(['Setosa', 'Versicolour', 'Virginica']);
      graph.checkCells([
        [38, 0, 0],
        [2, 19, 9],
        [1, 17, 19],
      ]);

      // check expanded graph
      confusionMatrixCompare.findExpandButton().click();
      compareRunsMetricsContent
        .findConfusionMatrixTabContent()
        .findExpandedConfusionMatrix()
        .find()
        .should('exist');
    });

    it('display markdown based on selections from Run list', () => {
      compareRunsMetricsContent.findMarkdownTab().click();
      const markDown = compareRunsMetricsContent
        .findMarkdownTabContent()
        .findMarkdownSelect(mockRun.run_id);
      markDown.findMarkdown().should('have.text', 'helloWorld');
    });

    it('displays ROC curve empty state when no artifacts are found', () => {
      compareRunsMetricsContent.findRocCurveTab().click();
      const content = compareRunsMetricsContent.findRocCurveTabContent();
      content.findRocCurveSearchBar().type('invalid');
      content.findRocCurveTableEmptyState().should('exist');
    });
  });

  describe('No metrics', () => {
    beforeEach(() => {
      initIntercepts(true);
      compareRunsGlobal.visit(projectName, mockExperiment.experiment_id, [
        mockRun.run_id,
        mockRun2.run_id,
        mockRun3.run_id,
      ]);
    });

    it('shows no data state when the Runs list has selections but no metrics', () => {
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsNoMetricsState()
        .should('exist');
      compareRunsMetricsContent.findConfusionMatrixTab().click();
      compareRunsMetricsContent
        .findConfusionMatrixTabContent()
        .findConfusionMatrixNoMetricsState()
        .should('exist');
      compareRunsMetricsContent.findRocCurveTab().click();
      compareRunsMetricsContent
        .findRocCurveTabContent()
        .findRocCurveNoMetricsState()
        .should('exist');
      compareRunsMetricsContent.findMarkdownTab().click();
      compareRunsMetricsContent
        .findMarkdownTabContent()
        .findMarkdownNoMetricsState()
        .should('exist');
    });

    it('shows empty state when the Runs list has no selections', () => {
      compareRunsListTable.findSelectAllCheckbox().click(); // Uncheck all
      compareRunsMetricsContent
        .findScalarMetricsTabContent()
        .findScalarMetricsEmptyState()
        .should('exist');
      compareRunsMetricsContent.findConfusionMatrixTab().click();
      compareRunsMetricsContent
        .findConfusionMatrixTabContent()
        .findConfusionMatrixEmptyState()
        .should('exist');
      compareRunsMetricsContent.findRocCurveTab().click();
      compareRunsMetricsContent.findRocCurveTabContent().findRocCurveEmptyState().should('exist');
      compareRunsMetricsContent.findMarkdownTab().click();
      compareRunsMetricsContent.findMarkdownTabContent().findMarkdownEmptyState().should('exist');
    });
  });
});

const initIntercepts = (noMetrics?: boolean) => {
  cy.interceptOdh(
    'GET /api/config',
    mockDashboardConfig({ disablePipelineExperiments: false, disableS3Endpoint: false }),
  );
  cy.interceptK8sList(
    DataSciencePipelineApplicationModel,
    mockK8sResourceList([
      mockDataSciencePipelineApplicationK8sResource({ namespace: projectName }),
    ]),
  );
  cy.interceptK8s(
    DataSciencePipelineApplicationModel,
    mockDataSciencePipelineApplicationK8sResource({ namespace: projectName }),
  );
  cy.interceptK8s(
    RouteModel,
    mockRouteK8sResource({
      notebookName: 'ds-pipeline-dspa',
      namespace: projectName,
    }),
  );
  cy.interceptK8sList(
    ProjectModel,
    mockK8sResourceList([
      mockProjectK8sResource({ k8sName: projectName, displayName: projectName }),
    ]),
  );
  cy.interceptOdh(
    'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/pipelines',
    {
      path: { namespace: projectName, serviceName: 'dspa' },
    },
    buildMockPipelines([initialMockPipeline]),
  );
  cy.interceptOdh(
    'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/experiments/:experimentId',
    {
      path: {
        namespace: projectName,
        serviceName: 'dspa',
        experimentId: mockExperiment.experiment_id,
      },
    },
    mockExperiment,
  );

  cy.interceptOdh(
    'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
    {
      path: { namespace: projectName, serviceName: 'dspa', runId: mockRun.run_id },
    },
    mockRun,
  ).as('validRun');

  cy.interceptOdh(
    'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
    {
      path: { namespace: projectName, serviceName: 'dspa', runId: mockRun2.run_id },
    },
    mockRun2,
  );

  cy.interceptOdh(
    'GET /api/service/pipelines/:namespace/:serviceName/apis/v2beta1/runs/:runId',
    {
      path: { namespace: projectName, serviceName: 'dspa', runId: mockRun3.run_id },
    },
    mockRun3,
  );

  initMlmdIntercepts(projectName, { noMetrics });
};

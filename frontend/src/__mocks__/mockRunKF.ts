/* eslint-disable camelcase */
import { PipelineRunKFv2, RuntimeStateKF, StorageStateKF } from '~/concepts/pipelines/kfTypes';

export const buildMetricRunKF = (run: Partial<PipelineRunKFv2>): PipelineRunKFv2 => ({
  experiment_id: 'c231cc38-3691-4498-a5f0-3305f2a2e5ee',
  run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
  display_name: 'metric-2',
  storage_state: StorageStateKF.AVAILABLE,
  pipeline_version_reference: {
    pipeline_id: 'b8915a31-2c05-4518-a36b-d65fc27f0116',
    pipeline_version_id: 'fed8441e-8a79-45aa-bea8-ac3474781a11',
  },
  service_account: 'pipeline-runner-dspa',
  created_at: '2024-08-01T05:47:32Z',
  scheduled_at: '2024-08-01T05:47:32Z',
  finished_at: '2024-08-01T05:47:52Z',
  state: RuntimeStateKF.SUCCEEDED,
  run_details: {
    task_details: [
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '123d8b38-af2c-4d32-9995-d6e269fe2cea',
        display_name: 'wine-classification',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-4162124047',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '1768d534-1dc8-4a75-9f1e-ae5355d02972',
        display_name: 'digit-classification',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-2385283427',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '1fab61bc-3d93-4e9a-92c3-8d474942133d',
        display_name: 'iris-sgdclassifier',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-1228799420',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '232f0d04-a626-45e3-a9f9-a48dd787e630',
        display_name: 'wine-classification-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:47Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-983875308',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '27927f6f-a376-4bb4-a882-65f09d74d8ad',
        display_name: 'executor',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SKIPPED,
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '34331c9f-7a51-4452-a52d-51d83b6f21e3',
        display_name: 'executor',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SKIPPED,
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '3eff2302-2818-4866-a371-63fe179266a8',
        display_name: 'executor',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SKIPPED,
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '4c76c275-6c2f-4790-ae81-f3069ebcf074',
        display_name: 'markdown-visualization-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:47Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-1810615256',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: '528ff44f-19fe-4f8b-9f60-5216dae1cbea',
        display_name: 'html-visualization',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-1535422023',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'a3ed0e86-6a87-43ca-ad5b-87472984edce',
        display_name: 'metrics-visualization-pipeline-nph6c',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:32Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:33Z',
            state: RuntimeStateKF.RUNNING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-2835557459',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'a7fa8ac9-49e9-43d4-81e3-a824542507e4',
        display_name: 'digit-classification-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:47Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-2549297592',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'a8b9a6ab-a91c-4292-b075-08f40e456a18',
        display_name: 'executor',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SKIPPED,
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'afd21ed3-0b56-4757-85ae-b90ea3e9d29f',
        display_name: 'root',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.RUNNING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-642938693',
          },
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-2570599817',
          },
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-737415826',
          },
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-1614169445',
          },
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-191905569',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'c1388ce8-dc45-4693-a4f3-62660adad230',
        display_name: 'html-visualization-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:47Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-3371702500',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'd4166c5c-353c-47b7-8208-aca6ef6dab33',
        display_name: 'iris-sgdclassifier-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:42Z',
        end_time: '2024-08-01T05:47:47Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-3411748585',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'de96e7fd-b1e2-4431-99ea-c177764bc69f',
        display_name: 'markdown-visualization',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-910676355',
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'f76be423-6b8d-4b59-a807-9a3a7ffd1cdc',
        display_name: 'executor',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:52Z',
        end_time: '2024-08-01T05:47:52Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:53Z',
            state: RuntimeStateKF.SKIPPED,
          },
        ],
      },
      {
        run_id: '785dd7f8-42ea-4bcc-9623-9f0b7ccfe0e7',
        task_id: 'f9a595eb-e299-4711-ab34-10651c7b7567',
        display_name: 'root-driver',
        create_time: '2024-08-01T05:47:32Z',
        start_time: '2024-08-01T05:47:32Z',
        end_time: '2024-08-01T05:47:35Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          {
            update_time: '2024-08-01T05:47:33Z',
            state: RuntimeStateKF.PENDING,
          },
          {
            update_time: '2024-08-01T05:47:43Z',
            state: RuntimeStateKF.SUCCEEDED,
          },
        ],
        child_tasks: [
          {
            pod_name: 'metrics-visualization-pipeline-nph6c-3334176150',
          },
        ],
      },
    ],
  },
  state_history: [
    {
      update_time: '2024-08-01T05:47:32Z',
      state: 'PENDING',
    },
    {
      update_time: '2024-08-01T05:47:33Z',
      state: 'RUNNING',
    },
    {
      update_time: '2024-08-01T05:47:53Z',
      state: 'SUCCEEDED',
    },
  ],
  ...run,
});

export const buildMockRunKF = (run?: Partial<PipelineRunKFv2>): PipelineRunKFv2 => ({
  experiment_id: '1a1a1e71-25b6-46b6-a9eb-6ff1d8518be9',
  run_id: '17577391-357e-489f-b88a-f0f8895d5376',
  display_name: 'Test run',
  storage_state: StorageStateKF.AVAILABLE,
  pipeline_version_reference: {
    pipeline_id: 'f962f8b4-8a56-4499-9907-1eb7c407a8ff',
    pipeline_version_id: '90f05f62-36e6-4fb3-a769-da977a468273',
  },
  runtime_config: { parameters: { min_max_scaler: false, neighbors: 1, standard_scaler: false } },
  service_account: 'pipeline-runner-dspa',
  created_at: '2024-03-15T17:59:35Z',
  scheduled_at: '2024-03-15T17:59:35Z',
  finished_at: '2024-03-15T18:00:25Z',
  state: RuntimeStateKF.SUCCEEDED,
  run_details: {
    task_details: [
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '0891c2b7-7ea6-4c75-8254-24f9c736e837',
        display_name: 'train-model',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:25Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-4001010741' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '141d6424-59db-4d9d-86e9-98e1a811e453',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:05Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SKIPPED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3692705603' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '16123c45-5b1b-458c-b4d9-afa6dc3e4887',
        display_name: 'normalize-dataset-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:10Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-928724422' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '1d62e55b-ea12-4f27-8b60-b35b007a7812',
        display_name: 'train-model-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:20Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3775069846' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '4dd95b59-bd8f-4562-bfc3-e52fffe0c560',
        display_name: 'iris-training-pipeline-v4zp7',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:35Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:36Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2780559103' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '5e9ea183-6817-432c-9ee3-bd27013ae3fa',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:15Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SKIPPED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-4101678931' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '6c5d570a-7b88-4053-80d8-add0463d7bf8',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:25Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SKIPPED }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '877af71a-07f6-4d15-b3a2-c771b2876996',
        display_name: 'root',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:55Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3569115838' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'a65b8683-0fb7-4103-83ca-0a5f16641ebc',
        display_name: 'create-dataset',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:05Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2757091352' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'b0873f0c-8435-4bb3-a9d0-27ac1668d562',
        display_name: 'create-dataset-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:55Z',
        end_time: '2024-03-15T17:59:59Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3312624493' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'c1b54b9c-9cfd-449d-b425-792849564f72',
        display_name: 'root-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:35Z',
        end_time: '2024-03-15T17:59:42Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:36Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T17:59:46Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-1033443722' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'e94ce91f-ba15-45d6-9d00-6be83ab36ce7',
        display_name: 'normalize-dataset',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:15Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2244644869' }],
      },
    ],
  },
  state_history: [
    { update_time: '2024-03-15T17:59:35Z', state: 'PENDING' },
    { update_time: '2024-03-15T17:59:36Z', state: 'RUNNING' },
    { update_time: '2024-03-15T18:00:26Z', state: 'SUCCEEDED' },
  ],
  ...run,
});

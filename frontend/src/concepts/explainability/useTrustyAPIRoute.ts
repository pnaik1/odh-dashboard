import React from 'react';
import useFetchState, {
  FetchState,
  FetchStateCallbackPromise,
  NotReadyError,
} from '~/utilities/useFetchState';
import { getTrustyAIAPIRoute } from '~/api/';
import { RouteKind } from '~/k8sTypes';
import { FAST_POLL_INTERVAL } from '~/utilities/const';
import useBiasMetricsEnabled from './useBiasMetricsEnabled';

type State = string | null;
const useTrustyAPIRoute = (hasCR: boolean, namespace: string): FetchState<State> => {
  const [biasMetricsEnabled] = useBiasMetricsEnabled();
  const callback = React.useCallback<FetchStateCallbackPromise<State>>(
    (opts) => {
      if (!biasMetricsEnabled) {
        return Promise.reject(new NotReadyError('Bias metrics is not enabled'));
      }
      if (!hasCR) {
        return Promise.reject(new NotReadyError('CR not created'));
      }

      //TODO: API URI must use HTTPS before release.
      return getTrustyAIAPIRoute(namespace, opts)
        .then((result: RouteKind) => `${result.spec.port.targetPort}://${result.spec.host}`)
        .catch((e) => {
          if (e.statusObject?.code === 404) {
            // Not finding is okay, not an error
            return null;
          }
          throw e;
        });
    },
    [hasCR, namespace, biasMetricsEnabled],
  );

  // TODO: add duplicate functionality to useFetchState.
  const state = useFetchState<State>(callback, null, {
    initialPromisePurity: true,
  });

  const [data, , , refresh] = state;

  const hasData = !!data;
  React.useEffect(() => {
    let interval;
    if (!hasData) {
      interval = setInterval(refresh, FAST_POLL_INTERVAL);
    }
    return () => {
      clearInterval(interval);
    };
  }, [hasData, refresh]);
  return state;
};

export default useTrustyAPIRoute;
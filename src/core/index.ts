import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import {
  createActionTypeOnBegin,
  createActionTypeOnFailure,
  createActionTypeOnFinish,
  createActionTypeOnSuccess,
} from '../action';
import { noop } from '../helper';
import { Fn, UnfoldSagaCallbacksType, UnfoldSagaHandlerType, UnfoldSagaOptionsType } from '../types';

/**
 * @param {UnfoldSagaHandlerType} body
 * @param {UnfoldSagaActionType} body.action Action
 * @param {Function} body.handler Main handler function. Its returned value will become onSuccess callback param
 * @returns {SagaIterator} SagaIterator
 * @description Common saga helper that unifies handling side effects into only one standard form
 * @example
 * ```ts
 * import {SagaIterator} from 'redux-saga';
 * import {call, takeLatest} from 'redux-saga/effects';
 * import {unfoldSaga} from 'redux-unfold-saga-toolkit';
 * import {fetchPosts} from './action';
 *
 * // Saga function
 * function* takeQueryPosts(action: UnfoldSagaActionType): Iterable<SagaIterator> {
 *   yield unfoldSaga({
 *   action: action,
 *   handler: function* () {
 *     const data = yield call(ApiPost.listPost);
 *     return data;
 *   },
 *  });
 * }
 *
 * or
 *
 * // Async function
 * function* takeQueryPosts(action: UnfoldSagaActionType): Iterable<SagaIterator> {
 *   yield unfoldSaga({
 *   action: action,
 *   handler: async function () {
 *     const data = await ApiPost.listPost();
 *     return data;
 *   },
 *  });
 * }
 *
 * function* defaultSaga() {
 *   yield takeLatest('FETCH_POSTS', takeQueryPosts);
 *   // yield takeLatest(fetchPosts, takeQueryPosts);
 *   // yield takeLatest(fetchPosts.type, takeQueryPosts);
 * }
 * ```
 */
export function* unfoldSaga({ action, handler }: UnfoldSagaHandlerType): SagaIterator {
  let data: any;
  const defaultCallbacks: Required<UnfoldSagaCallbacksType> = {
    onBegin: noop,
    onFinish: noop,
    onSuccess: noop,
    onFailure: noop,
  };
  const defaultOptions: UnfoldSagaOptionsType = {
    stateful: false,
  };

  Object.assign(defaultCallbacks, action.callbacks);
  Object.assign(defaultOptions, action.options);

  try {
    if (defaultOptions.stateful) yield put({ type: createActionTypeOnBegin(action.type) });
    yield call(defaultCallbacks.onBegin as Fn);
    if (['GeneratorFunction', 'AsyncGeneratorFunction'].includes(handler.constructor.name)) {
      data = yield* handler();
    } else {
      data = yield call(handler as Fn);
    }
    if (defaultOptions.stateful) yield put({ type: createActionTypeOnSuccess(action.type), payload: data });
    yield call(defaultCallbacks.onSuccess as Fn, data);
  } catch (error) {
    if (defaultOptions.stateful) yield put({ type: createActionTypeOnFailure(action.type), payload: error });
    yield call(defaultCallbacks.onFailure as Fn, error);
  } finally {
    if (defaultOptions.stateful) yield put({ type: createActionTypeOnFinish(action.type) });
    yield call(defaultCallbacks.onFinish as Fn);
  }

  return data;
}

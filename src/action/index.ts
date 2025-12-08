import {
  UnfoldSagaActionCreator,
  UnfoldSagaActionType,
  UnfoldSagaCallbacksType,
  UnfoldSagaStoreActionCreator,
} from '../types';

/**
 * @param key
 * @returns {string} `${key}_BEGAN`
 * @description Create onBegin action type
 * @example
 * ```ts
 * import {createActionTypeOnBegin} from 'redux-unfold-saga-toolkit';
 *
 * createActionTypeOnBegin('DO_SOMETHING') // DO_SOMETHING_BEGAN
 * ```
 */
export function createActionTypeOnBegin(key: string): string {
  return `${key}_BEGAN`;
}

/**
 * @param key
 * @returns {string} `${key}_FINISHED`
 * @description Create onFinish action type
 * @example
 * ```ts
 * import {createActionTypeOnFinish} from 'redux-unfold-saga-toolkit';
 *
 * createActionTypeOnFinish('DO_SOMETHING') // DO_SOMETHING_FINISHED
 * ```
 */
export function createActionTypeOnFinish(key: string): string {
  return `${key}_FINISHED`;
}

/**
 * @param key
 * @returns {string} `${key}_SUCCEEDED`
 * @description Create onSuccess action type
 * @example
 * ```ts
 * import {createActionTypeOnSuccess} from 'redux-unfold-saga-toolkit';
 *
 * createActionTypeOnSuccess('DO_SOMETHING') // DO_SOMETHING_SUCCEEDED
 * ```
 */
export function createActionTypeOnSuccess(key: string): string {
  return `${key}_SUCCEEDED`;
}

/**
 * @param key
 * @returns {string} `${key}_FAILED`
 * @description Create onFailure action type
 * @example
 * ```ts
 * import {createActionTypeOnFailure} from 'redux-unfold-saga-toolkit';
 *
 * createActionTypeOnFailure('DO_SOMETHING') // DO_SOMETHING_FAILED
 * ```
 */
export function createActionTypeOnFailure(key: string): string {
  return `${key}_FAILED`;
}

/**
 * @param type
 * @returns {UnfoldSagaActionCreator} action
 * @description Create an action for real life usage inside or even outside of a component, no dispatch to reducer
 * @example
 * ```ts
 * import {createAction} from 'redux-unfold-saga-toolkit';
 *
 * const fetchPosts = createAction<IPostPayload>('FETCH_POSTS');
 *
 * dispatch(
 *   fetchPosts(
 *     {category: 'HOT'},
 *     {
 *       onBegin: () => {
 *         // Do something before the query
 *         setLoading(true);
 *       },
 *       onFailure: (error: Error) => {
 *         // Do something in case of caught error
 *       },
 *       onSuccess: (posts: IPost[]) => {
 *         // Do something after the query succeeded
 *       },
 *       onFinish: () => {
 *         // Do something after everything is done
 *         setLoading(false);
 *       },
 *     },
 *   ),
 * );
 * ```
 */
export function createAction<PayloadType = any>(type: string): UnfoldSagaActionCreator<PayloadType> {
  function actionCreator(payload?: PayloadType, callbacks: UnfoldSagaCallbacksType = {}): UnfoldSagaActionType {
    return {
      callbacks,
      options: {},
      payload,
      type,
    };
  }
  actionCreator.type = type;
  actionCreator.toString = () => type;
  return actionCreator;
}

/**
 * @param type
 * @returns {UnfoldSagaActionCreator} action
 * @description Create an action for real life usage inside or even outside of a component, dispatch to reducer with automatic create action type
 * @example
 * // Action
 * ```ts
 * import {createStoreAction, createReducer} from 'redux-unfold-saga-toolkit';
 *
 * const fetchPosts = createStoreAction<IPostPayload>('FETCH_POSTS');
 *
 * dispatch(
 *   fetchPosts(
 *     {category: 'HOT'},
 *     {
 *       onBegin: () => {
 *         // Do something before the query
 *         setLoading(true);
 *       },
 *       onFailure: (error:Error) => {
 *         // Do something in case of caught error
 *       },
 *       onSuccess: (posts:IPost) => {
 *         // Do something after the query succeeded
 *       },
 *       onFinish: () => {
 *         // Do something after everything is done
 *         setLoading(false);
 *       },
 *     },
 *   ),
 * );
 *
 * // Reducer
 * const initState = {
 * 	posts: [],
 * 	error: null,
 * 	loading: true,
 * };
 *
 * const postReducer = createReducer(initState, (builder) => {
 *   builder.addCase<void>(fetchPosts.begin, (state, action) => {
 *     state.loading = true;
 *   });
 *   builder.addCase<void>(fetchPosts.finish, (state, action) => {
 *     state.loading = false;
 *   });
 *   builder.addCase<IPost[]>(fetchPosts.success, (state, action) => {
 *     state.posts = action.payload;
 *   });
 *   builder.addCase<Error>(fetchPosts.failure, (state, action) => {
 *     state.error = action.payload;
 *   });
 * })
 * ```
 */
export function createStoreAction<PayloadType = any>(type: string): UnfoldSagaStoreActionCreator<PayloadType> {
  function actionCreator(payload?: PayloadType, callbacks: UnfoldSagaCallbacksType = {}): UnfoldSagaActionType {
    return {
      callbacks,
      options: { stateful: true },
      payload,
      type,
    };
  }
  actionCreator.type = type;
  actionCreator.toString = () => type;
  actionCreator.begin = createActionTypeOnBegin(type);
  actionCreator.finish = createActionTypeOnFinish(type);
  actionCreator.success = createActionTypeOnSuccess(type);
  actionCreator.failure = createActionTypeOnFailure(type);
  return actionCreator;
}

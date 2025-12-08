import { produce } from 'immer';
import {
  UnfoldSagaActionReducer,
  UnfoldSagaActionReducerMapBuilder,
  UnfoldSagaActionType,
  UnfoldSagaCaseReducer,
} from '../types';

function executeReducerBuilderCallback<S>(builderCallback: (builder: UnfoldSagaActionReducerMapBuilder<S>) => void) {
  const actionsMap: { [key: string]: UnfoldSagaCaseReducer<S> } = {};
  const builder = {
    addCase: (action: UnfoldSagaActionReducer, reducer: UnfoldSagaCaseReducer<S>) => {
      const type = typeof action === 'string' ? action : action.type;
      actionsMap[type] = reducer;
      return builder;
    },
  };

  builderCallback(builder);
  return actionsMap;
}

/**
 *
 * @param initialState
 * @param builderCallback
 * @returns State of reducer has immer
 * @description A utility function that allows defining a reducer as a mapping from action
 * type to *case reducer* functions that handle these action types. The
 * reducer's initial state is passed as the first argument.
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
export function createReducer<S = any>(
  initialState: S,
  builderCallback: (builder: UnfoldSagaActionReducerMapBuilder<S>) => void,
) {
  const actionsMap = executeReducerBuilderCallback(builderCallback);
  return function reducer(state = initialState, action: UnfoldSagaActionType): S {
    const caseReducer = actionsMap[action.type] as UnfoldSagaCaseReducer<S> | undefined;
    return produce(state, (draft) => {
      if (caseReducer) caseReducer(draft, action);
    });
  };
}

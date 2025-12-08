import { Draft } from 'immer';
import { AnyAction } from 'redux-saga';

export interface UnfoldSagaCallbacksType {
  onBegin?: Function;
  onFinish?: Function;
  onSuccess?: Function;
  onFailure?: Function;
}

export interface UnfoldSagaOptionsType {
  stateful?: boolean;
}

export interface UnfoldSagaHandlerType {
  action: UnfoldSagaActionType;
  handler: Function | GeneratorFunction;
}

export interface UnfoldSagaPayloadAction<T = any> {
  type: string;
  payload: T;
}

export type Fn = (...args: any[]) => any;

export type UnfoldSagaCaseReducer<S, P = any> = (state: Draft<S>, action: UnfoldSagaPayloadAction<P>) => void;

export type UnfoldSagaActionReducer = UnfoldSagaActionCreator | string;

export interface UnfoldSagaActionReducerMapBuilder<S> {
  addCase: <P = any>(
    action: UnfoldSagaActionReducer,
    reducer: UnfoldSagaCaseReducer<S, P>,
  ) => UnfoldSagaActionReducerMapBuilder<S>;
}

export interface UnfoldSagaActionType<PayloadType = any> extends AnyAction {
  payload: PayloadType;
  options: UnfoldSagaOptionsType;
  callbacks: UnfoldSagaCallbacksType;
}

export interface UnfoldSagaActionCreator<PayloadType = any> {
  (payload?: PayloadType, callbacks?: UnfoldSagaCallbacksType): UnfoldSagaActionType;
  type: string;
}

export interface UnfoldSagaStoreActionCreator<PayloadType = any> extends UnfoldSagaActionCreator<PayloadType> {
  begin: string;
  finish: string;
  success: string;
  failure: string;
}

import { call, put } from 'redux-saga/effects';
import { UnfoldSagaActionCreator } from '../src/types';
import {
  createAction,
  createActionTypeOnBegin,
  createActionTypeOnFailure,
  createActionTypeOnFinish,
  createActionTypeOnSuccess,
  createStoreAction,
} from './../src/action';
import { unfoldSaga } from './../src/core';

// Test create action type
describe('Create action type', () => {
  let key: string;

  beforeAll(() => {
    key = 'TEST';
  });

  describe('createActionTypeOnBegin', () => {
    test('should return correct string', () => {
      const result = createActionTypeOnBegin(key);
      expect(result).toBe('TEST_BEGAN');
    });
  });

  describe('createActionTypeOnFailure', () => {
    test('should return correct string', () => {
      const result = createActionTypeOnFailure(key);
      expect(result).toBe('TEST_FAILED');
    });
  });

  describe('createActionTypeOnFinish', () => {
    test('should return correct string', () => {
      const result = createActionTypeOnFinish(key);
      expect(result).toBe('TEST_FINISHED');
    });
  });

  describe('createActionTypeOnSuccess', () => {
    test('should return correct string', () => {
      const result = createActionTypeOnSuccess(key);
      expect(result).toBe('TEST_SUCCEEDED');
    });
  });
});

// Test create action
describe('Create action', () => {
  const DO_SOMETHING = 'DO_SOMETHING';
  let action: UnfoldSagaActionCreator;

  beforeAll(() => {
    action = createAction(DO_SOMETHING);
  });

  test('should create a correct redux action', () => {
    expect(action()).toEqual(expect.objectContaining({ type: DO_SOMETHING }));
  });
});

// Test create store action
describe('Create store action', () => {
  const DO_SOMETHING = 'DO_SOMETHING';
  let action: UnfoldSagaActionCreator;

  beforeAll(() => {
    action = createStoreAction(DO_SOMETHING);
  });

  test('should create a correct redux action', () => {
    expect(action()).toEqual(expect.objectContaining({ type: DO_SOMETHING }));
  });
});

// Test Core unfoldSaga
describe('Core unfoldSaga', () => {
  const DO_SOMETHING = 'DO_SOMETHING';

  describe('when stateful is false', () => {
    test('should call onBegin, run handler, then onSuccess with handler result', () => {
      const onBegin = jest.fn();
      const onSuccess = jest.fn();
      const onFinish = jest.fn();
      const handler = jest.fn();
      const action = {
        type: DO_SOMETHING,
        callbacks: { onBegin, onSuccess, onFinish },
        options: { stateful: false },
      };

      const gen = unfoldSaga({ action, handler } as any);

      expect(gen.next().value).toEqual(call(onBegin));
      expect(gen.next().value).toEqual(call(handler as any));

      const afterHandler = gen.next('result-data');
      expect(afterHandler.value).toEqual(call(onSuccess, 'result-data'));

      expect(gen.next().value).toEqual(call(onFinish));

      const final = gen.next();
      expect(final.done).toBe(true);
      expect(final.value).toBe('result-data');
    });

    test('should call onFailure when handler throws', () => {
      const onFailure = jest.fn();
      const onFinish = jest.fn();
      const handler = jest.fn();
      const error = new Error('boom');
      const action = {
        type: DO_SOMETHING,
        callbacks: { onFailure, onFinish },
        options: { stateful: false },
      };

      const gen = unfoldSaga({ action, handler } as any);

      gen.next();
      gen.next();

      const afterThrow = gen.throw(error);
      expect(afterThrow.value).toEqual(call(onFailure, error));

      expect(gen.next().value).toEqual(call(onFinish));
    });
  });

  describe('when stateful is true', () => {
    test('should dispatch begin, success, finish actions', () => {
      const handler = jest.fn();
      const action = {
        type: DO_SOMETHING,
        callbacks: {},
        options: { stateful: true },
      };

      const gen = unfoldSaga({ action, handler } as any);

      expect(gen.next().value).toEqual(put({ type: `${DO_SOMETHING}_BEGAN` }));
      gen.next();
      expect(gen.next().value).toEqual(call(handler as any));

      const afterHandler = gen.next('payload-data');
      expect(afterHandler.value).toEqual(put({ type: `${DO_SOMETHING}_SUCCEEDED`, payload: 'payload-data' }));

      gen.next();
      expect(gen.next().value).toEqual(put({ type: `${DO_SOMETHING}_FINISHED` }));
    });

    test('should dispatch failure and finish actions when handler throws', () => {
      const handler = jest.fn();
      const error = new Error('boom');
      const action = {
        type: DO_SOMETHING,
        callbacks: {},
        options: { stateful: true },
      };

      const gen = unfoldSaga({ action, handler } as any);

      gen.next();
      gen.next();
      gen.next();

      const afterThrow = gen.throw(error);
      expect(afterThrow.value).toEqual(put({ type: `${DO_SOMETHING}_FAILED`, payload: error }));

      gen.next();
      expect(gen.next().value).toEqual(put({ type: `${DO_SOMETHING}_FINISHED` }));
    });
  });

  describe('fallbackValue behavior', () => {
    test('should use fallbackValue when handler returns null', () => {
      const handler = jest.fn();
      const action = {
        type: DO_SOMETHING,
        callbacks: {},
        options: { stateful: false },
      };

      const gen = unfoldSaga({ action, handler, fallbackValue: 'fallback' } as any);

      gen.next();
      gen.next();
      gen.next(null);
      gen.next();

      const final = gen.next();
      expect(final.value).toBe('fallback');
    });

    test('should NOT override falsy-but-valid data such as 0', () => {
      const handler = jest.fn();
      const action = {
        type: DO_SOMETHING,
        callbacks: {},
        options: { stateful: false },
      };

      const gen = unfoldSaga({ action, handler, fallbackValue: 'fallback' } as any);

      gen.next();
      gen.next();
      gen.next(0);
      gen.next();

      const final = gen.next();
      expect(final.value).toBe(0);
    });
  });
});

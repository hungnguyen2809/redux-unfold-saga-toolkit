import { UnfoldSagaActionCreator } from '../src/types';
import {
  createAction,
  createActionTypeOnBegin,
  createActionTypeOnFailure,
  createActionTypeOnFinish,
  createActionTypeOnSuccess,
  createStoreAction,
} from './../src/action';

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

import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface ExpensePrediction {
  category: string;
  confidence: number;
  classIndex: number;
}

export interface Spec extends TurboModule {
  predict(description: string): Promise<ExpensePrediction>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeExpenseAI',
);
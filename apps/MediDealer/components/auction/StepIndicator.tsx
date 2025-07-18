import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <View style={styles.stepContainer}>
      {[...Array(totalSteps)].map((_, step) => (
        <View key={step} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle,
            currentStep >= step + 1 && styles.activeStep
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step + 1 && styles.activeStepText
            ]}>{step + 1}</Text>
          </View>
          {step < totalSteps - 1 && <View style={[
            styles.stepLine,
            currentStep > step + 1 && styles.activeStepLine
          ]} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#007bff',
  },
  stepText: {
    color: '#495057',
    fontSize: 16,
  },
  activeStepText: {
    color: '#fff',
  },
  stepLine: {
    width: 25,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 5,
  },
  activeStepLine: {
    backgroundColor: '#007bff',
  },
});

export default StepIndicator; 
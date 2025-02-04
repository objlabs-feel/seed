import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const NavigationButtons = ({ 
  currentStep, 
  onPrevious, 
  onNext, 
  onSubmit 
}: NavigationButtonsProps) => {
  return (
    <View style={styles.container}>
      {currentStep > 1 && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onPrevious}
        >
          <Text style={styles.buttonText}>이전</Text>
        </TouchableOpacity>
      )}
      {currentStep < 3 ? (
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={onNext}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]}
          onPress={onSubmit}
        >
          <Text style={styles.buttonText}>등록하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NavigationButtons; 
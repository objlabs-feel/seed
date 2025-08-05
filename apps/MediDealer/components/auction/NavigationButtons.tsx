import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  prevText: string;
  onNext: () => void;
  nextText: string;
  onSubmit: () => void;  
  submitText: string;
  canReverse: boolean;
}

const NavigationButtons = ({ 
  currentStep, 
  totalSteps,
  onPrevious, prevText,
  onNext, nextText,
  onSubmit, submitText,
  canReverse
}: NavigationButtonsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // 이미 제출 중이면 무시
    
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {canReverse && currentStep > 1 && (
        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.disabledButton]} 
          onPress={onPrevious}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{prevText}</Text>
        </TouchableOpacity>
      )}
      {currentStep < totalSteps ? (
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={onNext}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{nextText}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{submitText}</Text>
          )}
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
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NavigationButtons; 
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import StepIndicator from '../components/auction/StepIndicator';
import Step1Screen from './auction/Step1Screen';
import Step2Screen from './auction/Step2Screen';
import Step3Screen from './auction/Step3Screen';
import NavigationButtons from '../components/auction/NavigationButtons';
import { createUserSalesItem, registerAuction } from '../services/medidealer/api';
import { departments, deviceTypes, locations, manufacturers } from '../constants/data';
import CreateAuctionStep1 from './auction/CreateAuctionStep1';
import CreateAuctionStep2 from './auction/CreateAuctionStep2';
import AntDesign from 'react-native-vector-icons/AntDesign';

// 날짜 포맷팅 함수
const formatDate = (date: Date) => {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 메인 컴포넌트
const AuctionRegistrationScreen = ({ navigation }: { navigation: any }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // location: locations[0]?.id || '',  // 첫 번째 지역
    hospitalName: '',
    name: '',
    phone: '',
    department: departments[0]?.id || '',  // 첫 번째 진료과
    equipmentType: departments[0]?.deviceTypes?.[0]?.device_type_id || '',  // 첫 번째 장비 유형
    manufacturer: manufacturers[0]?.id || '',  // 첫 번째 제조사
    manufacturingYear: '',
    quantity: '1',  // 수량 기본값 1
    transferDate: new Date(),  // 오늘 날짜로 기본값 설정
    sales_type: 1,
    area: locations[0]?.name || '',
    status: 1,
    description: '',
    images: []
  });
  const [errors, setErrors] = useState({});

  const validateStep = (step: number) => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.area) newErrors.area = '지역을 선택해주세요';
        if (!formData.department) newErrors.department = '진료과를 선택해주세요';
        if (!formData.equipmentType) newErrors.equipmentType = '장비 유형을 선택해주세요';
        if (!formData.quantity) newErrors.quantity = '수량을 입력해주세요';
        if (!formData.transferDate) newErrors.transferDate = '양도 가능일자를 선택해주세요';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: API 호출하여 데이터 저장
      // const response = await axios.post('YOUR_API_URL/auctions', formData);
      const response = await createUserSalesItem({
        sales_type: Number(formData.sales_type),          
        status: formData.status,
        name: formData.name,
        phone: formData.phone,
        hospitalName: formData.hospitalName,        
        department_id: formData.department,
        device_type_id: formData.equipmentType,
        manufacturer_id: formData.manufacturer,
        manufacture_date: formData.manufacturingYear,
        description: formData.description,
        images: formData.images,
        area: formData.area,
      });
      console.log(response);
      Alert.alert('성공', '경매가 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('오류', '경매 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateAuctionStep1
            formData={formData} 
            setFormData={setFormData} 
            errors={errors}
          />
        );
      case 2:
        return (
          <CreateAuctionStep2
            formData={formData} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={currentStep} totalSteps={2} />      
      {renderStep()}
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={2}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        prevText="이전"
        nextText="다음"
        submitText="등록하기"
        canReverse={true}
      />
    </View>
  );
};

// 스타일 추가
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: '#ced4da',
    borderRadius: 4,
  },
  dropdownContainer: {
    borderColor: '#ced4da',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#6c757d',
  },
  modalButtonConfirm: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
    width: 50,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 5,
  },
  activeStepLine: {
    backgroundColor: '#007bff',
  },
});

export default AuctionRegistrationScreen; 
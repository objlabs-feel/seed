import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getAuctionCompleteForBuyer, getAuctionConfirmForBuyer, getAuctionDetail, setAuctionBidAcceptForBuyer, setAuctionContactForBuyer } from '../services/medidealer/api';
import StepIndicator from '../components/auction/StepIndicator';
import NavigationButtons from '../components/auction/NavigationButtons';
import { WebView } from 'react-native-webview';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import { AuctionItemHistoryResponseDto, AuctionItemResponseDto } from '@repo/shared/dto';

interface AuctionBidAcceptScreenProps {
  route: {
    params: {
      auctionId: string;
    };
  };
  navigation: any;
}

const AuctionBidAcceptScreen: React.FC<AuctionBidAcceptScreenProps> = ({ route, navigation }) => {
  const { auctionId } = route.params;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    addressDetail: '',
    zipCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    businessNo: '',    
  });
  const [scheduleData, setScheduleData] = useState({
    visitDate: '',
    visitTime: '',
  });
  const [auctionDetail, setAuctionDetail] = useState<AuctionItemResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    companyName: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    businessNo: '',
    visitDate: '',
    visitTime: '',
  });
  const [bidAmount, setBidAmount] = useState(0);
  const [showWebView, setShowWebView] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleZipCodeSearch = () => {
    setShowWebView(true);
  };

  const handleWebViewMessage = (event: any) => {
    const { roadAddress, jibunAddress, zonecode } = JSON.parse(event.nativeEvent.data);
    setFormData({
      ...formData,
      address: roadAddress,
      addressDetail: jibunAddress,
      zipCode: zonecode,
    });
    setShowWebView(false);
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.companyName) newErrors.companyName = '병원명(업체명)을 입력해주세요';
        if (!formData.zipCode) newErrors.zipCode = '우편번호를 입력해주세요';
        if (!formData.address) newErrors.address = '주소를 입력해주세요';        
        if (!formData.addressDetail) newErrors.addressDetail = '상세주소를 입력해주세요';
        if (!formData.ownerName) newErrors.ownerName = '대표자명을 입력해주세요';
        if (!formData.ownerEmail) newErrors.ownerEmail = '이메일을 입력해주세요';
        if (!formData.ownerMobile) newErrors.ownerMobile = '휴대폰번호를 입력해주세요';
        if (!formData.businessNo) newErrors.businessNo = '사업자등록번호를 입력해주세요';        
        break;
      case 2:
        if (!scheduleData.visitDate) newErrors.visitDate = '방문일자를 입력해주세요';
        if (!scheduleData.visitTime) newErrors.visitTime = '방문시간을 입력해주세요';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = async () => {
    try {
      if (step === 1) {
        if (!validateStep(step)) {
          return;
        }
        const data = await setAuctionBidAcceptForBuyer(auctionId, formData);
        setStep(prev => prev + 1);
      } else if (step === 2) {
        if (!validateStep(step)) {
          return;
        }
        console.log('step2', scheduleData);
        const data = await setAuctionContactForBuyer(auctionId, scheduleData);
        setStep(prev => prev + 1);
      } else if (step === 3) {        
        const data = await getAuctionConfirmForBuyer(auctionId);
        setStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('다음 단계로 이동 중 오류:', error);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    try {
      const data = await getAuctionCompleteForBuyer(auctionId);
      console.log('data', data);
      navigation.goBack();
    } catch (error) {
      console.error('양도 완료 처리 중 오류:', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setScheduleData(prev => ({ ...prev, visitDate: formattedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && event.type !== 'dismissed') {
      const formattedTime = selectedTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setScheduleData(prev => ({ ...prev, visitTime: formattedTime }));
    }
  };

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        const { data } = await getAuctionDetail(auctionId);
        console.log('data', data);
        const bidAccept = data.item.auction_item_history.filter((bid: AuctionItemHistoryResponseDto) => bid.id === data.item.accept_id);
        setCurrentUserId(data.item.device.company.owner_id);
        setAuctionDetail(data.item);
        setStep(data.item.buyer_steps);
        setBidAmount(bidAccept[0].value);
      } catch (error) {
        console.error('경매 상세 정보 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [auctionId]);

  const renderStep = () => {
    if (showWebView) {
      return (
        <WebView
          source={{ uri: 'http://192.168.0.2:3000/postcode' }}
          onMessage={handleWebViewMessage}
          style={styles.webView}
        />
      );
    }
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 1: 판매자 정보 확인 및 입금정보 확인</Text>            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>입금 정보</Text>
              <Text style={styles.infoText}>입금액: {bidAmount.toLocaleString()}원</Text>
              <Text style={styles.infoText}>입금은행: 하나은행</Text>
              <Text style={styles.infoText}>계좌번호: 000-0000000-00000</Text>
              <Text style={styles.infoText}>예금주: 주식회사 메디딜러</Text>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="병원명(업체명) *"
                value={formData.companyName}              
                onChangeText={(value) => handleInputChange('companyName', value)}
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>            

            <View style={styles.inputGroup}>
              <View style={styles.addressRow}>
                <View style={styles.fieldHalf}>
                  <TextInput
                    style={[styles.input, styles.zipCodeInput]}
                    placeholder="우편번호 *"
                    value={formData.zipCode}
                    keyboardType="numeric"
                    onChangeText={(value) => handleInputChange('zipCode', value)}                  
                  />
                  {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                </View>
                <TouchableOpacity 
                  style={[styles.searchButton, { alignSelf: 'flex-start' }]}
                  onPress={handleZipCodeSearch}
                >
                  <Text style={styles.searchButtonText}>주소 검색</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="주소 *"
                  value={formData.address}                
                  onChangeText={(value) => handleInputChange('address', value)}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="상세주소 *"
                  value={formData.addressDetail}
                  onChangeText={(value) => handleInputChange('addressDetail', value)}
                />
                {errors.addressDetail && <Text style={styles.errorText}>{errors.addressDetail}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="대표자명 *"
                value={formData.ownerName}
                onChangeText={(value) => handleInputChange('ownerName', value)}
              />
              {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="이메일 *"
                value={formData.ownerEmail}
                keyboardType="email-address"
                onChangeText={(value) => handleInputChange('ownerEmail', value)}
              />
              {errors.ownerEmail && <Text style={styles.errorText}>{errors.ownerEmail}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="휴대폰번호 *"
                value={formData.ownerMobile}
                keyboardType="numeric"
                onChangeText={(value) => handleInputChange('ownerMobile', value)}
              />
              {errors.ownerMobile && <Text style={styles.errorText}>{errors.ownerMobile}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="사업자등록번호 *"
                value={formData.businessNo}
                keyboardType="numeric"
                onChangeText={(value) => handleInputChange('businessNo', value)}
              />
              {errors.businessNo && <Text style={styles.errorText}>{errors.businessNo}</Text>}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 2: 예치금 입금 및 예상 방문일자</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>입금 정보</Text>
              <Text style={styles.infoText}>입금액: {bidAmount.toLocaleString()}원</Text>
              <Text style={styles.infoText}>입금은행: 하나은행</Text>
              <Text style={styles.infoText}>계좌번호: 000-0000000-00000</Text>
              <Text style={styles.infoText}>예금주: 주식회사 메디딜러</Text>
            </View>
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={scheduleData.visitDate ? styles.inputText : styles.placeholderText}>
                  {scheduleData.visitDate || '예상 방문일자 선택 *'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePickerAndroid
                  value={new Date()}
                  mode="date"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
              {errors.visitDate && <Text style={styles.errorText}>{errors.visitDate}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={scheduleData.visitTime ? styles.inputText : styles.placeholderText}>
                  {scheduleData.visitTime || '예상 방문시간 선택 *'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePickerAndroid
                  value={new Date()}
                  mode="time"
                  onChange={onTimeChange}
                  is24Hour={true}
                />
              )}
              {errors.visitTime && <Text style={styles.errorText}>{errors.visitTime}</Text>}
            </View>
          </View>          
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 3: 확정대기</Text>
            {auctionDetail?.seller_steps === 2 && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>판매자 방문일정 확인</Text>
              <Text style={styles.infoText}>1. 시스템에서 입금내역을 확인중입니다...</Text>
              <Text style={styles.infoText}>2. 판매자가 방문일정을 확인하길 기다리고 있습니다...</Text>
            </View>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>판매자 정보</Text>
              <Text style={styles.infoText}>판매자명: {auctionDetail?.device?.company?.name}</Text>
              <Text style={styles.infoText}>연락처: {auctionDetail?.device?.company?.business_mobile}</Text>
              <Text style={styles.infoText}>주소: {auctionDetail?.device?.company?.address || ''} {auctionDetail?.device?.company?.address_detail || ''}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>양도 확정 알림 안내</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.infoText}>방문일자: {auctionDetail?.visit_date ? auctionDetail?.visit_date.split('T')[0] : ''}</Text>
                <Text style={styles.infoText}>방문시간: {auctionDetail?.visit_time}</Text>
              </View>
            </View>            
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 4: 인도완료</Text>
            <Text style={styles.completeText}>거래가 완료되었습니다.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={step} totalSteps={4} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderStep()}
      </ScrollView>
      {(step !== 3 || auctionDetail?.seller_steps !== 2) && (
      <NavigationButtons
        currentStep={step}
        totalSteps={4}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleComplete}
        prevText="이전"
        nextText={step !== 3 ? "다음" : "양수 완료"}
        submitText="완료"
        canReverse={false}
      />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    height: 45,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    height: 45,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  waitingText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginTop: 20,
  },
  completeText: {
    fontSize: 18,
    color: '#28a745',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  inputGroup: {    
    marginBottom: 10,
  },
  addressContainer: {
    marginBottom: 0,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  zipCodeInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
    height: 45,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
  },
  webView: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 4,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    alignSelf: 'flex-start',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bankContainer: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  bankCodeInput: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
  },
  bankHolderField: {
    flex: 2,
  },
  bankAccountInput: {
    height: 45,
  },
  fieldHalf: {
    flex: 1,
  },
});

export default AuctionBidAcceptScreen; 
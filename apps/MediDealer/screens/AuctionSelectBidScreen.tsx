import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAuctionCompleteForSeller, getAuctionDetail, setAuctionSelectBidForSeller, setAuctionContactForSeller, getMyProfile } from '../services/medidealer/api';
import StepIndicator from '../components/auction/StepIndicator';
import NavigationButtons from '../components/auction/NavigationButtons';
import SelectionModal from '../components/auction/SelectionModal';
import { AuctionItemResponseDto, AuctionItemHistoryResponseDto } from '@repo/shared/dto';

interface AuctionSelectBidScreenProps {
  route: {
    params: {
      auctionId: string;
    };
  };
  navigation: any;
}

const AuctionSelectBidScreen: React.FC<AuctionSelectBidScreenProps> = ({ route, navigation }) => {
  const { auctionId } = route.params;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accept_id: '',
    companyName: '',
    address: '',
    addressDetail: '',
    zipCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    businessNo: '',
    bankHolder: '',
    bankAccount: '',
    bankCode: '',
  });
  const [auctionItem, setAuctionItem] = useState<AuctionItemResponseDto | null>(null);
  const [auctionHistory, setAuctionHistory] = useState<AuctionItemHistoryResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [banks] = useState([
    { id: '004', name: '국민은행' },
    { id: '088', name: '신한은행' },
    { id: '020', name: '우리은행' },
    { id: '081', name: '하나은행' },
    { id: '023', name: 'SC제일은행' },
    { id: '089', name: '케이뱅크' },
    { id: '090', name: '카카오뱅크' },
    { id: '003', name: 'IBK기업은행' },
    { id: '007', name: 'NH농협은행' },
    { id: '004', name: 'KB국민은행' },
    { id: '005', name: 'MG새마을금고' },
    // ... 필요한 은행 추가
  ]);
  const [highestBid, setHighestBid] = useState(0);
  const [errors, setErrors] = useState({
    companyName: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    businessNo: '',
    bankCode: '',
    bankHolder: '',
    bankAccount: '',
  });

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
        if (!formData.bankCode) newErrors.bankCode = '입금은행을 선택해주세요';
        if (!formData.bankHolder) newErrors.bankHolder = '예금주를 입력해주세요';
        if (!formData.bankAccount) newErrors.bankAccount = '입금계좌번호를 입력해주세요';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    if (name === 'ownerEmail') {
      if (!value.includes('@') || !value.includes('.') || value.includes(' ')) {
        setErrors({ ...errors, ownerEmail: '이메일 형식이 올바르지 않습니다' });
      } else {
        setErrors({ ...errors, ownerEmail: '' });
      }
    }
    setFormData({ ...formData, [name]: value });
  };

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

  const handleNext = async () => {
    try {
      if (step === 1) {
        if (!validateStep(step)) {
          return;
        }
        console.log('step1');
        const data = await setAuctionSelectBidForSeller(auctionId, formData);
        console.log('data', data);
        setStep(prev => prev + 1);
      } else if (step === 2) {
        console.log('step2');
        setStep(prev => prev + 1);
      } else if (step === 3) {
        console.log('step3');
        const data = await setAuctionContactForSeller(auctionId, formData);
        console.log('data', data);
        setStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('입찰 처리 중 오류:', error);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    try {
      const data = await getAuctionCompleteForSeller(auctionId);
      console.log('data', data);
      navigation.goBack();
    } catch (error) {
      console.error('양도 완료 처리 중 오류:', error);
    }
  };

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        const { data } = await getAuctionDetail(auctionId);
        const { data: profile } = await getMyProfile();
        console.log('data', data.data);
        console.log('profile', profile.profile);
        setCurrentUserId(data.item.device.company.owner_id);
        setAuctionItem(data.item);
        setAuctionHistory(data.item.auction_item_history);
        setFormData({
          ...formData,
          companyName: profile?.profile?.company?.name || '',
          address: profile?.profile?.company?.address || '',
          addressDetail: profile?.profile?.company?.address_detail || '',
          zipCode: profile?.profile?.company?.zipcode || '',
          ownerName: profile?.profile?.name || '',
          ownerEmail: profile?.profile?.email || '',
          ownerMobile: profile?.profile?.mobile || '',
          businessNo: profile?.profile?.company?.business_no || '',
          bankHolder: profile?.profile?.company?.secret_info?.bankHolder || '',
          bankAccount: profile?.profile?.company?.secret_info?.bankAccount || '',
          bankCode: profile?.profile?.company?.secret_info?.bankCode || '',
        });
        setStep(data.item.seller_steps || 1);        
      } catch (error) {
        console.error('경매 상세 정보 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [auctionId]);

  useEffect(() => {
    updateHighestBid();
    console.log('AuctionItem?.accept_id', auctionItem?.accept_id);
    const acceptBid = auctionHistory.filter(bid => bid.id === auctionItem?.accept_id && bid.user_id === currentUserId);
    if (acceptBid && acceptBid.length > 0) {
      console.log('낙찰 처리');
      setFormData(
        {
          ...formData,
          accept_id: acceptBid[0].id.toString()
        }
      )
    }
  }, [auctionHistory]);

  // 최고가 찾는 함수 추가
  const updateHighestBid = async () => {
    try {
      const history = auctionHistory;
      if (history && history.length > 0) {
        // 입찰 기록을 금액 기준으로 정렬하고 최고가 반환
        const highestBid = Math.max(...history.map(bid => bid.value || 0));
        // 최고 입찰 기록 찾기
        // const acceptBid = history.filter(bid => bid.value === highestBid);
        // 같은 가격일때 가장 빠른 입찰 기록 찾기
        const acceptBid = history.filter(bid => bid.value === highestBid).sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())[0];
        setHighestBid(highestBid);
        setFormData(
          {
            ...formData,
            accept_id: acceptBid.id.toString()
          }
        )
      }
    } catch (error) {
      console.error('입찰 기록 조회 중 오류:', error);
    }
  };

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
            <Text style={styles.stepTitle}>Step 1: 최고 입찰가 확인 및 판매자 정보 입력</Text>
            <View style={styles.bidInfoContainer}>
              <Text style={styles.bidLabel}>현재 최고 입찰가</Text>
              <Text style={styles.bidAmount}>
                {Math.floor(highestBid / 1.18).toLocaleString()}원
              </Text>
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

            <View style={styles.bankContainer}>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.input, styles.bankCodeInput]} 
                  onPress={() => setShowBankModal(true)}
                >
                  <Text style={formData.bankCode ? styles.inputText : styles.placeholderText}>
                    {formData.bankCode ? 
                      banks.find(bank => bank.id === formData.bankCode)?.name : 
                      '입금은행 선택'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.bankHolderField}>
                  <TextInput
                    style={[styles.input, styles.bankAccountInput]}
                    placeholder="예금주 *"
                    value={formData.bankHolder}
                    onChangeText={(value) => handleInputChange('bankHolder', value)}
                  />  
                  {errors.bankHolder && <Text style={styles.errorText}>{errors.bankHolder}</Text>}
                </View>                
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="입금계좌번호 *"
                  value={formData.bankAccount}
                  keyboardType="numeric"
                  onChangeText={(value) => handleInputChange('bankAccount', value)}
                />
                {errors.bankAccount && <Text style={styles.errorText}>{errors.bankAccount}</Text>}
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 2: 입금대기 상태</Text>
            <Text>입금 대기 중입니다...</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 3: 의료기 양도 일자 협의</Text>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>방문일자 및 시간</Text>
              <Text style={styles.infoText}>구매자 입금 완료 확인 후 양도 일자를 협의합니다.</Text>            
              <View style={styles.inputGroup}>
                <Text style={styles.infoText}>방문일자: {auctionItem?.visit_date || ''}</Text>
                <Text style={styles.infoText}>방문시간: {auctionItem?.visit_time}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>양도 확정 알림 안내</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.infoText}>방문시간 이후 24시간 이내에 양도완료 처리됩니다.</Text>
                <Text style={styles.infoText}>판대대금 입금은 영업일로 24시간 이후 최대 3일 이내에 완료됩니다.</Text>
              </View>              
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 4: 양도 완료</Text>
            <Text>판매자와 구매자의 양도 완료 의사를 확인합니다</Text>
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
      {step !== 2 && step !== 3 && (
      <NavigationButtons
        currentStep={step}
        totalSteps={4}
        prevText="이전"
        nextText="다음"
        submitText="완료"
        canReverse={false}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleComplete}
      />)}
      <SelectionModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelect={(item) => {
          handleInputChange('bankCode', item.id);
          setShowBankModal(false);
        }}
        items={banks}
        title="은행 선택"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {    
    marginBottom: 10,
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
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
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
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  bidInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bidLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  fieldHalf: {
    flex: 1,
  },
});

export default AuctionSelectBidScreen;

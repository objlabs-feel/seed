import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

// 타입 정의 추가
type DeviceTypeData = {
  name: string
  code: string
  description: string
}

export async function POST() {
  const departments = [
    { id: 1, code: 'HS', name: '검진센터', description: 'Health Screening' },
    { id: 2, code: 'IM', name: '내과', description: 'Internal Medicine' },
    { id: 3, code: 'GS', name: '외과', description: 'General Surgery' },
    { id: 4, code: 'OS', name: '정형외과', description: 'Orthopedic Surgery' },
    { id: 5, code: 'RM', name: '재활의학과', description: 'Rehabilitation Medicine' },
    { id: 6, code: 'NS', name: '신경외과', description: 'Neurosurgery' },
    { id: 7, code: 'ET', name: '이비인후과', description: 'Ear, Nose, and Throat' },
    { id: 8, code: 'PS', name: '성형외과', description: 'Plastic Surgery' },
    { id: 9, code: 'DM', name: '피부과', description: 'Dermatology' },
    { id: 10, code: 'PD', name: '소아청소년과', description: 'Pediatrics' },
    { id: 11, code: 'RD', name: '방사선과', description: 'Radiology' },
    { id: 12, code: 'UR', name: '비뇨기과', description: 'Urology' },
    { id: 13, code: 'OB', name: '산부인과', description: 'Obstetrics and Gynecology' },
    { id: 14, code: 'BS', name: '유방외과', description: 'Breast Surgery' },
    { id: 15, code: 'FM', name: '가정의학과', description: 'Family Medicine' },
    { id: 16, code: 'OP', name: '안과', description: 'Ophthalmology' },
    { id: 17, code: 'OM', name: '한방병원', description: 'Oriental Medicine' },
    { id: 18, code: 'DT', name: '치과', description: 'Dentistry' },
    { id: 19, code: 'VH', name: '수의과', description: 'Veterinary Hospital' },
    { id: 20, code: 'OT', name: '기타', description: 'Others' }
  ];

  const deviceTypesByDepartment: Record<string, DeviceTypeData[]> = {
    '검진센터': [
      { name: 'X_ray 장비', code: 'XR', description: 'X_ray' },
      { name: '컴퓨터 단층촬영기', code: 'CT', description: 'Computed Tomography' },
      { name: '자기공명영상기', code: 'MR', description: 'Magnetic Resonance Imaging' },
      { name: '유방 촬영기', code: 'MM', description: 'Mammography' },
      { name: '골밀도 측정기', code: 'DX', description: 'Dual' },
      { name: '초음파 검사기', code: 'US', description: 'Ultrasound' },
      { name: '소화기 내시경 시스템', code: 'ES', description: 'Endoscopy System' },
      { name: '심전도 검사기', code: 'EC', description: 'Electrocardiogram' },
      { name: '자동 혈압계', code: 'AB', description: 'Automatic Blood Pressure Monitor' },
      { name: '폐기능 검사기', code: 'PF', description: 'Pulmonary Function Test' },
      { name: '혈액 분석기', code: 'CB', description: 'Complete Blood Count Analyzer' },
      { name: '소변 분석기', code: 'UA', description: 'Urinalysis Analyzer' },
      { name: '청력 검사기', code: 'AU', description: 'Audiometer' },
      { name: '시력 검사기', code: 'VT', description: 'Vision Tester' },
      { name: '체지방 분석기', code: 'BI', description: 'Bioelectrical Impedance Analysis' },
      { name: '심리 검사 도구', code: 'PT', description: 'Psychological Test Tools' },
      { name: '심장 스트레스 검사기', code: 'ET', description: 'Exercise Treadmill Test' },
      { name: '홀터 모니터', code: 'HM', description: 'Holter Monitor' },
      { name: '동맥경화 검사기', code: 'AI', description: 'Ankle' },
      { name: '혈당 측정기', code: 'BG', description: 'Blood Glucose Monitor' },
      { name: '요독 측정기', code: 'UC', description: 'Uric Acid Analyzer' },
      { name: '산소포화도 측정기', code: 'SP', description: 'Pulse Oximeter' },
      { name: '피부경화도 측정기', code: 'SS', description: 'Skin Sclerosis Scanner' },
      { name: '체온 측정기', code: 'TM', description: 'Thermometer' },
      { name: '전자체중계', code: 'SC', description: 'Smart Scale' },
      { name: '디지털 신장계', code: 'SM', description: 'Stadiometer' },
      { name: '안압계', code: 'IO', description: 'Intraocular Pressure Monitor' },
      { name: '전자청력계', code: 'OA', description: 'Otoacoustic Emission Analyzer' }
    ],
    // "내과": [
    //   { name: "청진기", code: "ST", description: "Stethoscope" },
    //   { name: "자동 혈압계", code: "AB", description: "Automatic Blood Pressure Monitor" },
    //   { name: "체온계", code: "TM", description: "Thermometer" },
    //   { name: "산소포화도 측정기", code: "SP", description: "Pulse Oximeter" },
    //   { name: "심전도 검사기", code: "EC", description: "Electrocardiogram" },
    //   { name: "혈당 측정기", code: "BG", description: "Blood Glucose Monitor" },
    //   { name: "혈액가스 분석기", code: "BG", description: "Blood Gas Analyzer" },
    //   { name: "폐기능 검사기", code: "PF", description: "Pulmonary Function Test" },
    //   { name: "초음파 검사기", code: "US", description: "Ultrasound" },
    //   { name: "자동제세동기", code: "AD", description: "Automated External Defibrillator" },
    //   { name: "Holter 모니터", code: "HM", description: "Holter Monitor" },
    //   { name: "근전도 검사기", code: "EM", description: "Electromyography" },
    //   { name: "뇌파 검사기", code: "EE", description: "Electroencephalogram" },
    //   { name: "소변 분석기", code: "UA", description: "Urinalysis Analyzer" },
    //   { name: "혈액 분석기", code: "CB", description: "Complete Blood Count Analyzer" },
    //   { name: "소화기 내시경 시스템", code: "ES", description: "Endoscopy System" },
    //   { name: "전자청력계", code: "AU", description: "Audiometer" },
    //   { name: "시야 검사기", code: "VF", description: "Visual Field Analyzer" },
    //   { name: "자동안압계", code: "TP", description: "Tonometer" },
    //   { name: "간섬유화 검사기", code: "LF", description: "Liver Fibroscan" },
    //   { name: "산소 집중기", code: "OC", description: "Oxygen Concentrator" },
    //   { name: "요산 측정기", code: "UA", description: "Uric Acid Analyzer" },
    //   { name: "피하 주사기", code: "SS", description: "Subcutaneous Syringe" },
    //   { name: "심박동 모니터", code: "HR", description: "Heart Rate Monitor" },
    //   { name: "동맥경화도 검사기", code: "AP", description: "Arterial Pulse Analyzer" },
    //   { name: "흉부 X_ray 장비", code: "XR", description: "Chest X_ray" },
    //   { name: "전자체중계", code: "SC", description: "Smart Scale" },
    //   { name: "자동 심장 충격기", code: "AD", description: "Automatic Defibrillator" }
    // ],
    // "외과": [
    //   { name: "수술용 내시경", code: "ES", description: "Endoscopic Surgery" },
    //   { name: "전기 수술기", code: "ES", description: "Electrosurgical Unit" },
    //   { name: "수술용 레이저", code: "LR", description: "Laser Resectoscope" },
    //   { name: "수술용 핸드피스", code: "HP", description: "Handpiece" },
    //   { name: "수술용 기구 세트", code: "SS", description: "Surgical Set" },
    //   { name: "흡인기", code: "SU", description: "Suction Unit" },
    //   { name: "수술용 카메라", code: "SC", description: "Surgical Camera" },
    //   { name: "수술용 조명", code: "SL", description: "Surgical Light" },
    //   { name: "체내 모니터링 장비", code: "IM", description: "Intraoperative Monitoring" },
    //   { name: "수술용 드레싱 기계", code: "DM", description: "Dressing Machine" },
    //   { name: "수술용 전자검사기", code: "ET", description: "Electrocautery" },
    //   { name: "수술용 기구 세척기", code: "CW", description: "Cautery Washer" },
    //   { name: "혈액응고 검사기", code: "BC", description: "Blood Coagulation Analyzer" },
    //   { name: "체내 탐색기", code: "PD", description: "Probe Device" },
    //   { name: "체외 심장 압박 장비", code: "CP", description: "Cardiac Pump" },
    //   { name: "수술용 절개기", code: "SC", description: "Surgical Cutter" },
    //   { name: "복강경", code: "LC", description: "Laparoscope" },
    //   { name: "수술용 침대", code: "OT", description: "Operating Table" },
    //   { name: "수술용 흡인기", code: "SA", description: "Surgical Aspirator" },
    //   { name: "체내 모니터", code: "IM", description: "Intraoperative Monitor" },
    //   { name: "내시경 세척기", code: "ES", description: "Endoscope Washer" },
    //   { name: "수술용 기구 포장기", code: "SP", description: "Surgical Packager" },
    //   { name: "체온 조절기", code: "TC", description: "Temperature Controller" },
    //   { name: "수술용 진동기", code: "VS", description: "Vibration Shaker" },
    //   { name: "유리세척기", code: "SG", description: "Glass Washer" },
    //   { name: "수술용 집게", code: "TC", description: "Tissue Clamp" },
    //   { name: "수술용 스크럽 시스템", code: "SS", description: "Surgical Scrub System" },
    //   { name: "혈액 흡입기", code: "VA", description: "Vacuum Aspiration" },
    //   { name: "기구 소독기", code: "DS", description: "Device Sterilizer" },
    //   { name: "피부 절개 기계", code: "IS", description: "Incision System" },
    //   { name: "수술용 핀셋", code: "TW", description: "Tweezer" },
    //   { name: "수술용 가위", code: "SG", description: "Surgical Scissors" },
    //   { name: "정맥 주사 기구", code: "IV", description: "Intravenous Set" },
    //   { name: "봉합 기계", code: "ST", description: "Suturing Tool" },
    //   { name: "흡인 수술기", code: "SU", description: "Suction Device" },
    //   { name: "자동봉합기", code: "SA", description: "Surgical Autoclave" },
    //   { name: "체외 심장 압박 장비", code: "CP", description: "Cardiac Pressure Device" },
    //   { name: "수술용 집게", code: "CG", description: "Clamps and Graspers" },
    //   { name: "뼈 절단기", code: "BC", description: "Bone Cutter" },
    //   { name: "핫 압착기", code: "HC", description: "Hot Compression Device" },
    //   { name: "주사기", code: "SY", description: "Syringe" },
    //   { name: "수술용 마취기", code: "AM", description: "Anesthesia Machine" },
    //   { name: "혈압 측정기", code: "BP", description: "Blood Pressure Monitor" },
    //   { name: "내시경 수술용 세트", code: "ES", description: "Endoscopic Surgery Set" },
    //   { name: "기구 소독기", code: "DS", description: "Device Sterilizer" },
    //   { name: "체외 충격파 치료기", code: "ES", description: "Extracorporeal Shockwave Therapy" },
    //   { name: "수술용 가스 공급 장비", code: "GS", description: "Gas Supply System" },
    //   { name: "수술용 혈관 클립", code: "VC", description: "Vascular Clip" },
    //   { name: "내시경 소독기", code: "ED", description: "Endoscope Disinfector" },
    //   { name: "기구 조정 장비", code: "RI", description: "Rigidity Instrument" },
    //   { name: "체온 조절 기기", code: "TC", description: "Temperature Control" },
    //   { name: "심장 수술 기계", code: "CH", description: "Cardiac Surgery Machine" },
    //   { name: "체내 탐색기", code: "PD", description: "Probe Device" },
    //   { name: "수술용 장비 이동대", code: "TM", description: "Transport Mechanism" },
    //   { name: "혈액 모니터링 장비", code: "BM", description: "Blood Monitoring" },
    //   { name: "체내 조직 절단기", code: "CT", description: "Tissue Cutter" },
    //   { name: "전기 수술기", code: "ES", description: "Electrosurgical Device" },
    //   { name: "수술용 전자기기", code: "EM", description: "Electromagnetic Surgical Tool" },
    //   { name: "체내 응급 장비", code: "IE", description: "Intraoperative Emergency Equipment" },
    //   { name: "수술용 레이저 장비", code: "LR", description: "Laser Resectoscope" },
    //   { name: "복강경 수술 기계", code: "LC", description: "Laparoscopic Camera" },
    //   { name: "C-arm 장비", code: "CA", description: "C-arm System" }
    // ],
    // "정형외과": [
    //   { name: "정형외과용 외부 고정장치", code: "EF", description: "External Fixator" },
    //   { name: "수술용 핀셋", code: "TW", description: "Tweezer" },
    //   { name: "정형외과용 내시경", code: "OS", description: "Orthopedic Scope" },
    //   { name: "골절 고정기", code: "FF", description: "Fracture Fixator" },
    //   { name: "골수 주입기", code: "BM", description: "Bone Marrow Injector" },
    //   { name: "정형외과용 드릴", code: "OD", description: "Orthopedic Drill" },
    //   { name: "뼈 절단기", code: "BC", description: "Bone Cutter" },
    //   { name: "정형외과용 플레이트", code: "OP", description: "Orthopedic Plate" },
    //   { name: "수술용 전기톱", code: "ES", description: "Electric Saw" },
    //   { name: "정형외과용 스크류", code: "OS", description: "Orthopedic Screw" },
    //   { name: "체내 보형물", code: "IM", description: "Implant" },
    //   { name: "정형외과용 카메라", code: "OC", description: "Orthopedic Camera" },
    //   { name: "체외 리튬 충격기", code: "ES", description: "Extracorporeal Shockwave Therapy" },
    //   { name: "체중 분산 장비", code: "WB", description: "Weight Bearing Device" },
    //   { name: "정형외과용 지지대", code: "SB", description: "Support Brace" },
    //   { name: "관절 내시경", code: "AS", description: "Arthroscope" },
    //   { name: "뼈 밀도 측정기", code: "BD", description: "Bone Densitometer" },
    //   { name: "정형외과용 조인트 모니터", code: "JM", description: "Joint Monitor" },
    //   { name: "정형외과용 절단기", code: "OC", description: "Orthopedic Cutter" },
    //   { name: "정형외과용 수술 테이블", code: "OT", description: "Operating Table" },
    //   { name: "정형외과용 체중계", code: "WB", description: "Weight Scale" },
    //   { name: "정형외과용 보조기구", code: "AD", description: "Assistive Device" },
    //   { name: "정형외과용 무릎 관절 보조기", code: "KA", description: "Knee Brace" },
    //   { name: "정형외과용 팔꿈치 보조기", code: "EB", description: "Elbow Brace" },
    //   { name: "정형외과용 발목 보조기", code: "AB", description: "Ankle Brace" },
    //   { name: "정형외과용 고정 장비", code: "FF", description: "Fracture Fixation" },
    //   { name: "정형외과용 마취 장비", code: "AM", description: "Anesthesia Machine" },
    //   { name: "정형외과용 X_ray 장비", code: "XR", description: "Orthopedic X_ray" },
    //   { name: "정형외과용 충격파 치료기", code: "SW", description: "Shockwave Therapy" },
    //   { name: "정형외과용 압박기", code: "CP", description: "Compression Device" },
    //   { name: "정형외과용 유연성 검사기", code: "FL", description: "Flexibility Tester" },
    //   { name: "정형외과용 체내 모니터", code: "IM", description: "Intraoperative Monitor" },
    //   { name: "정형외과용 이식물", code: "IM", description: "Implant" },
    //   { name: "정형외과용 수술용 핀", code: "SP", description: "Surgical Pin" },
    //   { name: "정형외과용 골절 교정기", code: "FC", description: "Fracture Correction Device" },
    //   { name: "정형외과용 소독기", code: "DS", description: "Device Sterilizer" },
    //   { name: "정형외과용 조인트 수술 장비", code: "JS", description: "Joint Surgery Tools" },
    //   { name: "정형외과용 물리치료 장비", code: "PT", description: "Physical Therapy Equipment" },
    //   { name: "정형외과용 수술용 시트", code: "OS", description: "Operating Sheet" },
    //   { name: "정형외과용 자외선 소독기", code: "UV", description: "Ultraviolet Sterilizer" },
    //   { name: "정형외과용 조직 샘플 채취기", code: "BS", description: "Biopsy Sample" },
    //   { name: "정형외과용 근육 전기 자극기", code: "ES", description: "Electrical Stimulator" },
    //   { name: "정형외과용 관절 엑스레이", code: "JO", description: "Joint X_ray" },
    //   { name: "정형외과용 신경 자극기", code: "NS", description: "Nerve Stimulator" },
    //   { name: "정형외과용 수술 가위", code: "SG", description: "Surgical Scissors" },
    //   { name: "정형외과용 체중 분산 장치", code: "WD", description: "Weight Distribution Device" },
    //   { name: "정형외과용 체내 압력 측정기", code: "IP", description: "Intraoperative Pressure Meter" },
    //   { name: "정형외과용 섬유화 검사기", code: "FF", description: "Fibrosis Finder" },
    //   { name: "정형외과용 체내 골절 탐지기", code: "FD", description: "Fracture Detector" },
    //   { name: "정형외과용 압박 치료기", code: "CP", description: "Compression Therapy Device" },
    //   { name: "정형외과용 비디오 내시경", code: "VE", description: "Video Endoscope" },
    //   { name: "정형외과용 마취 모니터", code: "AM", description: "Anesthesia Monitor" },
    //   { name: "정형외과용 포지셔너", code: "PS", description: "Positioner" },
    //   { name: "정형외과용 무릎 수술 기구", code: "KN", description: "Knee Instrument" },
    //   { name: "정형외과용 전동 드릴", code: "ED", description: "Electric Drill" },
    //   { name: "정형외과용 체온 모니터", code: "TM", description: "Temperature Monitor" },
    //   { name: "정형외과용 혈액 검사 장비", code: "BC", description: "Blood Checker" },
    //   { name: "정형외과용 이상 심장 소리 청취기", code: "HS", description: "Heart Sound" },
    //   { name: "정형외과용 체내 pH 측정기", code: "PH", description: "pH Meter" },
    //   { name: "정형외과용 체성분 측정기", code: "BC", description: "Body Composition" },
    //   { name: "정형외과용 체온 기록기", code: "TR", description: "Temperature Recorder" },
    //   { name: "정형외과용 심박수 모니터", code: "HR", description: "Heart Rate" },
    //   { name: "정형외과용 기능성 전자 혈압계", code: "EB", description: "Electronic BP" }
    // ],
    // "안과": [
    //   { name: "안압계", code: "IO", description: "Intraocular Pressure" },
    //   { name: "굴절계", code: "RE", description: "Refractometer" },
    //   { name: "안저 검사기", code: "FO", description: "Fundus Ophthalmoscope" },
    //   { name: "시력 검사기", code: "VA", description: "Visual Acuity" },
    //   { name: "슬릿 램프", code: "SL", description: "Slit Lamp" },
    //   { name: "각막 측정기", code: "KM", description: "Keratometer" },
    //   { name: "안구 초음파 기기", code: "US", description: "Ultrasound" },
    //   { name: "안구 촬영기", code: "CF", description: "Confocal" },
    //   { name: "색각 검사기", code: "CC", description: "Color Checker" },
    //   { name: "시야 검사기", code: "VF", description: "Visual Field" },
    //   { name: "안과용 비디오 내시경", code: "VE", description: "Video Endoscope" },
    //   { name: "체내 망막 촬영기", code: "RC", description: "Retinal Camera" },
    //   { name: "안구 진단 기기", code: "OD", description: "Ocular Diagnostic" },
    //   { name: "각막 지형도 검사기", code: "CT", description: "Corneal Topographer" },
    //   { name: "안구 운동 검사기", code: "EM", description: "Eye Movement" },
    //   { name: "안과용 조명 장비", code: "IL", description: "Instrument Light" },
    //   { name: "시력 교정 기기", code: "OC", description: "Optical Correction" },
    //   { name: "안구 수술 보조 장비", code: "SA", description: "Surgical Aid" },
    //   { name: "안과용 청력 검사기", code: "HE", description: "Hearing Evaluator" },
    //   { name: "드래프트 시력 검사기", code: "DS", description: "Draft Sight" },
    //   { name: "안과용 레이저", code: "OL", description: "Ocular Laser" },
    //   { name: "다초점 렌즈 검사기", code: "ML", description: "Multifocal Lens" },
    //   { name: "안구 혈류 측정기", code: "BF", description: "Blood Flow" },
    //   { name: "각막 두께 측정기", code: "CT", description: "Corneal Thickness" },
    //   { name: "빛 반사 검사기", code: "LR", description: "Light Reflector" },
    //   { name: "안구 초음파 생검 기기", code: "UB", description: "Ultrasound Biopsy" },
    //   { name: "시력 교정 렌즈 장비", code: "CL", description: "Contact Lens" },
    //   { name: "안과용 스캐너", code: "ES", description: "Eye Scanner" },
    //   { name: "안구 색소 측정기", code: "PM", description: "Pigment Meter" },
    //   { name: "망막 검사기", code: "RE", description: "Retinal Exam" },
    //   { name: "가시광선 스펙트럼 측정기", code: "VS", description: "Visible Spectrum" },
    //   { name: "안과용 광학 장비", code: "OE", description: "Optical Equipment" },
    //   { name: "안구 안정성 검사기", code: "IS", description: "Intraocular Stability" },
    //   { name: "야간 시력 검사기", code: "NV", description: "Night Vision" },
    //   { name: "안구 보조 장비", code: "AE", description: "Auxiliary Equipment" },
    //   { name: "안과용 파라미터 측정기", code: "PM", description: "Parameter Meter" },
    //   { name: "빛 굴절 검사기", code: "BF", description: "Beam Refraction" },
    //   { name: "안구 혈관 촬영기", code: "FV", description: "Fundus Vessel" },
    //   { name: "시야 측정 장비", code: "VF", description: "Visual Field" },
    //   { name: "안구 촉감 검사기", code: "TS", description: "Touch Sensation" }
    // ],
    // "한방병원": [
    //   { name: "침 치료기", code: "AC", description: "Acupuncture" },
    //   { name: "뜸 치료기", code: "MO", description: "Moxibustion" },
    //   { name: "한방 초음파 기기", code: "US", description: "Ultrasound" },
    //   { name: "한방 진단기", code: "TD", description: "Traditional Diagnostic" },
    //   { name: "한방 전기 자극기", code: "ES", description: "Electro Stimulator" },
    //   { name: "한방 차가운 압축기", code: "CC", description: "Cold Compression" },
    //   { name: "한방 온열 치료기", code: "HT", description: "Heat Therapy" },
    //   { name: "한방 전통 진단기", code: "TO", description: "Traditional Observation" },
    //   { name: "한방 한약 제제기", code: "HP", description: "Herbal Preparation" },
    //   { name: "기능성 침 기계", code: "AC", description: "Acupuncture Machine" },
    //   { name: "한방 의학용 스캐너", code: "TS", description: "Traditional Scanner" },
    //   { name: "한방 경혈 측정기", code: "PM", description: "Point Meter" },
    //   { name: "한방 장기 진단기", code: "OD", description: "Organ Diagnostic" },
    //   { name: "한방 차가운 압축기", code: "CC", description: "Cold Compress" },
    //   { name: "한방 체온 조절기", code: "TT", description: "Temperature Regulator" },
    //   { name: "한방 맥진 기기", code: "PW", description: "Pulse Wave" },
    //   { name: "한방 이침 치료기", code: "EA", description: "Ear Acupuncture" },
    //   { name: "한방 약침 기기", code: "HP", description: "Herbal Injection" },
    //   { name: "한방 체질 검사기", code: "BT", description: "Body Type" },
    //   { name: "한방 기공 장비", code: "QE", description: "Qigong Equipment" },
    //   { name: "한방 마사지 기기", code: "MT", description: "Massage Therapy" },
    //   { name: "한방 요법 기기", code: "HT", description: "Herbal Therapy" },
    //   { name: "한방 약제 조제기", code: "HP", description: "Herbal Processor" },
    //   { name: "한방 침 치료 시뮬레이터", code: "AS", description: "Acupuncture Simulator" },
    //   { name: "한방 기혈 검사기", code: "QC", description: "Qi and Blood Checker" },
    //   { name: "한방 체내 에너지 분석기", code: "EA", description: "Energy Analyzer" },
    //   { name: "한방 진단용 체온계", code: "DT", description: "Diagnostic Thermometer" },
    //   { name: "한방 진단용 비타민 D 측정기", code: "VD", description: "Vitamin D Checker" },
    //   { name: "한방 경락 측정기", code: "MC", description: "Meridian Checker" },
    //   { name: "한방 약용 식물 추출기", code: "HE", description: "Herbal Extractor" },
    //   { name: "한방 침 전극 기기", code: "AE", description: "Acupuncture Electrode" },
    //   { name: "한방 체형 분석기", code: "BA", description: "Body Analyzer" },
    //   { name: "한방 혈액 순환 개선기", code: "BC", description: "Blood Circulation" },
    //   { name: "한방 정신 건강 모니터", code: "PM", description: "Psychological Monitor" },
    //   { name: "한방 전자 치료기", code: "ET", description: "Electronic Therapy" },
    //   { name: "한방 자가 진단 키트", code: "DI", description: "Diagnostic Kit" },
    //   { name: "한방 피부 분석기", code: "SA", description: "Skin Analyzer" },
    //   { name: "한방 양생 기기", code: "LC", description: "Longevity Care" },
    //   { name: "한방 음성 치료기", code: "SV", description: "Sound Therapy" },
    //   { name: "한방 스트레스 완화 기기", code: "ST", description: "Stress Relief" }
    // ],
    // "치과": [
    //   { name: "치과 엑스레이 기기", code: "XR", description: "X_ray" },
    //   { name: "치과 진단기", code: "DI", description: "Diagnostic Imaging" },
    //   { name: "치과 치료용 레이저", code: "DL", description: "Dental Laser" },
    //   { name: "치과 핸드피스", code: "HP", description: "Handpiece" },
    //   { name: "치과 스캐너", code: "DS", description: "Dental Scanner" },
    //   { name: "치과용 초음파 기기", code: "US", description: "Ultrasound" },
    //   { name: "치과용 소독기", code: "SD", description: "Sterilizer" },
    //   { name: "치과 치료용 장비", code: "DE", description: "Dental Equipment" },
    //   { name: "치과 시멘트 믹서", code: "CM", description: "Cement Mixer" },
    //   { name: "치과용 진공 시스템", code: "VS", description: "Vacuum System" },
    //   { name: "치과용 치아 모델", code: "DM", description: "Dental Model" },
    //   { name: "치과용 재료 측정기", code: "MM", description: "Material Meter" },
    //   { name: "치과용 스테인리스 기구", code: "SI", description: "Stainless Instruments" },
    //   { name: "치과 전동 구강 청소기", code: "EC", description: "Electric Cleaner" },
    //   { name: "치과용 인상 재료", code: "IM", description: "Impression Material" },
    //   { name: "치과용 디지털 카메라", code: "DC", description: "Digital Camera" },
    //   { name: "치과 환자 모니터", code: "PM", description: "Patient Monitor" },
    //   { name: "치과용 광학 장비", code: "OE", description: "Optical Equipment" },
    //   { name: "치과용 레이저 커터", code: "LC", description: "Laser Cutter" },
    //   { name: "치과 전기 자극기", code: "ES", description: "Electrical Stimulator" },
    //   { name: "치과 보철 장비", code: "PE", description: "Prosthetic Equipment" },
    //   { name: "치과용 고속 핸드피스", code: "HF", description: "High" },
    //   { name: "치과용 저속 핸드피스", code: "LF", description: "Low" },
    //   { name: "치과용 조명 장비", code: "IL", description: "Instrument Light" },
    //   { name: "치과용 교정기", code: "DB", description: "Dental Braces" },
    //   { name: "치과용 교정 장비", code: "DO", description: "Dental Orthodontics" },
    //   { name: "치과용 세척기", code: "CW", description: "Cleansing Washer" },
    //   { name: "치과용 스텁", code: "DS", description: "Dental Stub" },
    //   { name: "치과용 압축 공기 시스템", code: "AC", description: "Air Compressor" },
    //   { name: "치과용 인레이 기기", code: "IN", description: "Inlay Device" },
    //   { name: "치과용 레이저 치아 세정기", code: "LC", description: "Laser Cleaner" },
    //   { name: "치과용 보철물 제작기", code: "PM", description: "Prosthetic Maker" },
    //   { name: "치과용 나사 장비", code: "DS", description: "Dental Screws" },
    //   { name: "치과용 방사선 필름 처리기", code: "FP", description: "Film Processor" },
    //   { name: "치과용 감염 예방 장비", code: "IA", description: "Infection Avoidance" },
    //   { name: "치과용 수술 계획 소프트웨어", code: "SP", description: "Surgical Planning" },
    //   { name: "치과용 치아 착색 검사기", code: "TC", description: "Tooth Color" },
    //   { name: "치과용 약물 주입기", code: "DI", description: "Drug Injector" },
    //   { name: "치과용 상처 치료기", code: "WT", description: "Wound Therapy" },
    //   { name: "치과용 치아 미세 분석기", code: "TA", description: "Tooth Analyzer" },
    //   { name: "치과용 맞춤형 보철물 기기", code: "CP", description: "Custom Prosthetic" }
    // ],
    // "수의과": [
    //   { name: "동물용 X선 기기", code: "XR", description: "X_ray" },
    //   { name: "동물용 초음파 기기", code: "US", description: "Ultrasound" },
    //   { name: "동물용 혈액 검사기", code: "BC", description: "Blood Checker" },
    //   { name: "동물용 체온계", code: "TT", description: "Thermometer" },
    //   { name: "동물용 심전도 기기", code: "EC", description: "Electrocardiogram" },
    //   { name: "동물용 내시경", code: "EN", description: "Endoscope" },
    //   { name: "동물용 체중계", code: "BW", description: "Body Weight" },
    //   { name: "동물용 마취 기기", code: "AN", description: "Anesthesia" },
    //   { name: "동물용 주사기", code: "SY", description: "Syringe" },
    //   { name: "동물용 치료 레이저", code: "DL", description: "Laser Therapy" },
    //   { name: "동물용 흡입기", code: "SU", description: "Suction" },
    //   { name: "동물용 전기 자극기", code: "ES", description: "Electro Stimulator" },
    //   { name: "동물용 혈압계", code: "BP", description: "Blood Pressure" },
    //   { name: "동물용 수액 주입기", code: "IV", description: "Intravenous Infusion" },
    //   { name: "동물용 스케일링 기기", code: "SC", description: "Scaling" },
    //   { name: "동물용 치과 기기", code: "DC", description: "Dental Care" },
    //   { name: "동물용 조직 검사기", code: "TB", description: "Tissue Biopsy" },
    //   { name: "동물용 재활 기기", code: "RP", description: "Rehabilitation" },
    //   { name: "동물용 응급 장비", code: "EM", description: "Emergency" },
    //   { name: "동물용 청진기", code: "ST", description: "Stethoscope" },
    //   { name: "동물용 호흡기", code: "RV", description: "Respirator" },
    //   { name: "동물용 생화학 분석기", code: "BC", description: "Biochemical Analyzer" },
    //   { name: "동물용 미세 수술 기기", code: "MS", description: "Microsurgery" },
    //   { name: "동물용 체내 탐색기", code: "IA", description: "Internal Scanner" },
    //   { name: "동물용 전기 소독기", code: "ES", description: "Electro Sterilizer" },
    //   { name: "동물용 온열 치료기", code: "HT", description: "Heat Therapy" },
    //   { name: "동물용 방사선 필름 처리기", code: "FP", description: "Film Processor" },
    //   { name: "동물용 혈액 가스 분석기", code: "BG", description: "Blood Gas Analyzer" },
    //   { name: "동물용 이온 교환 기기", code: "IE", description: "Ion Exchange" },
    //   { name: "동물용 심장 모니터", code: "HM", description: "Heart Monitor" },
    //   { name: "동물용 치료용 조명", code: "IL", description: "Instrument Light" },
    //   { name: "동물용 초음파 스캐너", code: "US", description: "Ultrasound Scanner" },
    //   { name: "동물용 수술용 카메라", code: "SC", description: "Surgical Camera" },
    //   { name: "동물용 체온 조절기", code: "TR", description: "Temperature Regulator" },
    //   { name: "동물용 폐쇄형 수술 기구", code: "CS", description: "Closed Surgery" },
    //   { name: "동물용 생리학적 모니터", code: "PM", description: "Physiological Monitor" },
    //   { name: "동물용 전자처치기", code: "ET", description: "Electronic Treatment" },
    //   { name: "동물용 수술용 스테인리스 기구", code: "SI", description: "Surgical Instruments" },
    //   { name: "동물용 혈압 모니터", code: "BP", description: "Blood Pressure Monitor" },
    //   { name: "동물용 호흡 모니터", code: "RM", description: "Respiratory Monitor" }
    // ],
    // "기타": [
    //   { name: "연구용 실험 장비", code: "RE", description: "Research Equipment" },
    //   { name: "교육용 의료 장비", code: "ME", description: "Medical Education Equipment" },
    //   { name: "체외 진단 장비", code: "IV", description: "In Vitro Diagnostic Equipment" },
    //   { name: "의료 영상 장비", code: "IM", description: "Imaging Equipment" },
    //   { name: "특수 검사 장비", code: "SD", description: "Special Diagnostic Equipment" },
    //   { name: "의료 기기 유지보수 장비", code: "MT", description: "Maintenance Tools" }
    // ]
  };

  try {
    for (const department of departments) {
      const deviceTypes = deviceTypesByDepartment[department.name];
      if (deviceTypes) {
        for (const deviceType of deviceTypes) {
          await prisma.deviceType.create({
            data: {
              name: deviceType.name.trim(),
              code: deviceType.code.trim(),
              description: deviceType.description.trim(),
              department_id: department.id,
            },
          });
        }
      }
    }
    return NextResponse.json({
      message: '장비 종류가 성공적으로 등록되었습니다.',
    });
  } catch (error) {
    console.error('장비 등록 중 오류:', error);
    return NextResponse.json(
      {
        error: '장비 등록 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
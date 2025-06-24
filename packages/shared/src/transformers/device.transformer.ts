import type {
  Device,
  DeviceType,
  Department,
  Manufacturer,
  UsedDevice,
  DepartmentToDeviceType
} from '../types/models';
import type {
  DeviceResponseDto,
  DeviceListDto,
  DeviceTypeResponseDto,
  DeviceTypeListDto,
  DepartmentResponseDto,
  DepartmentListDto,
  ManufacturerResponseDto,
  ManufacturerListDto,
  UsedDeviceResponseDto,
  UsedDeviceListDto,
  DepartmentToDeviceTypeResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists } from './common.transformer';

/**
 * DeviceType 모델을 DeviceTypeResponseDto로 변환
 */
export function toDeviceTypeResponseDto(deviceType: DeviceType): DeviceTypeResponseDto {
  return {
    id: deviceType.id.toString(),
    created_at: null, // DeviceType 모델에는 created_at 필드가 없음
    updated_at: null, // DeviceType 모델에는 updated_at 필드가 없음
    status: deviceType.status,
    code: deviceType.code,
    name: deviceType.name,
    description: deviceType.description,
    img: deviceType.img,
    sort_key: deviceType.sort_key,
  };
}

/**
 * DeviceType 모델을 DeviceTypeListDto로 변환
 */
export function toDeviceTypeListDto(deviceType: DeviceType): DeviceTypeListDto {
  return {
    id: deviceType.id.toString(),
    code: deviceType.code,
    name: deviceType.name,
    description: deviceType.description,
    img: deviceType.img,
    sort_key: deviceType.sort_key,
    status: deviceType.status ?? 1,
  };
}

/**
 * Department 모델을 DepartmentResponseDto로 변환
 */
export function toDepartmentResponseDto(department: Department): DepartmentResponseDto {
  return {
    id: department.id.toString(),
    created_at: null, // Department 모델에는 created_at 필드가 없음
    updated_at: null, // Department 모델에는 updated_at 필드가 없음
    status: department.status,
    code: department.code,
    name: department.name,
    img: department.img,
    description: department.description,
    sort_key: department.sort_key,
  };
}

/**
 * Department 모델을 DepartmentListDto로 변환
 */
export function toDepartmentListDto(department: Department): DepartmentListDto {
  const deviceTypes = department.deviceTypes
    ?.map(dt => dt.deviceType)
    .filter((dt): dt is DeviceType => dt !== undefined)
    .map(dt => toDeviceTypeResponseDto(dt)) || [];

  return {
    id: department.id.toString(),
    code: department.code,
    name: department.name,
    img: department.img,
    description: department.description,
    sort_key: department.sort_key,
    status: department.status ?? 1,
    deviceTypes,
  };
}

/**
 * Manufacturer 모델을 ManufacturerResponseDto로 변환
 */
export function toManufacturerResponseDto(manufacturer: Manufacturer): ManufacturerResponseDto {
  return {
    id: manufacturer.id.toString(),
    created_at: null, // Manufacturer 모델에는 created_at 필드가 없음
    updated_at: null, // Manufacturer 모델에는 updated_at 필드가 없음
    status: manufacturer.status,
    name: manufacturer.name,
    device_types: manufacturer.device_types,
    img: manufacturer.img,
    description: manufacturer.description,
  };
}

/**
 * Manufacturer 모델을 ManufacturerListDto로 변환
 */
export function toManufacturerListDto(manufacturer: Manufacturer): ManufacturerListDto {
  return {
    id: manufacturer.id.toString(),
    name: manufacturer.name,
    device_types: manufacturer.device_types,
    img: manufacturer.img,
    description: manufacturer.description,
    status: manufacturer.status ?? 1,
  };
}

/**
 * Device 모델을 DeviceResponseDto로 변환
 */
export function toDeviceResponseDto(device: Device): DeviceResponseDto {
  return {
    id: bigintToString(device.id)!,
    created_at: dateToString(device.created_at),
    updated_at: dateToString(device.updated_at),
    status: device.status,
    manufacturer_id: device.manufacturer_id?.toString() || null,
    device_type: device.device_type,
    media: device.media,
    info: device.info,
    version: device.version,
    description: device.description,
    manufacturer: transformIfExists(device.manufacturer, toManufacturerResponseDto),
    deviceType: transformIfExists(device.deviceType, toDeviceTypeResponseDto),
  };
}

/**
 * Device 모델을 DeviceListDto로 변환
 */
export function toDeviceListDto(device: Device): DeviceListDto {
  return {
    id: bigintToString(device.id)!,
    manufacturer_id: device.manufacturer_id?.toString() || null,
    device_type: device.device_type,
    version: device.version,
    description: device.description,
    status: device.status ?? 1,
    created_at: dateToString(device.created_at),
    updated_at: dateToString(device.updated_at),
  };
}

/**
 * UsedDevice 모델을 UsedDeviceResponseDto로 변환
 */
export function toUsedDeviceResponseDto(usedDevice: UsedDevice): UsedDeviceResponseDto {
  return {
    id: bigintToString(usedDevice.id)!,
    created_at: dateToString(usedDevice.created_at),
    updated_at: dateToString(usedDevice.updated_at),
    status: usedDevice.status,
    company_id: bigintToString(usedDevice.company_id),
    department_id: usedDevice.department_id,
    device_type_id: usedDevice.device_type_id,
    manufacturer_id: usedDevice.manufacturer_id,
    manufacture_date: dateToString(usedDevice.manufacture_date),
    images: usedDevice.images,
    description: usedDevice.description,
    company: usedDevice.company ? {
      id: bigintToString(usedDevice.company.id)!,
      name: usedDevice.company.name,
    } : undefined,
    department: transformIfExists(usedDevice.department, toDepartmentResponseDto),
    deviceType: transformIfExists(usedDevice.deviceType, toDeviceTypeResponseDto),
    manufacturer: transformIfExists(usedDevice.manufacturer, toManufacturerResponseDto),
  };
}

/**
 * UsedDevice 모델을 UsedDeviceListDto로 변환
 */
export function toUsedDeviceListDto(usedDevice: UsedDevice): UsedDeviceListDto {
  return {
    id: bigintToString(usedDevice.id)!,
    company_id: bigintToString(usedDevice.company_id),
    department_id: usedDevice.department_id,
    device_type_id: usedDevice.device_type_id,
    manufacturer_id: usedDevice.manufacturer_id,
    manufacture_date: dateToString(usedDevice.manufacture_date),
    description: usedDevice.description,
    status: usedDevice.status ?? 1,
    created_at: dateToString(usedDevice.created_at),
    updated_at: dateToString(usedDevice.updated_at),
  };
}

/**
 * DepartmentToDeviceType 모델을 DepartmentToDeviceTypeResponseDto로 변환
 */
export function toDepartmentToDeviceTypeResponseDto(
  deptToDeviceType: DepartmentToDeviceType
): DepartmentToDeviceTypeResponseDto {
  return {
    department_id: deptToDeviceType.department_id,
    device_type_id: deptToDeviceType.device_type_id,
    sort_key: deptToDeviceType.sort_key,
    status: deptToDeviceType.status ?? 1,
    created_at: dateToString(deptToDeviceType.created_at) ?? '',
    updated_at: dateToString(deptToDeviceType.updated_at) ?? '',
    department: transformIfExists(deptToDeviceType.department, toDepartmentResponseDto),
    deviceType: transformIfExists(deptToDeviceType.deviceType, toDeviceTypeResponseDto),
  };
}

/**
 * 배열 변환 함수들
 */
export function toDeviceTypeListDtoArray(deviceTypes: DeviceType[]): DeviceTypeListDto[] {
  return deviceTypes.map(toDeviceTypeListDto);
}

export function toDepartmentListDtoArray(departments: Department[]): DepartmentListDto[] {
  return departments.map(toDepartmentListDto);
}

export function toManufacturerListDtoArray(manufacturers: Manufacturer[]): ManufacturerListDto[] {
  return manufacturers.map(toManufacturerListDto);
}

export function toDeviceListDtoArray(devices: Device[]): DeviceListDto[] {
  return devices.map(toDeviceListDto);
}

export function toUsedDeviceListDtoArray(usedDevices: UsedDevice[]): UsedDeviceListDto[] {
  return usedDevices.map(toUsedDeviceListDto);
} 
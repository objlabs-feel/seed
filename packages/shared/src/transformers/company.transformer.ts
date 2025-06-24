import type { Company } from '../types/models';
import type {
  CompanyResponseDto,
  CompanyListDto,
  CompanyDetailResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists } from './common.transformer';
import { toUserResponseDto } from './user.transformer';

/**
 * Company 모델을 CompanyResponseDto로 변환
 */
export function toCompanyResponseDto(company: Company): CompanyResponseDto {
  return {
    id: bigintToString(company.id)!,
    created_at: dateToString(company.created_at),
    updated_at: dateToString(company.updated_at),
    status: company.status,
    name: company.name,
    business_no: company.business_no,
    business_tel: company.business_tel,
    license_img: company.license_img,
    owner_id: bigintToString(company.owner_id),
    related_members: company.related_members,
    institute_members: company.institute_members,
    company_type: company.company_type,
    business_mobile: company.business_mobile,
    secret_info: company.secret_info,
    zipcode: company.zipcode,
    address: company.address,
    address_detail: company.address_detail,
    area: company.area,
  };
}

/**
 * Company 모델을 CompanyListDto로 변환 (민감한 정보 제외)
 */
export function toCompanyListDto(company: Company): CompanyListDto {
  return {
    id: bigintToString(company.id)!,
    name: company.name,
    business_no: company.business_no,
    business_tel: company.business_tel,
    owner_id: bigintToString(company.owner_id),
    company_type: company.company_type,
    business_mobile: company.business_mobile,
    zipcode: company.zipcode,
    address: company.address,
    address_detail: company.address_detail,
    area: company.area,
    status: company.status,
    created_at: dateToString(company.created_at),
    updated_at: dateToString(company.updated_at),
  };
}

/**
 * Company 모델을 CompanyDetailResponseDto로 변환 (소유자 정보 포함)
 */
export function toCompanyDetailResponseDto(company: Company): CompanyDetailResponseDto {
  const baseDto = toCompanyResponseDto(company);

  return {
    ...baseDto,
    owner: company.owner ? {
      id: bigintToString(company.owner.id)!,
      device_token: company.owner.device_token,
      profile: company.owner.profile ? {
        name: company.owner.profile.name,
        mobile: company.owner.profile.mobile,
        email: company.owner.profile.email,
      } : undefined,
    } : undefined,
  };
}

/**
 * Company 배열을 CompanyListDto 배열로 변환
 */
export function toCompanyListDtoArray(companies: Company[]): CompanyListDto[] {
  return companies.map(toCompanyListDto);
} 
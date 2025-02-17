import { IDepartment, IDeviceType, IManufacturer, ICompany } from "../user";

export interface IMedicalDevice {
  id: string | number;
  company_id: number;
  department_id: number;
  device_type_id: number;
  manufacturer_id: number | null;
  manufacture_date: string | null;
  manufacture_year: number | null;
  images: Array<{ url: string }>;
  description: string | null;
  created_at: string;
  updated_at: string;
  department: IDepartment;
  deviceType: IDeviceType;
  manufacturer: IManufacturer | null;
  company: ICompany;
};
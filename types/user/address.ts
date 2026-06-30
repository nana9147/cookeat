export interface UserShippingAddress {
  addressId: number;
  label: string;
  recipient: string;
  phone: string;
  zipCode: string;
  baseAddress: string;
  addressDetail: string | null;
  isDefault: boolean;
}

export type CreateShippingAddressInput = Omit<UserShippingAddress, 'addressId'>;
export type UpdateShippingAddressInput = Partial<CreateShippingAddressInput>;

export interface SelectedAddress {
  recipient: string;
  phone: string;
  address: string;
  addressDetail: string | null;
}

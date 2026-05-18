declare module '@testing/test-utils' {
  import { CryptoDetailResponse } from '../app/core/models/crypto.model';

  export function createMockCrypto(): any;
  export function createMockCryptoList(count: number): any[];
  export function createMockCryptoDetailResponse(
    overrides?: Partial<CryptoDetailResponse>,
  ): CryptoDetailResponse;
}

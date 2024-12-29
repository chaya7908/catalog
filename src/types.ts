// src/types.ts
export interface CatalogItem {
  sku: string;
  text: string;
  imgUrl: string;
  isSoldOut: boolean;
  reasonForMatch?: string;
  createdAt: string;
}

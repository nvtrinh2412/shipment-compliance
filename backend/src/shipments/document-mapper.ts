import { OCR_MAPPING_KEYS } from './model';

export class DocumentMapper {
  static mapToShipment(documentData: Record<string, any>): Record<string, any> {
    const mapped: Record<string, any> = {};

    const tryMatch = (keys: string[]): any => {
      for (const key of keys) {
        if (documentData[key] !== undefined && documentData[key] !== null) {
          return documentData[key];
        }
      }
      return undefined;
    };

    mapped.exporter = tryMatch(OCR_MAPPING_KEYS.EXPORTER);
    mapped.importer = tryMatch(OCR_MAPPING_KEYS.IMPORTER);
    mapped.commercialInvoiceNumber = tryMatch(OCR_MAPPING_KEYS.COMMERCIAL_INVOICE_NUMBER);
    mapped.invoiceValue = tryMatch(OCR_MAPPING_KEYS.INVOICE_VALUE);
    if (mapped.invoiceValue !== undefined) mapped.invoiceValue = parseFloat(mapped.invoiceValue);
    
    mapped.currencyCode = tryMatch(OCR_MAPPING_KEYS.CURRENCY_CODE);
    mapped.goodsDescription = tryMatch(OCR_MAPPING_KEYS.GOODS_DESCRIPTION);
    mapped.hsCode = tryMatch(OCR_MAPPING_KEYS.HS_CODE);
    mapped.countryCode = tryMatch(OCR_MAPPING_KEYS.COUNTRY_CODE);
    
    mapped.grossWeightKg = tryMatch(OCR_MAPPING_KEYS.GROSS_WEIGHT);
    if (mapped.grossWeightKg !== undefined) mapped.grossWeightKg = parseFloat(mapped.grossWeightKg);
    
    mapped.netWeightKg = tryMatch(OCR_MAPPING_KEYS.NET_WEIGHT);
    if (mapped.netWeightKg !== undefined) mapped.netWeightKg = parseFloat(mapped.netWeightKg);
    
    mapped.numberOfPackages = tryMatch(OCR_MAPPING_KEYS.NUMBER_OF_PACKAGES);
    if (mapped.numberOfPackages !== undefined) mapped.numberOfPackages = parseInt(mapped.numberOfPackages, 10);
    
    mapped.containerNumber = tryMatch(OCR_MAPPING_KEYS.CONTAINER_NUMBER);
    mapped.billOfLadingNumber = tryMatch(OCR_MAPPING_KEYS.BILL_OF_LADING_NUMBER);
    mapped.packagingType = tryMatch(OCR_MAPPING_KEYS.PACKAGING_TYPE);
    
    const ispm15 = tryMatch(OCR_MAPPING_KEYS.ISPM_15);
    if (ispm15 !== undefined) {
      if (typeof ispm15 === 'string') {
        mapped.ispm15Certified = ispm15.toLowerCase() === 'true' || ispm15.toLowerCase() === 'yes';
      } else {
        mapped.ispm15Certified = Boolean(ispm15);
      }
    } else {
      mapped.ispm15Certified = null;
    }

    const arrivalDate = tryMatch(OCR_MAPPING_KEYS.ARRIVAL_DATE);
    if (arrivalDate) {
      mapped.arrivalDate = new Date(arrivalDate);
    }

    // Clean up undefined properties
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined) {
        delete mapped[key];
      }
    });

    return mapped;
  }
}

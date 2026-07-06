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

    mapped.exporter = tryMatch(['exporter', 'exporterName', 'shipper']);
    mapped.importer = tryMatch(['importer', 'importerName', 'consignee']);
    mapped.commercialInvoiceNumber = tryMatch(['invoice_number', 'invoiceNumber', 'invoiceNo']);
    mapped.invoiceValue = tryMatch(['invoice_value', 'invoiceValue', 'totalValue', 'amount']);
    if (mapped.invoiceValue !== undefined) mapped.invoiceValue = parseFloat(mapped.invoiceValue);
    
    mapped.currencyCode = tryMatch(['currency', 'currencyCode']);
    mapped.goodsDescription = tryMatch(['goods_description', 'description', 'goodsDesc']);
    mapped.hsCode = tryMatch(['hs_code', 'hsCode', 'tariffCode', 'harmonizedCode']);
    mapped.countryCode = tryMatch(['country_of_origin', 'countryOfOrigin', 'origin', 'coo']);
    
    mapped.grossWeightKg = tryMatch(['gross_weight_kg', 'grossWeight', 'grossWt']);
    if (mapped.grossWeightKg !== undefined) mapped.grossWeightKg = parseFloat(mapped.grossWeightKg);
    
    mapped.netWeightKg = tryMatch(['net_weight_kg', 'netWeight', 'netWt']);
    if (mapped.netWeightKg !== undefined) mapped.netWeightKg = parseFloat(mapped.netWeightKg);
    
    mapped.numberOfPackages = tryMatch(['number_of_packages', 'packagesCount', 'pkgCount', 'qty']);
    if (mapped.numberOfPackages !== undefined) mapped.numberOfPackages = parseInt(mapped.numberOfPackages, 10);
    
    mapped.containerNumber = tryMatch(['container_number', 'containerNo', 'container']);
    mapped.billOfLadingNumber = tryMatch(['bill_of_lading_number', 'blNumber', 'bol']);
    mapped.packagingType = tryMatch(['packaging_type', 'packaging', 'packageType']);
    
    const ispm15 = tryMatch(['ispm15_certified', 'ispm15Certified', 'ispm15', 'woodTreatment']);
    if (ispm15 !== undefined) {
      if (typeof ispm15 === 'string') {
        mapped.ispm15Certified = ispm15.toLowerCase() === 'true' || ispm15.toLowerCase() === 'yes';
      } else {
        mapped.ispm15Certified = Boolean(ispm15);
      }
    } else {
      mapped.ispm15Certified = null;
    }

    const arrivalDate = tryMatch(['arrival_date', 'arrivalDate', 'eta']);
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

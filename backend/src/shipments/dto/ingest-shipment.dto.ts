import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// This loosely matches the unstructured input that an OCR service might send
export const IngestShipmentZodSchema = z.object({
  shipment_reference: z.string().min(1, 'Reference is required'),
  exporter_details: z.string().optional(),
  importer_details: z.string().optional(),
  invoice_no: z.string().optional(),
  invoice_amount: z.union([z.number(), z.string()]).optional(),
  currency: z.string().optional(),
  goods_desc: z.string().optional(),
  hs_code: z.string().optional(),
  weight_gross: z.union([z.number(), z.string()]).optional(),
  weight_net: z.union([z.number(), z.string()]).optional(),
  pkg_count: z.union([z.number(), z.string()]).optional(),
  pkg_type: z.string().optional(),
  ispm_15: z.boolean().optional(),
  container_id: z.string().optional(),
  bl_no: z.string().optional(),
  origin_country: z.string().optional(),
  destination_country: z.string().optional(),
  port_of_loading: z.string().optional(),
  port_of_discharge: z.string().optional(),
  arrival_date: z.string().optional(),
}).catchall(z.any()); // allow other random OCR fields to be ignored safely

export class IngestShipmentDto extends createZodDto(IngestShipmentZodSchema) {}

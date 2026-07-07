import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateShipmentZodSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
});

export class CreateShipmentDto extends createZodDto(CreateShipmentZodSchema) {}

import { z } from 'zod/v4';

const domainSchema = z.string();
const ipAddressSchema = z.ipv4();

const networkSchema = z.object({
  host: domainSchema.or(ipAddressSchema),
  port: z.number().min(1000).max(65535),
});

export { networkSchema };

export type Network = z.infer<typeof networkSchema>;

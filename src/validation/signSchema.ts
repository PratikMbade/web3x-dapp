import * as z from 'zod';

export const SigninSchema = z.object({
  publicAddress: z.string().min(42, 'It is not a valid Ethereum address'),
});

export const RegisterSchema = z.object({
  regId: z.number().optional(),
  wallet_address: z
    .string()
    .min(42, 'It is not a valid Ethereum address')
    .optional(),
  sponser_address: z
    .string()
    .min(42, 'It is not a valid Ethereum address')
    .optional(),
  registeredTime: z.number().optional(),
  sponser_regId: z.number().optional(),
});

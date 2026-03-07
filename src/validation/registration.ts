
import  z from 'zod';
import { utils } from 'ethers';


export const registrationSchema = z.object({
    wallet_address: z.string().refine(val => utils.isAddress(val), {
        message: "Invalid Ethereum address",
    }),
    sponsor_address: z.string().refine(val => utils.isAddress(val), {
        message: "Invalid Ethereum address",
    }),
});
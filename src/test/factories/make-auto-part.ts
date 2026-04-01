import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { makePrice } from './make-price';

export const makeAutoPart = (override?: Partial<AutoPart>): AutoPart => {
  return new AutoPart({
    name: 'Brake Pad',
    description: 'High-quality brake pad for improved stopping power.',
    price: makePrice(),
    stock: 100,
    ...override,
  });
};

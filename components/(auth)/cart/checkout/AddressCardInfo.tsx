import { User, Phone, Place } from './AddressIcons';

interface Props {
  recipient: string;
  phone: string;
  fullAddress: string;
}

const ROW = 'flex items-center gap-1.5';
const TEXT = 'text-xs text-gray-text';

export default function AddressCardInfo({ recipient, phone, fullAddress }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className={ROW}><User /><span className={TEXT}>{recipient}</span></div>
      <div className={ROW}><Phone /><span className={TEXT}>{phone}</span></div>
      <div className={ROW}><Place /><span className={TEXT}>{fullAddress}</span></div>
    </div>
  );
}

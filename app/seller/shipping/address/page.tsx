import AddressList from '../../components/Shipping/AddressList';

export default function AddressPage() {
  return (
    <div className="bg-background p-8 max-tablet:p-5 max-mobile:p-4">
      <div className="mb-8 max-mobile:mb-5">
        <h1 className="text-h2 font-bold text-dark-text max-mobile:text-h3">
          배송 관리
          <span className="text-light-gray font-normal mx-2">/</span>
          <span className="text-h4 font-medium">주소 관리</span>
        </h1>
      </div>
      <AddressList />
    </div>
  );
}

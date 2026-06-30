import Image from 'next/image';

export function Card() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M23.333 5.83331H4.66634C3.37768 5.83331 2.33301 6.87798 2.33301 8.16665V19.8333C2.33301 21.122 3.37768 22.1666 4.66634 22.1666H23.333C24.6217 22.1666 25.6663 21.122 25.6663 19.8333V8.16665C25.6663 6.87798 24.6217 5.83331 23.333 5.83331Z"
        stroke="#3B6E47" strokeWidth="1.98333" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M2.33301 11.6667H25.6663" stroke="#3B6E47" strokeWidth="1.98333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Kakaopay() {
  return (
    <Image src="/assets/payments/payment_icon_yellow_large.png" alt="카카오페이"
      width={0} height={0} sizes="100vw" className="h-7 w-auto" />
  );
}

export function Tosspay() {
  return (
    <Image src="/assets/payments/TossPay_Logo_Primary.png" alt="토스페이"
      width={0} height={0} sizes="100vw" className="h-7 w-auto" />
  );
}

export function MobilePayment() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="8.16699" y="2.33331" width="11.6667" height="23.3333" rx="2.33333"
        stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.833 20.4167H15.1663" stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function Bankbook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M5.83301 4.66669H19.833C20.4655 4.66669 21.0721 4.91752 21.5222 5.36761C21.9723 5.8177 22.2231 6.42419 22.2231 7.05669V22.1667H5.83301C5.20051 22.1667 4.59401 21.9159 4.14392 21.4658C3.69384 21.0157 3.44301 20.4092 3.44301 19.7767V7.05669C3.44301 6.42419 3.69384 5.8177 4.14392 5.36761C4.59401 4.91752 5.20051 4.66669 5.83301 4.66669Z"
        stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M22.2231 18.6667H5.83301C5.20051 18.6667 4.59401 18.9175 4.14392 19.3676C3.69384 19.8177 3.44301 20.4242 3.44301 21.0567"
        stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M8.16699 9.33331H15.167" stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8.16699 13H12.8337" stroke="#3B6E47" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

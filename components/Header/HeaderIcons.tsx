const S = { stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" {...S} />
      <path d="M21 21L16.65 16.65" {...S} />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" {...S} />
      <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" {...S} />
      <path d="M2.05005 2.05H4.05005L6.71005 14.47C6.80763 14.9249 7.06072 15.3315 7.42576 15.6199C7.7908 15.9082 8.24495 16.0604 8.71005 16.05H18.49C18.9452 16.0493 19.3865 15.8933 19.7411 15.6078C20.0956 15.3224 20.3422 14.9245 20.4401 14.48L22.09 7.05H5.12005" {...S} />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" {...S} />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" {...S} />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21" {...S} />
      <path d="M3 12H21" {...S} />
      <path d="M3 18H21" {...S} />
    </svg>
  );
}

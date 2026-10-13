/** Original two-tone illustrations using the site's navy and blue palette. */
export function ServiceOfferingIcon({ kind }: { kind: string }) {
  const navy="#082840",blue="#0874d1",light="#b9dcff";
  const art: Record<string, React.ReactNode> = {
    listing:<><rect x="17" y="12" width="34" height="45" rx="4" fill={light}/><rect x="22" y="17" width="24" height="35" rx="2" fill="white"/><rect x="27" y="8" width="14" height="10" rx="3" fill={blue}/><path d="m26 29 2 2 4-4m-6 13 2 2 4-4" stroke={blue}/><path d="M36 29h6m-6 11h6M26 47h16"/></>,
    analytics:<><path d="M12 56h45"/><rect x="17" y="40" width="9" height="16" fill={light}/><rect x="31" y="30" width="9" height="26" fill="#58aaff"/><rect x="45" y="18" width="9" height="38" fill={blue}/><path d="M15 30c17 0 25-11 36-20m-9 0h10v10" stroke={blue}/></>,
    advertising:<><rect x="9" y="14" width="50" height="35" rx="5" fill={navy}/><rect x="14" y="19" width="40" height="25" rx="2" fill="white"/><path d="M34 49v8m-10 0h20"/><path d="m24 28 20-6v17l-20-6z" fill={light}/><path d="M24 28v5m5 2 3 9h6l-4-10" fill={blue}/></>,
    health:<><rect x="10" y="15" width="48" height="36" rx="5" fill={light}/><path d="M10 25h48"/><circle cx="17" cy="20" r="1" fill={blue}/><circle cx="23" cy="20" r="1" fill={blue}/><path d="M34 44c-19-10-11-20 0-13 11-7 19 3 0 13z" fill={blue}/><path d="M23 37h7l3-5 4 9 3-4h6" stroke="white"/></>,
    logistics:<><path d="m9 24 25-13 25 13v33H9z" fill={light}/><path d="M9 24h50"/><rect x="19" y="31" width="30" height="26" fill="white"/><rect x="23" y="45" width="10" height="12" fill={blue}/><rect x="35" y="45" width="10" height="12" fill={blue}/><rect x="29" y="33" width="10" height="12" fill="#58aaff"/></>,
    store:<><rect x="13" y="28" width="42" height="29" rx="3" fill={light}/><path d="M14 12h40l7 17H7z" fill={blue}/><path d="m24 12-3 17m23-17 3 17" stroke="white"/><rect x="19" y="37" width="14" height="12" fill="white"/><rect x="39" y="37" width="10" height="20" fill={blue}/><path d="M7 29q7 10 14 0 7 10 13 0 6 10 13 0 7 10 14 0" fill={light}/></>,
    security:<><path d="m34 9 23 9v17c0 13-13 23-23 27C24 58 11 48 11 35V18z" fill={light}/><path d="m34 16 16 7v12c0 9-9 17-16 20" fill={blue} stroke="none"/><path d="m23 35 8 8 15-17" stroke="white" strokeWidth="4"/></>,
    markets:<><circle cx="34" cy="34" r="24" fill={light}/><ellipse cx="34" cy="34" rx="11" ry="24" fill="#58aaff"/><path d="M11 27h46M11 41h46M34 10v48"/><path d="m48 48 11-8v18z" fill={blue}/></>
  };
  return <svg width="60" height="60" viewBox="0 0 68 68" fill="none" stroke={navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{art[kind] || art.listing}</svg>;
}

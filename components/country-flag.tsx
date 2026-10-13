type Country = "usa" | "uk" | "australia" | "germany";
function UnionJack() {
  return <><rect width="40" height="26" fill="#012169"/><path d="M0 0 40 26M40 0 0 26" stroke="white" strokeWidth="6"/><path d="M0 0 40 26M40 0 0 26" stroke="#c8102e" strokeWidth="2"/><path d="M20 0v26M0 13h40" stroke="white" strokeWidth="9"/><path d="M20 0v26M0 13h40" stroke="#c8102e" strokeWidth="5"/></>;
}
export function CountryFlag({ country }: { country: Country }) {
  return <svg className="country-flag" viewBox="0 0 40 26" width="40" height="26" aria-hidden="true">
    {country === "germany" && <><rect width="40" height="9" fill="#171717"/><rect y="9" width="40" height="8" fill="#dd0000"/><rect y="17" width="40" height="9" fill="#ffce00"/></>}
    {country === "uk" && <UnionJack/>}
    {country === "usa" && <><rect width="40" height="26" fill="#b22234"/>{Array.from({length:6},(_,i)=><rect x="0" y={i*4+2} width="40" height="2" fill="white" key={i}/>)}<rect width="17" height="14" fill="#3c3b6e"/>{Array.from({length:9},(_,row)=>Array.from({length:row%2?5:6},(_,col)=><circle cx={1.5+col*2.8+(row%2?1.4:0)} cy={1.1+row*1.45} r=".55" fill="white" key={`${row}-${col}`}/>))}</>}
    {country === "australia" && <><rect width="40" height="26" fill="#012169"/><g transform="scale(.5)"><UnionJack/></g>{[[10,20,3.3],[28,5,2],[25,14,2],[34,12,2],[29,21,2],[32,17,1.2]].map(([x,y,r],i)=><path d="m0 -1 .28 .61 .7 -.11 -.44 .55 .28 .65 -.66 -.25 -.53 .46 .05 -.71 -.62 -.34 .69 -.17Z" transform={`translate(${x} ${y}) scale(${r})`} fill="white" key={i}/>)}</>}
  </svg>;
}

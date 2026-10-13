export const FALLBACK_EN="I don’t have approved information to answer that accurately. Please use the Let's Discuss form to request team follow-up when available.";
export const FALLBACK_DE="Dazu liegen mir keine freigegebenen Informationen vor. Bitte nutzen Sie das Kontaktformular, um eine Rückmeldung des Teams bei Verfügbarkeit anzufragen.";
export function looksSensitive(s:string){return /\b(passwords?|passw[oö]rter|passwort|card\s*(number|details)|kartennummer|kreditkarte|cvv|cvc|pin|secret\s*key|api\s*key|one.time\s*code|otp|login\s*credential)\b|\bsk-[a-z0-9_-]{12,}|\b(?:\d[ -]?){13,19}\b/i.test(s)}
export function redactMessage(value:string){
  if(looksSensitive(value))return "[Sensitive content removed]";
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[Contact detail removed]").replace(/\+?\d[\d ()-]{6,}\d/g,"[Contact detail removed]").slice(0,2000);
}

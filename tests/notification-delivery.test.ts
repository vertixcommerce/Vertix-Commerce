import { beforeEach, expect, it, vi } from "vitest";
import type { Payload, PayloadRequest } from "payload";
import type { Lead } from "@/payload-types";
const mocks=vi.hoisted(()=>({pending:[] as (()=>Promise<void>)[],send:vi.fn()}));
vi.mock("next/server",()=>({after:vi.fn((callback:()=>Promise<void>)=>mocks.pending.push(callback))}));
vi.mock("@/lib/lead-notifications",()=>({notifyLead:mocks.send}));
import { scheduleLeadNotification } from "@/lib/schedule-lead-notification";
import { after } from "next/server";
const logger={error:vi.fn()};const payload={logger} as unknown as Payload;
const lead={id:12,consent:true,notificationStatus:"pending"} as Lead;
const req={transactionID:"finished-with-response"} as PayloadRequest;
beforeEach(()=>{vi.clearAllMocks();mocks.pending.length=0;mocks.send.mockReset()});
it("saves the inquiry before sending and does not reuse its completed transaction",async()=>{
 await scheduleLeadNotification(payload,lead,req);
 expect(mocks.send).not.toHaveBeenCalled();
 await mocks.pending[0]();
 expect(mocks.send).toHaveBeenCalledWith(payload,lead);
});
it("contains notification failures after the response so the accepted inquiry is retained",async()=>{
 mocks.send.mockRejectedValue(new Error("Provider or status persistence unavailable"));
 await scheduleLeadNotification(payload,lead,req);
 await expect(mocks.pending[0]()).resolves.toBeUndefined();
 expect(logger.error).toHaveBeenCalledTimes(1);
});
it("keeps standalone script notifications in their existing transaction",async()=>{
 vi.mocked(after).mockImplementationOnce(()=>{throw new Error("No request lifecycle")});
 await scheduleLeadNotification(payload,lead,req);
 expect(mocks.send).toHaveBeenCalledWith(payload,lead,req);
});

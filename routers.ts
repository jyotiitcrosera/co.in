import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { buildAdmissionEnquirySheetPayload } from "@shared/admissionEnquiry";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createAdmissionEnquiry, createAuditLog, getRecentAuditLogs } from "./db";
import { feeLookup, getNotices, getSheetData, normalizeSessionTrade, staffLogin, studentLogin, writePortalData } from "./googleSheets";

const tradeSchema = z.enum(["Fitter", "Electrician"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portal: router({
    notices: publicProcedure.query(async () => getNotices()),
    studentRoster: publicProcedure.input(z.object({ session: z.string().min(1), trade: tradeSchema })).query(async ({ input }) => {
      const sheetName = normalizeSessionTrade(input.session, input.trade);
      return { sheetName, rows: await getSheetData(sheetName) };
    }),
    sheetData: publicProcedure.input(z.object({ sheetName: z.string().min(1) })).query(async ({ input }) => getSheetData(input.sheetName)),
    studentLogin: publicProcedure.input(z.object({ session: z.string().min(1), trade: tradeSchema, roll: z.string().min(1) })).query(async ({ input }) => studentLogin(input.session, input.trade, input.roll)),
    staffLogin: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(async ({ input }) => staffLogin(input.username, input.password)),
    staffList: publicProcedure.query(async () => {
      const { getStaffList } = await import("./googleSheets");
      return getStaffList();
    }),
    feeLookup: publicProcedure.input(z.object({ registrationNo: z.string().optional(), name: z.string().optional(), session: z.string().optional(), trade: tradeSchema.optional() })).query(async ({ input }) => feeLookup(input)),
    admissionEnquiry: publicProcedure.input(z.object({
      applicantName: z.string().trim().min(2).max(160),
      phone: z.string().trim().min(7).max(32),
      email: z.string().trim().email().max(320).optional().or(z.literal("")),
      trade: tradeSchema,
      qualification: z.string().trim().max(120).optional(),
      message: z.string().trim().max(2000).optional(),
    })).mutation(async ({ input }) => {
      const sheetResult = await writePortalData(buildAdmissionEnquirySheetPayload(input));
      if (String(sheetResult?.status || "").toLowerCase() === "error") throw new Error(sheetResult.message || "Admission enquiry could not be saved to Google Sheets.");
      const result = await createAdmissionEnquiry({
        applicantName: input.applicantName,
        phone: input.phone,
        email: input.email || null,
        trade: input.trade,
        qualification: input.qualification || null,
        message: input.message || null,
      });
      await createAuditLog({ actor: input.applicantName, actorRole: "public", action: "admission_enquiry_created", entity: String(result.id), details: `${input.trade} enquiry submitted to Google Sheets` });
      return { ...result, sheetSaved: true };
    }),
    auditLogs: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(200).optional() }).optional()).query(async ({ input }) => getRecentAuditLogs(input?.limit ?? 100)),
    auditEvent: publicProcedure.input(z.object({ actor: z.string().min(1), actorRole: z.string().min(1), action: z.string().min(1), entity: z.string().optional(), details: z.string().optional() })).mutation(async ({ input }) => createAuditLog(input)),
    write: publicProcedure.input(z.object({
      type: z.string().min(1), entries: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).optional(), username: z.string().optional(), password: z.string().optional(), name: z.string().optional(), trade: tradeSchema.optional(), unit: z.string().optional(), title: z.string().optional(), content: z.string().optional(), staff_username: z.string().optional(), actor_role: z.string().optional(), registration_no: z.string().optional(), student_name: z.string().optional(), session: z.string().optional(), admission_fee: z.number().optional(), payment_amount: z.number().optional(), payment_mode: z.string().optional(), mediator: z.string().optional(), mediator_paid: z.number().optional(), remarks: z.string().optional(),
    })).mutation(async ({ input }) => {
      const result = await writePortalData(input);
      await createAuditLog({ actor: input.username || input.staff_username || input.student_name || "portal-user", actorRole: input.actor_role || "portal", action: input.type, entity: input.registration_no || input.staff_username || input.student_name, details: input.type === "record_fee_payment" || input.type === "fee_payment" ? "Fee payment workflow action" : "Portal write action" });
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;

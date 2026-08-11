import { describe, expect, it } from "vitest";
import { selectDashboardQueryFn } from "./useDashboard";
import * as dashboardApi from "@/api/dashboard";

describe("selectDashboardQueryFn", () => {
  it("seleciona getMyDashboard para a visão 'self'", () => {
    expect(selectDashboardQueryFn("self", null)).toBe(dashboardApi.getMyDashboard);
  });

  it("seleciona getHouseholdDashboard para a visão 'household'", () => {
    expect(selectDashboardQueryFn("household", "partner-1")).toBe(dashboardApi.getHouseholdDashboard);
  });

  it("seleciona uma função que consulta o parceiro para a visão 'partner'", async () => {
    const fn = selectDashboardQueryFn("partner", "partner-1");
    expect(fn).not.toBe(dashboardApi.getMyDashboard);
    expect(fn).not.toBe(dashboardApi.getHouseholdDashboard);
  });

  it("cai para getMyDashboard quando a visão é 'partner' sem partnerId", () => {
    expect(selectDashboardQueryFn("partner", null)).toBe(dashboardApi.getMyDashboard);
  });
});

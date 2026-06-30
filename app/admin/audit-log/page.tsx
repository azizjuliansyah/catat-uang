"use client";

import { useEffect } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { AuditLogFilterBar, AuditLogSummary, AuditLogTable } from "./components";
import { useAuditLogState, useAuditLogHandlers } from "./hooks";
import { getActionIcon } from "./utils";
import { AuditLogPageSkeleton } from "./page.skeleton";

export default function AuditLogPage() {
  const {
    setLogs,
    setLoading,
    setAdminUsers,
    loading,
    adminUsers,
    searchTerm,
    setSearchTerm,
    actionFilter,
    setActionFilter,
    adminFilter,
    setAdminFilter,
    datePeriod,
    setDatePeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    page,
    setPage,
    totalPages,
    paginatedLogs,
    filteredLogs,
    filteredLogsCount,
    uniqueActions,
    formatActionLabel,
    getActionColor,
  } = useAuditLogState();

  const { fetchAll } = useAuditLogHandlers({
    setLogs,
    setLoading,
    setAdminUsers,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, actionFilter, adminFilter, datePeriod, customStartDate, customEndDate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={FileText}
        iconClassName="w-6 h-6 text-warning"
        title="Audit Log Sistem"
        description="Riwayat semua tindakan admin yang dilakukan dalam sistem."
      />

      {/* Filters */}
      <AuditLogFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        adminFilter={adminFilter}
        setAdminFilter={setAdminFilter}
        datePeriod={datePeriod}
        setDatePeriod={setDatePeriod}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        adminUsers={adminUsers}
        uniqueActions={uniqueActions}
        formatActionLabel={formatActionLabel}
        getActionIcon={getActionIcon}
      />

      {/* Summary Stats Cards */}
      <AuditLogSummary filteredLogs={filteredLogs} />

      {/* Audit Log Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <AuditLogTable
          loading={loading}
          filteredLogsCount={filteredLogsCount}
          paginatedLogs={paginatedLogs}
          page={page}
          setPage={setPage}
          pageSize={20}
          totalPages={totalPages}
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          adminFilter={adminFilter}
          startDate={customStartDate}
          endDate={customEndDate}
          getActionIcon={getActionIcon}
          getActionColor={getActionColor}
          formatActionLabel={formatActionLabel}
        />
      </div>
    </div>
  );
}

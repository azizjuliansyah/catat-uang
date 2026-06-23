"use client";

import { useEffect } from "react";
import { AuditLogFilters } from "./components/AuditLogFilters";
import { AuditLogStats } from "./components/AuditLogStats";
import { AuditLogTable } from "./components/AuditLogTable";
import { AuditLogHeader } from "./components/AuditLogHeader";
import { useAuditLogState } from "./hooks/useAuditLogState";
import { useAuditLogHandlers } from "./hooks/useAuditLogHandlers";
import { getActionIcon } from "./utils";

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
      <AuditLogHeader />

      {/* Filters */}
      <AuditLogFilters
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
      <AuditLogStats filteredLogs={filteredLogs} />

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

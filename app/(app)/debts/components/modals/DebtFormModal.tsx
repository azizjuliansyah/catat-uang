import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { DatetimeInput } from "@/components/ui/atoms/DatetimeInput";
import { Textarea } from "@/components/ui/atoms/Textarea";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { Plus, Trash2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { DebtPackage, DebtItem } from "../../types";
import { ProofUploader } from "./ProofUploader";
import { getNowDateTimeString } from "@/lib/utils/date";
import { ModalFooter } from "@/components/ui";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  formType: "owe" | "lend";
  setFormType: (type: "owe" | "lend") => void;
  formName: string;
  setFormName: (v: string) => void;
  formPackages: DebtPackage[];
  setFormPackages: React.Dispatch<React.SetStateAction<DebtPackage[]>>;
  isSubmitting: boolean;
  editingDebt?: DebtItem | null;
}

export function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  formType,
  setFormType,
  formName,
  setFormName,
  formPackages,
  setFormPackages,
  isSubmitting,
  editingDebt
}: DebtFormModalProps) {

  const handleAddRow = () => {
    setFormPackages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        totalAmount: "",
        dueDate: "",
        createdAt: getNowDateTimeString(),
        description: "",
        proofFiles: null,
        proofPreviews: null,
        existingProofUrls: null,
        shouldDeleteProofUrls: null
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setFormPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof DebtPackage, value: any) => {
    setFormPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleFileChange = (id: string, files: File[] | null) => {
    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      let loadedCount = 0;

      const loadPreviews = () => {
        setFormPackages((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, proofFiles: files, proofPreviews: newPreviews }
              : p
          )
        );
      };

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            loadPreviews();
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setFormPackages((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, proofFiles: null, proofPreviews: null }
            : p
        )
      );
    }
  };

  const handleDeleteExistingChange = (id: string, url: string, val: boolean) => {
    setFormPackages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const currentDeleted = p.shouldDeleteProofUrls || [];
        const updatedDeleted = val
          ? [...currentDeleted, url]
          : currentDeleted.filter((u) => u !== url);
        return {
          ...p,
          shouldDeleteProofUrls: updatedDeleted.length > 0 ? updatedDeleted : null
        };
      })
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Catatan Hutang/Piutang" : "Tambah Catatan Baru"}
      onSubmit={onSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Simpan"
        />
      }
    >
      <div className="space-y-4">
        {/* Jenis Catatan */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jenis Catatan</label>
          <TabButtonGroup variant="pill-colored" uniformWidth className="h-10 items-center gap-1">
            <TabButton
              isActive={formType === "owe"}
              onClick={() => setFormType("owe")}
              variant="pill-colored"
              className={`px-2 py-0 h-full text-xs transition-all ${formType === "owe"
                ? "bg-[#d48c3a]/25 border-none text-[#d48c3a]"
                : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5 inline" />
              Hutang (Owe)
            </TabButton>
            <TabButton
              isActive={formType === "lend"}
              onClick={() => setFormType("lend")}
              variant="pill-colored"
              className={`px-2 py-0 h-full text-xs transition-all ${formType === "lend"
                ? "bg-[#5c6bc0]/25 border-none text-[#5c6bc0]"
                : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <ArrowUpFromLine className="w-3.5 h-3.5 mr-1.5 inline" />
              Piutang (Lend)
            </TabButton>
          </TabButtonGroup>
        </div>

        {/* Nama Kontak */}
        <FormField
          label="Nama Kontak"
          required
        >
          <Input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Contoh: Budi, Bank Mandiri, Sisca"
          />
        </FormField>

        {/* Packages List */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
            <span>Daftar Transaksi Hutang/Piutang</span>
            <span className="text-[10px] font-normal text-text-muted">Total: {formPackages.length} item</span>
          </label>

          <div className="space-y-4 pr-1">
            {formPackages.map((pkg, index) => {
              const canDelete = formPackages.length > 1 && (!isEdit || pkg.id !== editingDebt?.id);

              return (
                <div key={pkg.id} className="relative p-4 border border-border/80 bg-surface-card rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Item #{index + 1}</span>
                    {canDelete && (
                      <ActionButton
                        type="button"
                        icon={Trash2}
                        title="Hapus Item"
                        variant="danger"
                        onClick={() => handleRemoveRow(pkg.id)}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Jumlah Dana (Rupiah)"
                      required
                    >
                      <CurrencyInput
                        value={pkg.totalAmount}
                        onChange={(e) => handleUpdateRow(pkg.id, "totalAmount", e.target.value)}
                        placeholder="0"
                      />
                    </FormField>

                    <FormField
                      label="Tanggal Hutang/Piutang"
                      required
                    >
                      <DatetimeInput
                        value={pkg.createdAt || ""}
                        onChange={(e) => handleUpdateRow(pkg.id, "createdAt", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Tanggal Jatuh Tempo"
                    helperText="Opsional"
                  >
                    <DatetimeInput
                      value={pkg.dueDate}
                      onChange={(e) => handleUpdateRow(pkg.id, "dueDate", e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Catatan Keterangan"
                    helperText="Opsional"
                  >
                    <Textarea
                      value={pkg.description}
                      onChange={(e) => handleUpdateRow(pkg.id, "description", e.target.value)}
                      placeholder="Masukkan keterangan detail jika ada..."
                      rows={3}
                    />
                  </FormField>

                  {/* Proof Uploader for Package */}
                  <ProofUploader
                    proofFiles={pkg.proofFiles}
                    proofPreviews={pkg.proofPreviews}
                    existingProofUrls={pkg.existingProofUrls}
                    shouldDeleteProofUrls={pkg.shouldDeleteProofUrls}
                    onFilesChange={(files) => handleFileChange(pkg.id, files)}
                    onDeleteExistingChange={(url, val) => handleDeleteExistingChange(pkg.id, url, val)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Row Button */}
        <Button
          type="button"
          size="sm"
          variant="dashed"
          onClick={handleAddRow}
          className="py-2.5 flex items-center justify-center gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Item Transaksi
        </Button>
      </div>
    </Modal>
  );
}

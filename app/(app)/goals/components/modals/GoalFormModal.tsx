import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { DatetimeInput } from "@/components/ui/atoms/DatetimeInput";
import { IconSelector } from "@/components/ui/molecules/IconSelector";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { SavingGoal, GOAL_ICONS } from "../../types";
import { getDefaultTargetDate } from "../../utils";

interface GoalFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formName: string;
  onFormNameChange: (value: string) => void;
  formTargetAmount: string;
  onFormTargetAmountChange: (value: string) => void;
  formTargetDate: string;
  onFormTargetDateChange: (value: string) => void;
  formIcon: string;
  onFormIconChange: (value: string) => void;
  isSubmitting: boolean;
}

export function GoalFormModal({
  isOpen,
  isEdit,
  onClose,
  onSubmit,
  formName,
  onFormNameChange,
  formTargetAmount,
  onFormTargetAmountChange,
  formTargetDate,
  onFormTargetDateChange,
  formIcon,
  onFormIconChange,
  isSubmitting
}: GoalFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Target Rencana Tabungan" : "Tambah Target Baru"}
      onSubmit={onSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Simpan Target"
        />
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nama Target Rencana"
          required
        >
          <Input
            type="text"
            value={formName}
            onChange={(e) => onFormNameChange(e.target.value)}
            placeholder="Contoh: Beli Laptop Baru, Liburan Jepang, DP Rumah"
          />
        </FormField>

        <FormField
          label="Jumlah Dana Target (Rupiah)"
          required
        >
          <CurrencyInput
            value={formTargetAmount}
            onChange={(e) => onFormTargetAmountChange(e.target.value)}
            placeholder="0"
          />
        </FormField>

        <FormField
          label="Batas Waktu Rencana (Target Date)"
          required
        >
          <DatetimeInput
            value={formTargetDate}
            onChange={(e) => onFormTargetDateChange(e.target.value)}
          />
        </FormField>

        <IconSelector
          icons={GOAL_ICONS}
          selected={formIcon}
          onSelect={onFormIconChange}
          label="Pilih Ikon Target"
          columns={6}
        />
      </div>
    </Modal>
  );
}

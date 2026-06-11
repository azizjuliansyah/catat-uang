import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { SavingGoal, GOAL_ICONS } from "../../types";
import { getIconComponent } from "@/lib/utils/icons";
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
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Simpan Target
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nama Target Rencana"
          required
          type="text"
          value={formName}
          onChange={(e) => onFormNameChange(e.target.value)}
          placeholder="Contoh: Beli Laptop Baru, Liburan Jepang, DP Rumah"
        />

        <FormField
          label="Jumlah Dana Target (Rupiah)"
          required
          type="currency"
          value={formTargetAmount}
          onChange={(e) => onFormTargetAmountChange(e.target.value)}
          placeholder="0"
        />

        <FormField
          label="Batas Waktu Rencana (Target Date)"
          required
          type="datetime-local"
          value={formTargetDate}
          onChange={(e) => onFormTargetDateChange(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Pilih Ikon Target</label>
          <div className="grid grid-cols-6 gap-2">
            {GOAL_ICONS.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              const isSelected = formIcon === iconName;
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  variant="ghost"
                  size="sm"
                  onClick={() => onFormIconChange(iconName)}
                  className={isSelected
                    ? "!bg-primary !border-primary !text-white hover:!bg-primary-hover"
                    : "bg-surface-input border border-border hover:border-border-strong"}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

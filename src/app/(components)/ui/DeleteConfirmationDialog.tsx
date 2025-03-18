import React, { FC } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useTranslation } from "react-i18next";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  productIdToDelete: string;
  inputId: string;
  setInputId: React.Dispatch<React.SetStateAction<string>>;
  handleDelete: () => void;
}

const DeleteConfirmationDialog: FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  productIdToDelete,
  inputId,
  setInputId,
  handleDelete,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
      <DialogContent>
        <p>{t("deleteDialog.description")}</p>
        <TextField
          fullWidth
          variant="outlined"
          label=  {t("deleteDialog.label")}
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
        {t("deleteDialog.cancel")}
        </Button>
        <Button onClick={handleDelete} color="secondary" disabled={inputId !== productIdToDelete}>
        {t("deleteDialog.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Trash2Icon } from "lucide-react";

interface ConfirmActionDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmActionDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col text-center">
          <AlertDialogMedia
            className={
              isDestructive
                ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive mx-auto"
                : "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-500 mx-auto"
            }
          >
            {icon ? icon : isDestructive ? <Trash2Icon className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-row gap-2">
          <AlertDialogCancel disabled={isLoading} variant="outline" className="mt-0">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent default to avoid immediate closing if there's async logic
              onConfirm();
            }}
            disabled={isLoading}
            variant={isDestructive ? "destructive" : "default"}
          >
            {isLoading ? "Please wait..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

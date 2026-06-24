"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Course } from "@/types/course";
import { Trash2Icon } from "lucide-react";

interface DeleteCourseAlertDialogProps {
  isOpen: boolean;
  course: Course | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteCourseAlertDialog({
  isOpen,
  course,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteCourseAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col  ">
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Course?</AlertDialogTitle>
          <AlertDialogDescription>
            {course && (
              <>
                Are you sure you want to delete <strong>{course.title}</strong>?
                <br />
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

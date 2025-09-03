import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface LimitWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onUpgrade: () => void;
  generationsLeft: number;
}

export function LimitWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onUpgrade,
  generationsLeft,
}: LimitWarningDialogProps) {

  const hasGenerations = generationsLeft > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasGenerations ? "Confirm Generation" : "Generation Limit Reached"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasGenerations ? (
              <>
                You are a free user and have{" "}
                <span className="font-bold text-foreground">
                  {generationsLeft} roadmap generation(s)
                </span>{" "}
                left. This action will use one generation credit.
              </>
            ) : (
              "You have no more free generations left. Please upgrade to Premium to create unlimited roadmaps."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          {hasGenerations ? (
            <AlertDialogAction asChild>
              <Button onClick={onConfirm}>Proceed</Button>
            </AlertDialogAction>
          ) : (
             <AlertDialogAction asChild>
                <Button onClick={onUpgrade}>Upgrade to Premium</Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

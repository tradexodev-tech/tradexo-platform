import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyRFQStateProps = {
  onCreateRFQ: () => void;
};

export default function EmptyRFQState({ onCreateRFQ }: EmptyRFQStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <FileText className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No RFQs yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first request for quotation to invite suppliers to bid on
        your sourcing needs.
      </p>
      <Button type="button" className="mt-6" onClick={onCreateRFQ}>
        <Plus className="size-4" />
        Create RFQ
      </Button>
    </div>
  );
}

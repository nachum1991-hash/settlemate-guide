import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IntroVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IntroVideoModal = ({ open, onOpenChange }: IntroVideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Welcome to Italy - Introduction Video</DialogTitle>
          <DialogDescription>
            Learn what to expect during your relocation journey to Italy
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Introduction to studying in Italy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

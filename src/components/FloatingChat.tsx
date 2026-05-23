import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TaskChat } from "./TaskChat";

interface FloatingChatProps {
  taskId: string;
  phase: string;
  label?: string;
}

const COUNTRY_STORAGE_KEY = "settlemate-selected-country";

/**
 * Returns the user's country preference. Prefers the authenticated profile,
 * falls back to a localStorage value for anonymous users.
 */
export const getStoredCountry = (): string | null => {
  return localStorage.getItem(COUNTRY_STORAGE_KEY);
};

export const setStoredCountry = (country: string) => {
  localStorage.setItem(COUNTRY_STORAGE_KEY, country);
};


export const FloatingChat = ({ taskId, phase, label }: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button — sits above content; on mobile, raised to clear bottom bars/keyboards */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        size="icon"
        aria-label="Open community chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh]">
          <DrawerHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg font-semibold">
                  Community Chat
                </DrawerTitle>
                {label && (
                  <p className="text-sm text-muted-foreground mt-1">{label}</p>
                )}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <TaskChat taskId={taskId} phase={phase} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

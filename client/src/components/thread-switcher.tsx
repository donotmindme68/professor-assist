import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProfessorAvatar } from './professor-avatar';

interface Thread {
  id: number;
  professorId: number;
  subjectType: string;
  lastMessage?: string;
}

interface ThreadSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threads: Thread[];
  currentThreadId: number | null;
  onThreadSelect: (threadId: number) => void;
}

export function ThreadSwitcher({
                                 open,
                                 onOpenChange,
                                 threads,
                                 currentThreadId,
                                 onThreadSelect,
                               }: ThreadSwitcherProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg"
                >
                  <Dialog.Title className="text-lg font-semibold text-foreground">
                    Switch Conversation
                  </Dialog.Title>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {threads.map((thread) => (
                      <motion.button
                        key={thread.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onThreadSelect(thread.id);
                          onOpenChange(false);
                        }}
                        className={`p-4 rounded-lg border transition-colors ${
                          thread.id === currentThreadId
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ProfessorAvatar size="sm" professorId={thread.professorId} />
                          <span className="text-sm font-medium text-foreground">{thread.subjectType}</span>
                          {thread.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {thread.lastMessage}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
import type { Bite, SENProfile } from '@schoolhub/types';
import { BiteViewer } from './BiteViewer';

interface Props {
  bite: Bite;
  scheduleBiteId: string;
  childId: string;
  onDone: () => void;
}

// Full-screen, chrome-free ADHD wrapper. Passes senProfile='ADHD' to BiteViewer
// which activates the 5-min timer bar and removes the back button.
export function FocusMode({ bite, scheduleBiteId, childId, onDone }: Props) {
  const adhd: SENProfile = 'ADHD';
  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-bg" role="main">
      <BiteViewer
        bite={bite}
        scheduleBiteId={scheduleBiteId}
        childId={childId}
        senProfile={adhd}
        onBack={onDone}
      />
    </div>
  );
}

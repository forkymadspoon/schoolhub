import BookmarkIcon from '../../assets/icons/interface/bookmark.svg?react';
import CalculatorIcon from '../../assets/icons/interface/calculator.svg?react';
import NoteIcon from '../../assets/icons/interface/note.svg?react';
import MicroscopeIcon from '../../assets/icons/health/microscope.svg?react';

interface Props {
  subject: string;
  className?: string;
}

export function SubjectIcon({ subject, className = 'w-5 h-5' }: Props) {
  if (subject === 'Mathematics') return <CalculatorIcon className={className} />;
  if (subject === 'Science')     return <MicroscopeIcon className={className} />;
  if (subject === 'English')     return <BookmarkIcon className={className} />;
  return <NoteIcon className={className} />;
}

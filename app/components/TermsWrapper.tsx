'use client';

import { useState, useEffect } from 'react';
import TermsModal from './TermsModal';
import Cookies from 'js-cookie';

interface TermsWrapperProps {
  children: React.ReactNode;
}

function setTermsCookie() {
  Cookies.set('termsAccepted', 'true', { expires: 365, path: '/' });
}

function hasTermsCookie() {
  return Cookies.get('termsAccepted') === 'true';
}

export default function TermsWrapper({ children }: TermsWrapperProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!hasTermsCookie()) {
      setShowTerms(false); // Don't show until user interacts
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasTermsCookie()) {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest('form');
      if (form) {
        setFormRef(form);
        setShowTerms(true);
      }
    }
    // If already accepted, allow normal flow
  };

  const handleAcceptTerms = () => {
    setTermsCookie();
    setShowTerms(false);
    if (formRef) {
      formRef.requestSubmit();
    }
  };

  return (
    <>
      <div onClick={handleClick}>{children}</div>

      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={handleAcceptTerms}
        />
      )}
    </>
  );
}

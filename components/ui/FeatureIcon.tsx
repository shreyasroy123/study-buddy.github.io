import { QuestionMarkCircleIcon, DocumentTextIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

type IconType = 'question' | 'document' | 'megaphone';

interface FeatureIconProps {
  type: IconType;
}

export const FeatureIcon = ({ type }: FeatureIconProps) => {
  // Force a small size with !important to override any conflicting styles
  const iconClasses = "h-6 w-6 !h-6 !w-6";
  
  switch (type) {
    case 'question':
      return <QuestionMarkCircleIcon className={iconClasses} width={24} height={24} />;
    case 'document':
      return <DocumentTextIcon className={iconClasses} width={24} height={24} />;
    case 'megaphone':
      return <MegaphoneIcon className={iconClasses} width={24} height={24} />;
    default:
      return <QuestionMarkCircleIcon className={iconClasses} width={24} height={24} />;
  }
};
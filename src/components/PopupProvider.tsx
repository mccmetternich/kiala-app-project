'use client';

import CommunityPopup from './CommunityPopup';
import ExitIntentPopup from './ExitIntentPopup';

interface PopupProviderProps {
  siteId: string;
  doctorName?: string;
  communityName?: string;
  memberCount?: number;
  communityBenefits?: string[];
  communityIncentive?: string;
  exitHeadline?: string;
  exitSubheadline?: string;
  exitIncentive?: string;
  exitBenefits?: string[];
  showCommunityPopup?: boolean;
  showExitPopup?: boolean;
  communityPopupDelay?: number;
  leadMagnetPdfUrl?: string; // PDF to download on signup
}

export default function PopupProvider({
  siteId,
  doctorName,
  communityName,
  memberCount,
  communityBenefits,
  communityIncentive,
  exitHeadline,
  exitSubheadline,
  exitIncentive,
  exitBenefits,
  showCommunityPopup = true,
  showExitPopup = true,
  communityPopupDelay = 8000,
  leadMagnetPdfUrl
}: PopupProviderProps) {
  return (
    <>
      {showCommunityPopup && (
        <CommunityPopup
          siteId={siteId}
          doctorName={doctorName}
          communityName={communityName}
          memberCount={memberCount}
          benefits={communityBenefits}
          incentive={communityIncentive}
          triggerDelay={communityPopupDelay}
          leadMagnetPdfUrl={leadMagnetPdfUrl}
        />
      )}
      {showExitPopup && (
        <ExitIntentPopup
          siteId={siteId}
          doctorName={doctorName}
          headline={exitHeadline}
          subheadline={exitSubheadline}
          incentive={exitIncentive}
          benefits={exitBenefits}
          leadMagnetPdfUrl={leadMagnetPdfUrl}
        />
      )}
    </>
  );
}

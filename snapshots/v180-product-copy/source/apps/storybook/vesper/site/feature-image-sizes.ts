// On mobile, only the lead card is full width. Supporting cards share the
// remaining space after the 32px page inset and the 10px inter-card gutter.
// Keep the established desktop density target to avoid larger startup loads.
export const featureImageSizes = (lead: boolean) =>
  `${lead ? '(max-width:680px) calc(100vw - 32px)' : '(max-width:680px) calc(50vw - 21px)'}, (max-width:1040px) 31vw, 380px`;

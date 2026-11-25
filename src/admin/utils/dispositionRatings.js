const DISPOSITION_RATING_LABELS = {
  1: "Not acceptable",
  2: "Approaching",
  3: "Acceptable",
  4: "High level",
  5: "Excellent",
};

export const getDispositionRatingLabel = (rating) =>
  DISPOSITION_RATING_LABELS[Number(rating)] ?? "";

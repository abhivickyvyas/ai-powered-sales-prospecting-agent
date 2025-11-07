// Fix: Made 'uri' and 'title' optional to align with the @google/genai library's GroundingChunk type.
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  // Add other grounding types if needed, like maps
}

export interface ProspectReport {
  text: string;
  groundingLinks: GroundingChunk[];
}

export interface ProspectingFormInputs {
  companyOrIndustry: string;
  focusArea: string; // e.g., "Omnichannel Investment", "Supply Chain Challenges", "Executive Changes"
  additionalKeywords?: string;
}
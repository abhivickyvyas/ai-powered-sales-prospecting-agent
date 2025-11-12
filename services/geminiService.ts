import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_FLASH_MODEL } from '../constants';
import { GroundingChunk, ProspectingFormInputs, ProspectReport } from '../types';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000; // 1 second

const getGeminiClient = () => {
  // A new GoogleGenAI instance is created for each call to ensure the most up-to-date API key is used.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateProspectData = async (
  inputs: ProspectingFormInputs,
): Promise<ProspectReport> => {
  try {
    const ai = getGeminiClient();

    const { companyOrIndustry, focusArea, additionalKeywords } = inputs;

    const detailedPrompt = `
You are an intelligent sales prospecting agent for a company providing modern inventory & order management software. Your goal is to identify high-potential prospects for OMS/IMS solutions among retailers and B2B companies with $1B+ revenue, profitability, and at least 50 store locations in North America.

Based on the following query and your comprehensive knowledge, including up-to-date information from Google Search, generate a detailed prospect report. Focus on identifying specific indicators and actionable insights.

**User Query:** Identify prospects related to "${companyOrIndustry}" with a focus on "${focusArea}". Additional context: "${additionalKeywords || 'None'}".

**Key Buying Signals to Prioritize (incorporate latest info from news, financial reports, job postings, etc.):**
- Recent investments in omnichannel technology.
- Supply chain challenges or digital transformations.
- Executive discussions on OMS/IMS build vs. buy.
- Job postings with keywords like "IBM Sterling OMS", "Order Management System", "Manhattan", "Fluent", "Kibo".
- New executive appointments (especially leaders with experience at companies known for modern supply chains).
- Cloud migrations to AWS, Azure, or Google Cloud.
- Financial reports mentioning AI, omnichannel, digital transformation investments.
- Industry event speakers in supply chain/operations/tech roles at major retail conferences.

**Retailer Website Capability Analysis (simulate assessment based on public info):**
- Evaluate presence of expected delivery dates, BOPIS, same-day delivery.
- Look for "low in stock" alerts, pre-orders, ship-from-store.

**Output Format (Strictly use Markdown headings and bullet points):**

## Prospect Report for ${companyOrIndustry} focusing on ${focusArea}${additionalKeywords ? ` (Context: ${additionalKeywords})` : ''}

### 1. Prioritized Target Companies
- **[Company Name 1]**: [Brief summary of why they are a good prospect, linking to buying signals and the value proposition for their specific needs. Ensure company meets $1B+ revenue, profitability, and 50+ stores criterion.]
- **[Company Name 2]**: [Brief summary of why they are a good prospect, linking to buying signals and the value proposition for their specific needs. Ensure company meets $1B+ revenue, profitability, and 50+ stores criterion.]
...
(Provide at least 2-3 highly relevant companies if possible.)

### 2. Key Decision-Makers
- **[Decision Maker Name 1]** ([Title at Company 1]): [Relevant LinkedIn connection insight, if applicable, or typical responsibilities related to OMS/IMS. Potential areas of interest for a modern OMS/IMS provider.]
- **[Decision Maker Name 2]** ([Title at Company 1]): [Relevant LinkedIn connection insight, if applicable, or typical responsibilities related to OMS/IMS. Potential areas of interest for a modern OMS/IMS provider.]
...
(Identify 1-2 key decision-makers per target company.)

### 3. Customized Outreach Content
**Email Draft for [Target Company 1, e.g., "XYZ Retail"]:**
Subject: Enhancing Order and Inventory Management for [Target Company 1 Name]

Dear [Decision Maker Name],

I've been closely following [Target Company 1 Name]'s recent [mention specific buying signal, e.g., "investments in omnichannel initiatives" or "discussions on supply chain resilience"]. It's clear that modern retail demands agility, and optimizing your inventory and order management systems is paramount.

We specialize in empowering companies like yours to overcome the challenges of fragmented inventory, proliferating order channels, and complex fulfillment. Our modern OMS/IMS solutions are designed for speed, scalability, and intelligence, helping you [mention specific benefits tailored to the company's identified gaps, e.g., "achieve seamless BOPIS, real-time inventory visibility, and faster delivery promises"].

I believe a brief discussion could reveal how our expertise aligns perfectly with your goals for [mention their specific focus, e.g., "improving customer experience through advanced fulfillment options"]. Would you be open to a quick chat next week?

Best regards,
[Your Name/Sales Team]

(Provide a similar draft for each target company.)

### 4. Supporting Insights
- **Key Buying Signals Observed**: [List specific signals for each target company and their sources/context, e.g., "Recent news on 'Company X' investing in omnichannel tech (source: Forbes article, YYYY-MM-DD)", "Job posting for 'Order Management Specialist' at 'Company Z' (source: LinkedIn, YYYY-MM-DD)"].
- **Website Capability Gaps (simulated)**: [For each target company, detail observed gaps, e.g., "Company X's website lacks clear BOPIS options and only provides generic delivery estimates on product pages."].
- **Financial/Operational Context**: [For each target company, provide relevant revenue, profitability, and store count information (cite sources or state "simulated based on public information").]

Remember to position the modern OMS/IMS solution as the key for companies struggling with legacy systems that can't handle today's need for speed, scalability, and intelligence in inventory and order management.
`;

    let response: GenerateContentResponse | null = null;
    let lastError: Error | null = null;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        response = await ai.models.generateContent({
          model: GEMINI_FLASH_MODEL,
          contents: detailedPrompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        
        if (response) {
          lastError = null; // Clear last error on success
          break; // Exit loop on success
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${i + 1} of ${MAX_RETRIES} failed. Retrying...`, error);
        
        const errorMessage = lastError.message.toLowerCase();
        // Check for retryable server-side errors
        if (errorMessage.includes("503") || errorMessage.includes("unavailable") || errorMessage.includes("overloaded")) {
          if (i < MAX_RETRIES - 1) {
            // Exponential backoff
            const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          // It's not a retryable error (e.g., a 4xx client error), so break the loop.
          break;
        }
      }
    }
    
    // If all retries failed, throw the last captured error.
    if (lastError) {
      throw lastError;
    }

    if (!response) {
      throw new Error("Failed to get a response from the model after multiple retries.");
    }
    
    const textOutput = response.text;
    const groundingLinks: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text: textOutput,
      groundingLinks: groundingLinks,
    };
  } catch (error) {
    console.error('Error generating prospect data:', error);
    
    // Provide a user-friendly message for model overload after all retries.
    if (error instanceof Error && (error.message.includes("503") || error.message.includes("overloaded"))) {
      throw new Error("The AI model is currently overloaded. Please try again in a few moments.");
    }

    // Consolidate API key error handling to provide a consistent error message to the UI
    if (error instanceof Error &&
        (error.message.includes("Requested entity was not found.") ||
         error.message.includes("API_KEY environment variable is not set."))) {
      throw new Error("API Key issue: Please select or re-select your API key. If the problem persists, ensure the key is valid. Original error: " + error.message);
    }
    
    throw new Error(`Failed to generate prospect data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

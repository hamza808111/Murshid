// src/services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
  console.error("❌ Missing Gemini API Key. Add VITE_GEMINI_API_KEY in .env.local");
}

// Create client for Gemini Developer API
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Good, cheap/free model for text:
const MODEL_ID = "gemini-2.0-flash-lite";

export interface MajorRecommendation {
  majorName: string;
  matchPercentage: number;
  reasoning: string;
  keyStrengths: string[];
  careerPaths: string[];
  potentialChallenges: string;
  // Optional enrichments after DB matching:
  majorId?: string;
  universities?: {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
  }[];
}

export interface AssessmentResult {
  recommendations: MajorRecommendation[];
  overallAnalysis: string;
  personalityProfile: string;
}

/**
 * Call Gemini to analyze quiz answers and return structured result
 */
export const analyzeAssessment = async (
  answers: Record<string, string | number>,
  language: "en" | "ar" = "en"
): Promise<AssessmentResult> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const formattedAnswers = Object.entries(answers)
    .map(([questionId, answer]) =>
      typeof answer === "number" ? `${questionId}: ${answer}/100` : `${questionId}: ${answer}`
    )
    .join("\n");

  const prompt = `You are an expert academic advisor. Analyze these student responses and recommend university majors.

Student Responses:
${formattedAnswers}

Respond ONLY with valid JSON (no markdown, no code blocks, no explanations).
Language: ${language === "ar" ? "Arabic" : "English"}

Required JSON format:
{
  "recommendations": [
    {
      "majorName": "string",
      "matchPercentage": number (0-100),
      "reasoning": "string (2-3 sentences)",
      "keyStrengths": ["string", "string", "string"],
      "careerPaths": ["string", "string", "string", "string"],
      "potentialChallenges": "string (1-2 sentences)"
    }
  ],
  "overallAnalysis": "string (one paragraph)",
  "personalityProfile": "string (2-3 sentences)"
}

Provide exactly 5 majors, ranked by match percentage (highest first).`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Handle response - text is a getter property
    let text = "";
    try {
      text = response.text || "";
    } catch (e) {
      // If text getter fails, try alternative structures
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected response structure:", response);
        throw new Error("Unexpected response format from Gemini API");
      }
    }

    if (!text || text.trim().length === 0) {
      console.error("Empty response from Gemini API:", response);
      throw new Error("Received empty response from AI. Please try again.");
    }

    console.log("Gemini raw response:", text);

    // --- Clean up to valid JSON ---
    let cleanedText = text.trim();

    // Remove ```json ... ``` if Gemini ignores the “no markdown” instruction
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    }

    // Grab first {...} block if there's extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanedText) as AssessmentResult;

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid recommendations format");
    }
    if (parsed.recommendations.length === 0) {
      throw new Error("No recommendations generated");
    }

    parsed.recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return parsed;
  } catch (err: any) {
    console.error("❌ Error analyzing assessment with Gemini:", err);
    
    // Provide more specific error messages
    if (err?.message?.includes("API key")) {
      throw new Error("Invalid or missing Gemini API key. Please check your configuration.");
    }
    if (err?.message?.includes("quota") || err?.message?.includes("rate limit")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    if (err?.message?.includes("network") || err?.message?.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    if (err instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    
    throw new Error(err?.message || "Failed to analyze assessment. Please try again later.");
  }
};

/**
 * Optional: simple connectivity test (not used automatically)
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  if (!API_KEY) return false;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: "Say hello in one word",
    });

    console.log("Gemini test response:", response.text);
    return !!response.text?.trim();
  } catch (error) {
    console.error("Gemini API test failed:", error);
    return false;
  }
};

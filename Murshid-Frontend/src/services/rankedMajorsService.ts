import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// Cache configuration
const CACHE_KEY = 'murshid_ranked_majors_cache';
const CACHE_TIMESTAMP_KEY = 'murshid_ranked_majors_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface RankedMajor {
  name: string;
  nameAr: string;
  rank: number;
  demandScore: number;
  salaryRange: string;
  growthRate: string;
  keySkills: string[];
  topIndustries: string[];
  jobOutlook: string;
  reasoning: string;
}

export interface RankedMajorsResponse {
  lastUpdated: string;
  topMajors: RankedMajor[];
  marketTrends: string;
}

/**
 * Get cached ranked majors data from localStorage
 */
const getCachedData = (): RankedMajorsResponse | null => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    const now = Date.now();
    
    // Check if cache has expired
    if (now - timestamp > CACHE_DURATION) {
      console.log('Ranked majors cache expired');
      return null;
    }
    
    console.log('Using cached ranked majors data');
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Save ranked majors data to localStorage cache
 */
const setCachedData = (data: RankedMajorsResponse): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('Ranked majors data cached');
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Fetch ranked majors based on current global market demand
 * @param language - Language for the response
 * @param forceRefresh - If true, bypass cache and fetch fresh data
 */
export const getRankedMajors = async (language: 'en' | 'ar' = 'en', forceRefresh: boolean = false): Promise<RankedMajorsResponse> => {
  // Check cache first (unless force refresh is requested)
  if (!forceRefresh) {
    const cachedData = getCachedData();
    if (cachedData) {
      return cachedData;
    }
  }
  
  try {
    const prompt = `You are an expert career and education advisor with deep knowledge of global job markets, industry trends, and academic majors.

Generate a comprehensive ranked list of the TOP 15 most in-demand and valuable university majors based on CURRENT 2025 global market data.

Consider these factors:
1. Current job market demand (2025)
2. Salary potential and growth
3. Future industry growth projections
4. Skills relevance to emerging technologies (AI, automation, sustainability, etc.)
5. Global economic trends
6. Job security and opportunities

Provide your response in JSON format with this exact structure:
{
  "lastUpdated": "2025-11-22",
  "marketTrends": "Brief 2-3 sentence overview of current major market trends affecting education and careers in 2025",
  "topMajors": [
    {
      "name": "Major name in English",
      "nameAr": "Major name in Arabic",
      "rank": 1,
      "demandScore": 95,
      "salaryRange": "$80,000 - $150,000",
      "growthRate": "+25% (2025-2030)",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
      "topIndustries": ["Industry 1", "Industry 2", "Industry 3"],
      "jobOutlook": "Brief description of job prospects",
      "reasoning": "2-3 sentences explaining why this major is highly ranked"
    }
  ]
}

Important:
- Rank majors from 1 (highest demand) to 15
- DemandScore should be 70-100 (higher = more demand)
- Use realistic salary ranges for 2025
- Include diverse fields (STEM, Healthcare, Business, etc.)
- Base rankings on actual 2025 market data and trends
- Provide both English and Arabic names for each major
- Be specific and data-driven in your reasoning

Return ONLY valid JSON, no additional text.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const text = response.text ?? '';
    console.log('Gemini ranked majors raw response:', text);

    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```$/, '');
    }

    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const data: RankedMajorsResponse = JSON.parse(jsonText);
    
    // Validate response structure
    if (!data.topMajors || !Array.isArray(data.topMajors)) {
      throw new Error('Invalid response structure from AI');
    }

    // Cache the successful response
    setCachedData(data);

    return data;
  } catch (error) {
    console.error('Error fetching ranked majors:', error);
    
    // If API fails, try to return stale cache data as fallback
    const staleCache = localStorage.getItem(CACHE_KEY);
    if (staleCache) {
      console.log('API failed, returning stale cache data');
      return JSON.parse(staleCache);
    }
    
    throw new Error('Failed to fetch ranked majors data. Please try again later.');
  }
};

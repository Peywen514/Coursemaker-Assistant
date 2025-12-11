import { GoogleGenAI, Type } from "@google/genai";
import { CourseInfo, PainPoint, SlideContent, VideoScriptScene } from "../types";

const STORAGE_KEY = "coursemarketer_api_key";

// Initialize customApiKey from LocalStorage if available
let customApiKey: string | null = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

// Dynamic Date Logic
const CURRENT_YEAR = new Date().getFullYear(); // e.g., 2025
const NEXT_YEAR = CURRENT_YEAR + 1;            // e.g., 2026

export const setCustomApiKey = (key: string) => {
  customApiKey = key;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, key);
  }
};

export const removeCustomApiKey = () => {
  customApiKey = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasStoredKey = (): boolean => {
  return !!customApiKey;
};

// Helper to get client - checks manual key first, then environment variable
const getClient = () => {
  const apiKey = customApiKey || process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-now' });
};

// Helper to clean JSON string from Markdown code blocks
const cleanJson = (text: string | undefined): string => {
  if (!text) return "[]";
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  return cleaned.trim();
};

/**
 * Analyzes the course info to generate targeted marketing angles for diverse groups.
 * Updated to focus on CURRENT YEAR trends.
 */
export const analyzeCourseAndGetPainPoints = async (course: CourseInfo): Promise<PainPoint[]> => {
  const ai = getClient();
  
  const prompt = `
    You are a Content Marketing Director for "104 Learning Platform" (104學習平台) in Taiwan.
    Your goal is to maximize SEO traffic and course enrollment using **current market data (${CURRENT_YEAR})**.
    
    Analyze the following online course and identify 3 distinct "Marketing Angles" targeting different demographics in Taiwan.
    
    **CRITICAL DATE REQUIREMENT:** 
    - Use **${CURRENT_YEAR}** or **${NEXT_YEAR}** in your analysis.
    - **DO NOT** use outdated ranges like "2023-2024" or generic ranges like "2024~2025". 
    - Focus on immediate relevance for the current year: ${CURRENT_YEAR}.

    Target Demographics to consider (choose the most relevant 3):
    1. **Job Seekers/Unemployed (待業者/轉職者):** Focus on *current* hiring trends, modern resume standards (ATS friendly), and AI interview prep.
    2. **Employed Professionals (在職者):** Focus on Upskilling for AI, "Quiet Quitting" (安靜離職), Salary negotiation in the current economy, and burnout.
    3. **Students/Fresh Grads (學生/新鮮人):** Focus on "Graduation Anxiety" in the AI era, lack of practical experience, and internship trends.
    4. **Re-entering Workforce (二度就業者):** Focus on the current friendly environment for returners due to labor shortages, confidence building, and catching up with digital tools.

    For each angle, identify **Trending SEO Keywords** that are popular in Taiwan searches *recently*.

    Course Info:
    - Title: ${course.title}
    - Description: ${course.description}
    - Takeaways: ${course.keyTakeaways}

    Return JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            targetGroup: { type: Type.STRING, description: "The specific demographic (e.g., 轉職者, 二度就業父母)" },
            title: { type: Type.STRING, description: `A catchy title using SEO keywords. Use '${CURRENT_YEAR}' or '${NEXT_YEAR}'.` },
            description: { type: Type.STRING, description: `Why this group needs this course based on ${CURRENT_YEAR} trends` },
            marketingHook: { type: Type.STRING, description: "A powerful one-sentence hook (Traditional Chinese)" },
            seoKeywords: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 3-5 high traffic SEO keywords used in this strategy"
            }
          },
          required: ["id", "targetGroup", "title", "description", "marketingHook", "seoKeywords"],
        },
      },
    },
  });

  try {
    return JSON.parse(cleanJson(response.text));
  } catch (e) {
    console.error("JSON Parse Error", e, response.text);
    throw new Error("Failed to parse AI response");
  }
};

/**
 * Generates text content for a 5-slide "Lazy Pack" (Carousel).
 * Updated for Taiwan "Dry Goods" (乾貨) style with editable focus.
 */
export const generateLazyPackContent = async (course: CourseInfo, painPoint: PainPoint): Promise<SlideContent[]> => {
  const ai = getClient();

  const prompt = `
    Create content for a 5-slide Instagram/Facebook carousel (Lazy Pack/懶人包) for the Taiwan market (Context: ${CURRENT_YEAR}).
    
    Target Audience: ${painPoint.targetGroup}
    Theme: ${painPoint.title}
    SEO Keywords to inject: ${painPoint.seoKeywords.join(", ")}
    Course: ${course.title}
    
    Style Guide:
    - **DATE RULE**: Always use "${CURRENT_YEAR}" or "${NEXT_YEAR}". Do NOT use "2024~2025". 
    - Use modern Taiwan social media slang (e.g., 必收, 乾貨, 焦慮, 救星, 懂的都懂).
    - Tone: Empathetic, fast-paced, "Helpful Peer" persona.
    - Structure:
      Slide 1: **Viral Cover**. High impact title with SEO keywords (e.g., "${NEXT_YEAR}轉職必看!", "${CURRENT_YEAR}最新趨勢").
      Slide 2: **The Current Pain**. Empathize with a specific struggle relevant to NOW.
      Slide 3: **The Insight**. Break a myth or provide a "Aha!" moment.
      Slide 4: **The Solution (Dry Goods)**. Actionable tips from the course.
      Slide 5: **CTA**. Strong call to action to learn more on 104 Learning.
      
    For 'visualPrompt', describe clean, modern, text-heavy friendly backgrounds (Memphis style, gradients, or professional minimalism).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            subtext: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["headline", "subtext", "visualPrompt"],
        },
      },
    },
  });

  return JSON.parse(cleanJson(response.text));
};

/**
 * Generates a background image for a slide.
 */
export const generateSlideBackground = async (visualPrompt: string): Promise<string> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
          parts: [{ text: `Background image for social media post, corporate marketing style, high quality, 4k, no text. ${visualPrompt}` }]
      },
      config: {
         imageConfig: {
             aspectRatio: "1:1",
         }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
  } catch (e) {
    console.warn("Image generation failed, likely due to tier limits. Returning null to use fallback gradient.");
  }
  
  throw new Error("No image generated");
};

/**
 * Generates a Video Script (Shorts/Reels) focused on high retention.
 */
export const generateVideoScript = async (course: CourseInfo, painPoint: PainPoint): Promise<VideoScriptScene[]> => {
    const ai = getClient();
    const prompt = `
      Write a viral Short Video Script (15-30s, Reels/TikTok/Shorts) for Taiwan 104 Learning.
      Context: Current Taiwan Job Market (${CURRENT_YEAR}).
      
      Target: ${painPoint.targetGroup}
      Topic: ${painPoint.title}
      Keywords: ${painPoint.seoKeywords.join(", ")}
      
      Format: JSON Array of scenes.
      
      Script Requirements:
      1. **0-3s Hook**: Must stop the scroll. Address a *current* specific pain point immediately. Use "${CURRENT_YEAR}" if mentioning years.
      2. **Body**: Fast-paced value delivery.
      3. **Ending**: CTA to click the link/search on 104.
      4. Language: Natural spoken Taiwanese Mandarin (Traditional Chinese).
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.STRING, description: "Time stamp e.g. 0-2s" },
                        visual: { type: Type.STRING, description: "Visual direction (e.g., Person looking shocked)" },
                        audio: { type: Type.STRING, description: "Spoken text or overlay text" }
                    },
                    required: ["scene", "visual", "audio"]
                }
            }
        }
    });

    return JSON.parse(cleanJson(response.text));
}

/**
 * Generates a video using Veo (Requires Paid Key).
 */
export const generateMarketingVideo = async (videoPrompt: string): Promise<string> => {
  const ai = getClient();
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: videoPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  const apiKey = customApiKey || process.env.API_KEY;
  return `${videoUri}&key=${apiKey}`;
};

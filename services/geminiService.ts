import { GoogleGenAI, Type } from "@google/genai";
import { CourseInfo, PainPoint, SlideContent, VideoScriptScene } from "../types";

// Variable to store manually entered key
let customApiKey: string | null = null;

export const setCustomApiKey = (key: string) => {
  customApiKey = key;
};

// Helper to get client - checks manual key first, then environment variable
const getClient = () => {
  const apiKey = customApiKey || process.env.API_KEY;
  // Note: If apiKey is missing in production, calls will fail with 400/403.
  // The UI should handle explaining this to the user.
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-now' });
};

// Helper to clean JSON string from Markdown code blocks
const cleanJson = (text: string | undefined): string => {
  if (!text) return "[]";
  // Remove ```json and ``` wrapping if present
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  return cleaned.trim();
};

/**
 * Analyzes the course info to generate targeted marketing angles for diverse groups.
 * Updated to focus on RECENT (1-2 years) trends.
 */
export const analyzeCourseAndGetPainPoints = async (course: CourseInfo): Promise<PainPoint[]> => {
  const ai = getClient();
  
  const prompt = `
    You are a Content Marketing Director for "104 Learning Platform" (104學習平台) in Taiwan.
    Your goal is to maximize SEO traffic and course enrollment using **current market data (2023-2025)**.
    
    Analyze the following online course and identify 3 distinct "Marketing Angles" targeting different demographics in Taiwan.
    
    **CRITICAL REQUIREMENT:** 
    - Base your analysis ONLY on trends from the last 1-2 years (2023-2025). 
    - Consider recent factors like: The rise of GenAI tools (ChatGPT), Hybrid Work models, the current Talent Shortage (缺工潮), and Inflation/Salary stagnation issues.
    - Avoid outdated advice (pre-2022).

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
            title: { type: Type.STRING, description: "A catchy, click-baity title using SEO keywords" },
            description: { type: Type.STRING, description: "Why this group needs this course based on 2024-2025 trends" },
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
 * Updated for Taiwan "Dry Goods" (乾貨) style.
 */
export const generateLazyPackContent = async (course: CourseInfo, painPoint: PainPoint): Promise<SlideContent[]> => {
  const ai = getClient();

  const prompt = `
    Create content for a 5-slide Instagram/Facebook carousel (Lazy Pack/懶人包) for the Taiwan market (2024-2025 Context).
    
    Target Audience: ${painPoint.targetGroup}
    Theme: ${painPoint.title}
    SEO Keywords to inject: ${painPoint.seoKeywords.join(", ")}
    Course: ${course.title}
    
    Style Guide:
    - Use modern Taiwan social media slang (e.g., 必收, 乾貨, 焦慮, 救星, 懂的都懂).
    - Tone: Empathetic, fast-paced, "Helpful Peer" persona.
    - Structure:
      Slide 1: **Viral Cover**. High impact title with SEO keywords. (e.g., "2025轉職必看!", "AI時代履歷這樣寫").
      Slide 2: **The Current Pain**. Empathize with a specific struggle relevant to the last 12 months (e.g., "投了履歷卻被已讀不回?", "擔心被AI取代?").
      Slide 3: **The Insight**. Break a myth or provide a "Aha!" moment based on new market realities.
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
      Context: Current Taiwan Job Market (2024-2025).
      
      Target: ${painPoint.targetGroup}
      Topic: ${painPoint.title}
      Keywords: ${painPoint.seoKeywords.join(", ")}
      
      Format: JSON Array of scenes.
      
      Script Requirements:
      1. **0-3s Hook**: Must stop the scroll. Address a *current* specific pain point immediately (e.g., "Resume rejected by ATS?", "Salary stuck despite inflation?").
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

  // If a custom key is set, append it manually, otherwise assume process.env is injected or handled by fetch?
  // Actually, for download link, we need the key.
  const apiKey = customApiKey || process.env.API_KEY;
  return `${videoUri}&key=${apiKey}`;
};

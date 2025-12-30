import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { GeneratedFile } from "ai";

/**
 * Image Generation Service using Gemini API (Nanobanana)
 * Generates cover images for projects based on form data
 */

export interface ProjectFormData {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
}

/**
 * Generate a prompt for image generation based on project data
 */
export function generateImagePrompt(formData: ProjectFormData): string {
  const { title, shortDescription, fullDescription, category } = formData;

  // Determinar estilo basado en el contenido
  const content =
    `${title} ${shortDescription} ${fullDescription || ""}`.toLowerCase();

  let style = "modern and professional";
  if (
    content.includes("tech") ||
    content.includes("software") ||
    content.includes("app")
  ) {
    style = "futuristic tech with clean lines and vibrant colors";
  } else if (
    content.includes("art") ||
    content.includes("design") ||
    content.includes("creative")
  ) {
    style = "artistic and creative with bold colors";
  } else if (
    content.includes("social") ||
    content.includes("community") ||
    content.includes("people")
  ) {
    style = "warm and welcoming with diverse people";
  } else if (
    content.includes("eco") ||
    content.includes("green") ||
    content.includes("sustain")
  ) {
    style = "natural and eco-friendly with green tones";
  } else if (
    content.includes("finance") ||
    content.includes("business") ||
    content.includes("startup")
  ) {
    style = "professional business with modern aesthetics";
  }

  // Seleccionar aspect ratio aleatorio para masonry dinámico estilo Pinterest
  // Variedad de ratios para crear un grid visualmente interesante
  const aspectRatios = [
    { ratio: "2:3", description: "vertical portrait", weight: 3 },
    { ratio: "3:4", description: "tall portrait", weight: 3 },
    { ratio: "4:5", description: "Instagram portrait", weight: 2 },
    { ratio: "9:16", description: "mobile vertical (extra tall)", weight: 1 },
    { ratio: "1:1", description: "square", weight: 2 },
    { ratio: "5:4", description: "landscape", weight: 1 },
    { ratio: "3:2", description: "wide landscape", weight: 1 },
  ];

  // Weighted random selection para más variedad pero favoreciendo verticales
  const weightedRatios = aspectRatios.flatMap((r) => Array(r.weight).fill(r));
  const selectedRatio =
    weightedRatios[Math.floor(Math.random() * weightedRatios.length)];

  // Construir prompt optimizado para Pinterest-style
  const prompt = `Create a high-quality, professional cover image in ${selectedRatio.ratio} ${selectedRatio.description} format for a crowdfunding project titled "${title}".

PURPOSE: This image will be used as the cover/thumbnail for a crowdfunding campaign on a transparent donation platform built on Stellar blockchain. The goal is to attract donors and inspire people to support this cause.

Project Description: ${shortDescription}
${fullDescription ? `Additional Context: ${fullDescription.substring(0, 200)}` : ""}
${category ? `Category: ${category}` : ""}

Style: ${style}

Requirements:
- IMPORTANT: Generate the image in exactly ${selectedRatio.ratio} aspect ratio (${selectedRatio.description} orientation)
- This specific aspect ratio is intentional to create visual variety in a Pinterest-style masonry grid layout
- Pinterest-style aesthetic: visually striking and scroll-stopping
- High resolution and professional quality
- Strong composition optimized for the ${selectedRatio.description} format
- Eye-catching colors and compelling visual hierarchy
- No text or typography in the image
- Suitable for a crowdfunding/donation platform
- Modern, clean, and appealing design
- Should evoke trust, transparency, and social impact
- Must inspire generosity and community support

The image should be attention-grabbing and inspire people to donate to this project. This image will appear in a masonry grid alongside other project covers with different aspect ratios, so maintaining the exact ${selectedRatio.ratio} ratio is crucial for the dynamic visual layout. Think Pinterest board quality - beautiful, inspiring, and shareable. The visual should communicate the project's mission and make potential donors feel emotionally connected to the cause.`;

  return prompt;
}

/**
 * Generate image using Gemini API (Nanobanana) with AI SDK
 */
export async function generateImage(
  prompt: string,
): Promise<GeneratedFile | null> {
  const apiKey = process.env.NEXT_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  // Configurar el modelo con la API key
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

  const { files } = await generateText({
    model: google("gemini-2.5-flash-image"),
    prompt,
    providerOptions: {
      google: {
        responseModalities: ["IMAGE"],
      },
    },
  });

  return files[0] || null;
}

/**
 * Generate cover image for a project
 */
export async function generateProjectCover(
  formData: ProjectFormData,
): Promise<GeneratedFile | null> {
  const prompt = generateImagePrompt(formData);
  const imageFile = await generateImage(prompt);
  return imageFile;
}

/**
 * Generate image for a digital benefit/NFT based on benefit type and details
 */
export async function generateBenefitImage(
  title: string,
  description: string,
  benefitType?: string,
  minDonation?: number,
  totalSupply?: number,
): Promise<string | null> {
  // Map benefit types to visual concepts
  const typeStyles: Record<string, string> = {
    digital_product: "digital product icon or symbol (e.g., download icon, digital file, software icon)",
    physical_product: "product illustration or package design",
    service: "service icon or professional symbol (e.g., handshake, tools, consultation)",
    access: "access badge, VIP pass, or key symbol",
    experience: "event ticket or experience illustration",
    recognition: "award badge, medal, or certificate seal",
    discount: "discount coupon or promotional ticket design",
    other: "abstract symbol or icon representing the benefit"
  };

  const visualConcept = typeStyles[benefitType || 'digital_product'] || typeStyles.other;

  // Build dynamic prompt based on benefit details
  const prompt = `Create a professional POAP-style digital collectible image in 500x500px square format.

BENEFIT DETAILS:
- Title: ${title}
- Description: ${description}
- Type: ${benefitType || 'digital_product'}
${minDonation ? `- Minimum Donation: ${minDonation} USDC` : ''}
${totalSupply ? `- Limited Edition: ${totalSupply} available` : ''}

VISUAL CONCEPT:
This should look like a ${benefitType === 'experience' || benefitType === 'access' ? 'premium event ticket or VIP pass' : benefitType === 'recognition' ? 'award badge or achievement medal' : benefitType === 'discount' ? 'promotional coupon or discount voucher' : 'professional logo or brand badge'}.

The image should feature: ${visualConcept}

DESIGN REQUIREMENTS:
- Square format: 500x500px (POAP standard size)
- Clean, professional design suitable for a circular display
- Central focus: main icon/symbol should be in the center
- Consider circular framing: important elements should be within a central circle area
- Professional color palette (can use project colors if relevant)
- Modern, clean aesthetic
- NO text or typography in the image (title will be displayed separately)
- High contrast and clear visual hierarchy
- The design should work well when displayed in a circular frame (POAP style)
- Should clearly represent: ${description}

STYLE GUIDELINES:
- Think of this as a collectible badge or commemorative token
- Professional and premium feel
- Clear, recognizable iconography
- Suitable for display in a crypto wallet or NFT gallery
- Should be instantly recognizable and memorable
- Design should communicate the value and exclusivity of the benefit

The image will be displayed as a circular POAP in donor wallets and should be visually striking and professional. Focus on creating a clean, iconic design that represents the specific benefit being offered.`;

  const imageFile = await generateImage(prompt);
  
  if (!imageFile) {
    return null;
  }
  
  // GeneratedFile contains the base64 data
  // Return the base64 data URL (imageFile has contentType and base64 properties)
  return `data:image/png;base64,${(imageFile as any).base64}`;
}

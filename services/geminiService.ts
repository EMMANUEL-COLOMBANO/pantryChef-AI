
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  // The UI doesn't allow entering a key, so this is just for preventing a hard crash.
  console.warn("API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipes: {
            type: Type.ARRAY,
            description: "A list of 2-3 generated recipes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    recipeName: {
                        type: Type.STRING,
                        description: "The name of the recipe."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief, enticing description of the dish."
                    },
                    ingredients: {
                        type: Type.ARRAY,
                        description: "A list of all ingredients required for the recipe.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                    description: "The name of the ingredient."
                                },
                                quantity: {
                                    type: Type.STRING,
                                    description: "The amount of the ingredient needed, e.g., '1 cup', '2 tbsp'."
                                },
                                userHas: {
                                    type: Type.STRING,
                                    description: "A string, either 'true' or 'false', indicating if the ingredient was in the user's provided list."
                                }
                            },
                             required: ['name', 'quantity', 'userHas']
                        }
                    },
                    instructions: {
                        type: Type.ARRAY,
                        description: "Step-by-step instructions to prepare the dish.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ['recipeName', 'description', 'ingredients', 'instructions']
            }
        }
    },
    required: ['recipes']
};


export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  if (!API_KEY) {
      throw new Error("API key is not configured.");
  }

  const prompt = `You are a creative chef specializing in resourceful cooking. Based on the ingredients I have available: ${ingredients.join(', ')}, generate up to 3 distinct and delicious recipes.

**Crucial rule:** Do not add any major new ingredients like meat (beef, pork), poultry (chicken, turkey), or fish unless they are explicitly in the list I provided. You may only supplement with common pantry staples like salt, pepper, oil, flour, sugar, and basic spices.

For each recipe, provide a name, a brief description, a complete list of all ingredients with quantities, and step-by-step instructions. It is vital to accurately identify which ingredients I already possess from the provided list by setting 'userHas' to the string 'true' for them, and 'false' otherwise.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            temperature: 0.7,
        },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }
    
    const parsedResponse = JSON.parse(jsonText);
    
    if (parsedResponse && Array.isArray(parsedResponse.recipes)) {
        // Manually convert userHas from string to boolean to match the Recipe type
        const recipesWithBooleans: Recipe[] = parsedResponse.recipes.map((recipe: any) => ({
            ...recipe,
            ingredients: recipe.ingredients.map((ing: any) => ({
                ...ing,
                userHas: ing.userHas === 'true' || ing.userHas === true // Handle both string and potential boolean
            }))
        }));
        return recipesWithBooleans;
    } else {
        throw new Error("Invalid response format from API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the original error to be handled by the calling component
    throw error;
  }
};


import React, { useState, useCallback } from 'react';
import type { Recipe } from './types';
import { generateRecipes } from './services/geminiService';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';
import { ChefHatIcon } from './components/icons/ChefHatIcon';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Tomatoes', 'Chicken Breast', 'Garlic']);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const generatedRecipes = await generateRecipes(ingredients);
      setRecipes(generatedRecipes);
    } catch (err) {
      console.error(err);
      let errorMessage = 'An error occurred while generating recipes.';
      if (err instanceof Error) {
        // Provide a more user-friendly message for common network errors
        if (err.message.toLowerCase().includes('network') || err.message.includes('xhr error') || err.message.includes('fetch')) {
          errorMessage = 'A network error occurred. Please check your connection and try again.';
        } else {
          errorMessage = `Failed to generate recipes: ${err.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChefHatIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">PantryChef AI</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Ingredients</h2>
            <p className="text-sm text-gray-500 mb-6">Add the ingredients you have on hand, and our AI will create recipes for you.</p>
            <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
            <button
              onClick={handleGenerateRecipes}
              disabled={isLoading || ingredients.length === 0}
              className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? <LoadingSpinner /> : <span>Generate Recipes</span>}
            </button>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && recipes.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-xl shadow-lg h-full">
                <ChefHatIcon className="h-24 w-24 text-gray-300 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-600">Ready to cook?</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Add your ingredients on the left and click "Generate Recipes" to discover what you can make!
                </p>
              </div>
            )}
            
            {isLoading && recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-xl shadow-lg h-full">
                     <LoadingSpinner />
                     <p className="text-gray-500 mt-4 animate-pulse">Generating delicious ideas...</p>
                </div>
            )}

            {recipes.length > 0 && (
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800">Recipe Suggestions</h2>
                {recipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm mt-8">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;

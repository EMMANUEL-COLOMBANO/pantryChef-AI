
import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface IngredientInputProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddIngredient = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !ingredients.some(ing => ing.toLowerCase() === trimmedValue.toLowerCase())) {
      setIngredients([...ingredients, trimmedValue]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  return (
    <div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Flour, Eggs, Sugar"
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        <button
          onClick={handleAddIngredient}
          className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full animate-fade-in"
          >
            <span>{ingredient}</span>
            <button
              onClick={() => handleRemoveIngredient(ingredient)}
              className="ml-2 text-green-600 hover:text-green-800"
              aria-label={`Remove ${ingredient}`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientInput;

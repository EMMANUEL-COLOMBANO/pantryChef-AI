
export interface Ingredient {
  name: string;
  quantity: string;
  userHas: boolean;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
}

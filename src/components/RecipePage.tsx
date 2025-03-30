import React, { useState, useEffect } from 'react';
import './RecipePage.css'; // Import the CSS for styling

// Fetch recipes from Spoonacular API
const fetchRecipes = async (ingredients: string[]) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&apiKey=a98bbf28eb024fef9e8f265dd50f424c`);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
};

// Fetch ingredients from your /api/inventory endpoint
const fetchIngredients = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch ingredients');
        const data = await response.json();
        return data.map((ingredient: any) => ingredient.name); // Assuming 'name' is the column with ingredient names
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return ['tomato', 'cheese', 'basil']; // Fallback in case of error
    }
};

// Recipe page component
const RecipePage = () => {
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);

    // Fetch ingredients from the /api/inventory endpoint when the component mounts
    useEffect(() => {
        const getIngredients = async () => {
            const ingredientsFromDB = await fetchIngredients();
            setIngredients(ingredientsFromDB);
        };

        getIngredients();
    }, []); // Empty array to only run once when the component mounts

    console.log(ingredients)
    // Fetch recipes from Spoonacular based on ingredients
    const generateRecipes = async () => {
        if (ingredients.length > 0) {
            const recipeData = await fetchRecipes(ingredients);
            setRecipes(recipeData);
        }
    };

    // Handle recipe card click to display full details
    const handleRecipeClick = async (recipeId: number) => {
        // Fetch detailed recipe including instructions from Spoonacular
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=a98bbf28eb024fef9e8f265dd50f424c`);
        const recipeDetails = await response.json();
        setSelectedRecipe(recipeDetails);
    };

    return (
        <div className="recipe-page">
            <h1 className="page-title">Recipe Generator</h1>
            <div className="input-container">
                <button className="generate-button" onClick={generateRecipes}>
                    Generate Recipes
                </button>
            </div>

            <div className="recipes-list">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="recipe-card"
                        onClick={() => handleRecipeClick(recipe.id)}
                    >
                        <img src={`https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`} alt={recipe.title} className="recipe-image" />
                        <div className="recipe-card-content">
                            <h3 className="recipe-card-title">{recipe.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRecipe && (
                <div className="recipe-details">
                    <h2 className="recipe-details-title">{selectedRecipe.title}</h2>
                    <div className="recipe-detail-header">
                        <div>
                            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="recipe-detail-image mx-auto" />
                        </div>
                        <div className="ingredients">
                            <h3>Ingredients:</h3>
                            <ul>
                                {selectedRecipe.extendedIngredients?.length ? (
                                    selectedRecipe.extendedIngredients.map((ingredient: any) => (
                                        <li key={ingredient.id} className="ingredient-item">
                                            {ingredient.originalName}
                                        </li>
                                    ))
                                ) : (
                                    <p>No ingredients available</p>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="instructions">
                        <h3>Instructions:</h3>
                        <div
                            className="instructions-text"
                            dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipePage;

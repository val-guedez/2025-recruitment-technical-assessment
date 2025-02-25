import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  type: string;
  name: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface cookbook {
  recipes: recipe[];
  ingredients: ingredient[];
}

interface recipeSummary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
}

enum Item {
  Ingredient = 1,
  Recipe,
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: cookbook = {recipes: [], ingredients: []};

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  recipeName = recipeName.replace(/[-_]/g, " ");
  recipeName = recipeName.replace(/[^a-z\s]/gi, "");
  
  recipeName = recipeName.replace(/\s\s+/g, " ");
  recipeName = recipeName.replace(/^\s/, "");
  recipeName = recipeName.replace(/\s$/, "");

  if (recipeName.length <= 0) return null;

  recipeName = capitaliseWords(recipeName);

  return recipeName;
}

const capitaliseWords = (chosenString: string) : string => {
  chosenString = chosenString.toLowerCase();
  let words = chosenString.split(" ");
  let arr: string[] = [];

  for (const word of words) {
    const capital = word.charAt(0).toUpperCase();
    arr.push(capital + word.slice(1));
  }

  chosenString = arr.join(" ");
  return chosenString;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {    
  if (req.body.type === "recipe") {
    try {
      addRecipeEntry(req.body);
    } catch (error) {
      res.status(400).json({ error: error.name });
      return;
    }
    res.json({}); 
    return;
  } 
  
  if (req.body.type === "ingredient") {
    try {
      addIngredientEntry(req.body);
    } catch (error) {
      res.status(400).json({ error: error.name });
      return;
    }
    res.json({});
    return;
  }

  res.status(400).json({ Error: "Invalid type" });
  return;
});

const addRecipeEntry = (entry: recipe) => {
  if (!isUnique(entry.name)) throw new Error("Entry name must be unique");

  // Recipe requiredItems can only have one element per name.
  const temp = [...entry.requiredItems];
  if (temp.filter((element, index) => index !== temp.indexOf(element)).length > 0) {
    throw new Error("requiredItems can have only one element per name");
  }
  cookbook.recipes.push(entry);
}

const isUnique = (entryName: string): boolean => {
  if (cookbook.ingredients.find((ingredient) => 
    ingredient.name === entryName) !== undefined
  ) {
    return false;
  }
  
  if (cookbook.recipes.find((recipe) => 
    recipe.name === entryName) !== undefined
  ) {
    return false;
  }

  return true;
}

const addIngredientEntry = (entry: ingredient) => {
  // cookTime can only be greater than or equal to 0 & entry names must be unique
  if (entry.cookTime < 0) throw new Error("Cooktime must be >= 0");

  if (!isUnique(entry.name)) throw new Error("Entry name must be unique");

  cookbook.ingredients.push(entry);
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const recipeName = req.query.name as string;
  const recipe = cookbook.recipes.find((recipe) => recipe.name === recipeName);

  if (recipe === undefined) {
    res.status(400).json({ error: "Recipe not found in cookbook / is an ingredient / cookbook is empty" });
    return;
  }

  // Initialising recipe summary
  let recipeSummary: recipeSummary = {name: recipeName,
    cookTime: 0,
    ingredients: []
  };

  try {
    summariseRecipe(recipe, recipeSummary);
  } catch (error) {
    res.status(400).json({error: error.message});
    return;
  }
  
  res.json(recipeSummary);
});

const summariseRecipe = (recipe: recipe, recipeSummary: recipeSummary) => {
  for (const requiredItem of recipe.requiredItems) {
    // Ingredient
    const requiredIngredient = cookbook.ingredients.find((ingredient) => ingredient.name === requiredItem.name);
    // Required item is an ingredient
    if (requiredIngredient !== undefined) {
      recipeSummary.cookTime += requiredIngredient.cookTime; // Update cooking time

      // Search recipeSummary if ingredient has already been added, increment quantity property
      const summaryIndex = recipeSummary.ingredients.findIndex((ingredient) => ingredient.name === requiredIngredient.name);
      if (summaryIndex !== -1) {
        recipeSummary.ingredients[summaryIndex].quantity += requiredItem.quantity;
      } else {
        recipeSummary.ingredients.push({name: requiredIngredient.name, quantity: requiredItem.quantity});
      }
      continue;
    }

    // Recipe
    const requiredRecipe = cookbook.recipes.find((bookRecipe) => bookRecipe.name === requiredItem.name);
    if (requiredRecipe !== undefined) {
      // Recursion
      summariseRecipe(requiredRecipe, recipeSummary);
      continue;
    }

    // Not in cookbook
    throw new Error("This ingredient or recipe is not in the cookbook");
  }
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});

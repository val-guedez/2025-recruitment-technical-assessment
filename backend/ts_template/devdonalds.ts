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

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: cookbook = { recipes: [], ingredients: [] };

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

// Capitalises the first letter of each word in the given string
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
  try {
    addCookbookEntry(req.body.type, req);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({});
  return;
});

// Attempts to add requested cookbook entry, calling relevant helper
const addCookbookEntry = (entryType: string, req: Request) => {
  if (entryType === "recipe") {
    addRecipeEntry(req.body);
  } else if (entryType === "ingredient") {
    addIngredientEntry(req.body);
  } else {
    throw new Error("Type must be recipe or ingredient");
  }
}

// Attempts to add given recipe to cookbook
const addRecipeEntry = (entry: recipe) => {
  if (!isUnique(entry.name)) throw new Error("Entry name must be unique");

  for (const item of entry.requiredItems) {
    for (const potentialDup of entry.requiredItems) {
      if (item.name === potentialDup.name
        && entry.requiredItems.indexOf(item) !== entry.requiredItems.indexOf(potentialDup)
      ) {
        throw new Error("requiredItems can have only one element per name");
      }
    }
  }
  cookbook.recipes.push(entry);
}

// Returns true if given entry name is not in cookbook, false otherwise
const isUnique = (entryName: string): boolean => {
  if (cookbook.ingredients.find((ingredient) => ingredient.name === entryName) !== undefined) {
    return false;
  }
  
  if (cookbook.recipes.find((recipe) => 
    recipe.name === entryName) !== undefined
  ) {
    return false;
  }

  return true;
}

// Attempts to add given ingredient to cookbook
const addIngredientEntry = (entry: ingredient) => {
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
    res.status(400).json(
      { error: "Recipe not found in cookbook / Not a recipe / Cookbook is empty" }
    );
    return;
  }

  let recipeSummary: recipeSummary = {name: recipeName,
    cookTime: 0,
    ingredients: []
  };

  try {
    summariseRecipe(recipe, recipeSummary, 1);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  
  res.json(recipeSummary);
});

// Attempts to fill given recipe summary from the relevant given recipe
const summariseRecipe = (recipe: recipe, recipeSummary: recipeSummary, recipeQuantity: number) => {
  for (const requiredItem of recipe.requiredItems) {
    const requiredIngredient = cookbook.ingredients.find(
      (ingredient) => ingredient.name === requiredItem.name
    );

    if (requiredIngredient !== undefined) {
      addIngredientSummary(requiredItem.quantity, requiredIngredient, recipeSummary, recipeQuantity);
      continue;
    }

    const requiredRecipe = cookbook.recipes.find(
      (bookRecipe) => bookRecipe.name === requiredItem.name
    );

    if (requiredRecipe !== undefined) {
      summariseRecipe(requiredRecipe, recipeSummary, requiredItem.quantity);
      continue;
    }

    throw new Error("This ingredient or recipe is not in the cookbook");
  }
}

// Attempts to add or modify the given required ingredient entry to the recipe summary
const addIngredientSummary = (
  ingredientQuantity: number, requiredIngredient: ingredient,
  recipeSummary: recipeSummary, recipeQuantity: number
) => {
  if (ingredientQuantity <= 0) {
    throw new Error("Quantity of requiredItem must be greater than 0");
  }
  recipeSummary.cookTime += requiredIngredient.cookTime * ingredientQuantity * recipeQuantity;

  const summaryIndex = recipeSummary.ingredients.findIndex(
    (ingredient) => ingredient.name === requiredIngredient.name
  );
  if (summaryIndex !== -1) {
    recipeSummary.ingredients[summaryIndex].quantity += ingredientQuantity * recipeQuantity;
  } else {
    recipeSummary.ingredients.push(
      { name: requiredIngredient.name,
        quantity: ingredientQuantity * recipeQuantity
      });
  }
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});

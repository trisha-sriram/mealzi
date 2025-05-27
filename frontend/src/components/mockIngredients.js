const mockIngredients = [
  { name: "Almond", unit: "g", description: "Raw almond.", calories_per_unit: 7, protein_per_unit: 0.3, fat_per_unit: 0.6, carbs_per_unit: 0.2, sugar_per_unit: 0.1, fiber_per_unit: 0.2, sodium_per_unit: 1 },
  { name: "Apple", unit: "piece", description: "Red apple.", calories_per_unit: 95, protein_per_unit: 0.5, fat_per_unit: 0.3, carbs_per_unit: 25, sugar_per_unit: 19, fiber_per_unit: 4.4, sodium_per_unit: 2 },
  { name: "Apricot", unit: "piece", description: "Dried apricot.", calories_per_unit: 17, protein_per_unit: 0.5, fat_per_unit: 0.1, carbs_per_unit: 4, sugar_per_unit: 3.2, fiber_per_unit: 0.7, sodium_per_unit: 1 },
  { name: "Avocado", unit: "piece", description: "Hass avocado.", calories_per_unit: 240, protein_per_unit: 3, fat_per_unit: 22, carbs_per_unit: 12, sugar_per_unit: 0.2, fiber_per_unit: 10, sodium_per_unit: 10 },
  { name: "Artichoke", unit: "piece", description: "Boiled artichoke.", calories_per_unit: 60, protein_per_unit: 4, fat_per_unit: 0.2, carbs_per_unit: 13, sugar_per_unit: 1, fiber_per_unit: 7, sodium_per_unit: 120 },
  { name: "Asparagus", unit: "cup", description: "Steamed asparagus.", calories_per_unit: 27, protein_per_unit: 3, fat_per_unit: 0.2, carbs_per_unit: 5, sugar_per_unit: 2, fiber_per_unit: 2.8, sodium_per_unit: 2 },
  { name: "Carrot", unit: "piece", description: "Fresh carrot.", calories_per_unit: 25, protein_per_unit: 0.6, fat_per_unit: 0.1, carbs_per_unit: 6, sugar_per_unit: 2.9, fiber_per_unit: 1.7, sodium_per_unit: 50 },
  { name: "Cabbage", unit: "cup", description: "Chopped cabbage.", calories_per_unit: 22, protein_per_unit: 1, fat_per_unit: 0.1, carbs_per_unit: 5, sugar_per_unit: 2.8, fiber_per_unit: 2.2, sodium_per_unit: 18 },
  { name: "Cauliflower", unit: "cup", description: "Chopped cauliflower.", calories_per_unit: 25, protein_per_unit: 2, fat_per_unit: 0.3, carbs_per_unit: 5, sugar_per_unit: 2, fiber_per_unit: 2.1, sodium_per_unit: 30 },
  { name: "Celery", unit: "stalk", description: "Celery stalk.", calories_per_unit: 6, protein_per_unit: 0.3, fat_per_unit: 0.1, carbs_per_unit: 1.2, sugar_per_unit: 0.5, fiber_per_unit: 0.6, sodium_per_unit: 35 },
  { name: "Cheddar Cheese", unit: "slice", description: "Cheddar slice.", calories_per_unit: 113, protein_per_unit: 7, fat_per_unit: 9, carbs_per_unit: 0.4, sugar_per_unit: 0.1, fiber_per_unit: 0, sodium_per_unit: 174 },
  { name: "Chickpeas", unit: "cup", description: "Boiled chickpeas.", calories_per_unit: 269, protein_per_unit: 14.5, fat_per_unit: 4.2, carbs_per_unit: 45, sugar_per_unit: 7.9, fiber_per_unit: 12.5, sodium_per_unit: 11 },
  { name: "Chili Pepper", unit: "piece", description: "Red chili pepper.", calories_per_unit: 18, protein_per_unit: 0.8, fat_per_unit: 0.2, carbs_per_unit: 4, sugar_per_unit: 2.4, fiber_per_unit: 1.5, sodium_per_unit: 3 },
  { name: "Egg", unit: "piece", description: "Whole egg.", calories_per_unit: 70, protein_per_unit: 6, fat_per_unit: 5, carbs_per_unit: 1, sugar_per_unit: 0.5, fiber_per_unit: 0, sodium_per_unit: 70 },
  { name: "Spinach", unit: "cup", description: "Raw spinach.", calories_per_unit: 7, protein_per_unit: 0.9, fat_per_unit: 0.1, carbs_per_unit: 1.1, sugar_per_unit: 0.1, fiber_per_unit: 0.7, sodium_per_unit: 24 },
  { name: "Garlic", unit: "clove", description: "Garlic clove.", calories_per_unit: 4, protein_per_unit: 0.2, fat_per_unit: 0, carbs_per_unit: 1, sugar_per_unit: 0.03, fiber_per_unit: 0.1, sodium_per_unit: 1 },
  { name: "Blueberry", unit: "cup", description: "Fresh blueberries.", calories_per_unit: 84, protein_per_unit: 1.1, fat_per_unit: 0.5, carbs_per_unit: 21, sugar_per_unit: 15, fiber_per_unit: 3.6, sodium_per_unit: 1 },
  { name: "Beet", unit: "piece", description: "Boiled beetroot.", calories_per_unit: 35, protein_per_unit: 1.3, fat_per_unit: 0.1, carbs_per_unit: 8, sugar_per_unit: 6.8, fiber_per_unit: 2.0, sodium_per_unit: 65 },
  { name: "Lettuce", unit: "cup", description: "Shredded lettuce.", calories_per_unit: 5, protein_per_unit: 0.5, fat_per_unit: 0.1, carbs_per_unit: 1, sugar_per_unit: 0.5, fiber_per_unit: 0.5, sodium_per_unit: 10 },
  { name: "Tomato", unit: "piece", description: "Red tomato.", calories_per_unit: 22, protein_per_unit: 1.1, fat_per_unit: 0.2, carbs_per_unit: 5, sugar_per_unit: 3.2, fiber_per_unit: 1.5, sodium_per_unit: 6 },
  { name: "Mushroom", unit: "cup", description: "Sliced white mushroom.", calories_per_unit: 15, protein_per_unit: 2.2, fat_per_unit: 0.2, carbs_per_unit: 2.3, sugar_per_unit: 1.2, fiber_per_unit: 0.7, sodium_per_unit: 4 }
];

export default mockIngredients;


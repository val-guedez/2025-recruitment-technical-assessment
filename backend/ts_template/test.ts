const parse_handwriting = (recipeName: string): string | null => {
  recipeName = recipeName.replace(/[-_]/g, " "); // Replaces - and _ with whitespace
    
  recipeName = recipeName.replace(/[^a-z\s]/gi, ""); // Removes anything that isn't a letter or whitespace
  
  recipeName = recipeName.replace(/\s\s+/g, " "); // Replaces multiple whitespaces
  recipeName = recipeName.replace(/^\s/, ""); // Removes leading whitespace
  recipeName = recipeName.replace(/\s$/, ""); // Removes trailing whitespace 

  recipeName = recipeName.toLowerCase();
  let words = recipeName.split(" "); // Capitalises the first letter of each word
  let temp: string[] = [];
  for (const word of words) {
    const capital = word.charAt(0).toUpperCase();
    temp.push(capital + word.slice(1));
  }
  recipeName = temp.join(" ");
  
  if (recipeName.length <= 0) return null;
  
  return recipeName;
}

console.log(parse_handwriting("sk1bbiddy_to-ilet"));
console.log(parse_handwriting("    sk1bbiddy_to-ilet   "));
console.log(parse_handwriting("SKIBBIDDY_TOILET"));
console.log(parse_handwriting("sk1bb$ddy_t@-il7t"));
console.log(parse_handwriting("----sK1bb1dDy__t$-il3t----"));
console.log(parse_handwriting("11111111111"));
console.log(parse_handwriting("1----1-----1"));
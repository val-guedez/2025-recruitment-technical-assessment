var parse_handwriting = function (recipeName) {
    console.log("New word: " + recipeName);
    recipeName = recipeName.replace(/[-_]/g, " "); // Replaces - and _ with whitespace
    console.log(recipeName);
    recipeName = recipeName.replace(/[^a-z\s]/gi, ""); // Removes anything that isn't a letter or whitespace
    console.log(recipeName);
    recipeName = recipeName.replace(/\s\s+/g, " "); // Replaces multiple whitespaces
    recipeName = recipeName.replace(/^\s/, ""); // Removes leading whitespace
    recipeName = recipeName.replace(/\s$/, ""); // Removes trailing whitespace 
    console.log(recipeName);
    recipeName = recipeName.toLowerCase();
    var words = recipeName.split(" "); // Capitalises the first letter of each word
    console.log(words);
    var temp = [];
    for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
        var word = words_1[_i];
        var capital = word.charAt(0).toUpperCase();
        temp.push(capital + word.slice(1));
    }
    recipeName = temp.join(" ");
    if (recipeName.length <= 0)
        return null;
    return recipeName;
};
console.log(parse_handwriting("sk1bbiddy_to-ilet"));
console.log(parse_handwriting("    sk1bbiddy_to-ilet   "));
console.log(parse_handwriting("SKIBBIDDY_TOILET"));
console.log(parse_handwriting("sk1bb$ddy_t@-il7t"));
console.log(parse_handwriting("----sK1bb1dDy__t$-il3t----"));
console.log(parse_handwriting("11111111111"));
console.log(parse_handwriting("1----1-----1"));

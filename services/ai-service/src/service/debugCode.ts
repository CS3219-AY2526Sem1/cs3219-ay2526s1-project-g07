import type { GoogleGenAI } from "@google/genai";
import { MODEL_FLASH_PREVIEW } from "../constants/model.js";
import { AI_DEBUG_SYSTEM_PROMPT } from "../constants/prompt.js";

const dummyQuestion = `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with \`O(1)\` extra memory.

---
**Example 1:**
**Input**: \`s = ["h","e","l","l","o"]\`
**Output**: \`["o","l","l","e","h"]\`

**Example 2:**
**Input**: \`s = ["H","a","n","n","a","h"]\`
**Output**: \`["h","a","n","n","a","H"]\`

---

**Constraints:**
*   \`1 <= s.length <= 10^5\`
*   \`s[i]\` is a printable ASCII character.
`;

const dummyCode = `
def reverseString(s):
    left, right = 0, len(s) - 1
    while left <= right:
        s[left], s[right] = s[right], s[left]
        left += 1
    return s

print(reverseString(["h","e","l","l","o"]))
`;

const dummyOutput = `
['o', 'h', 'e', 'l', 'l']

Execution completed
[Finished in 0.026s]
`;

async function debugCode(
  ai: GoogleGenAI,
  question: string = dummyQuestion,
  code: string = dummyCode,
  output: string = dummyOutput
) {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH_PREVIEW,
    config: {
      thinkingConfig: {
        thinkingBudget: 768,
      },
      systemInstruction: AI_DEBUG_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `## Question\n\n${question}`,
          },
          {
            text: `## Code\n\n\`\`\`py\n${code}\n\`\`\``,
          },
          {
            text: `## Output\n\n${output}`,
          },
        ],
      },
    ],
  });

  // Remove LaTeX formatting if any
  return response.text?.replaceAll("$", "");
}

export default debugCode;

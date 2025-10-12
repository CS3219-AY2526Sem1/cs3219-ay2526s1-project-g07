import type { GoogleGenAI } from "@google/genai";
import { MODEL_FLASH_PREVIEW } from "../constants/model.js";
import { AI_HINT_SYSTEM_PROMPT } from "../constants/prompt.js";

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

async function getHint(ai: GoogleGenAI, question: string = dummyQuestion) {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH_PREVIEW,
    config: {
      thinkingConfig: {
        thinkingBudget: 768,
      },
      systemInstruction: AI_HINT_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: question,
          },
        ],
      },
    ],
  });
  return response.text;
}

export default getHint;

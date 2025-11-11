-- Clean and reseed LeetCode questions into the database

-- First, clean the existing questions
DELETE FROM "question";

-- Easy Questions
INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('two-sum', 'Two Sum', 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

## Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

## Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.', 'Easy', ARRAY['Array', 'Hash Table']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('valid-parentheses', 'Valid Parentheses', 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Example 1:
```
Input: s = "()"
Output: true
```

## Example 2:
```
Input: s = "()[]{}"
Output: true
```

## Example 3:
```
Input: s = "(]"
Output: false
```

## Constraints:
- 1 <= s.length <= 10^4
- s consists of parentheses only ''()[]{}''', 'Easy', ARRAY['String', 'Stack']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'You are given the heads of two sorted linked lists `list1` and `list2`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

## Example 1:
```
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
```

## Example 2:
```
Input: list1 = [], list2 = []
Output: []
```

## Example 3:
```
Input: list1 = [], list2 = [0]
Output: [0]
```

## Constraints:
- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.', 'Easy', ARRAY['Linked List', 'Recursion']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

## Example 1:
```
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
```

## Example 2:
```
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
```

## Constraints:
- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4', 'Easy', ARRAY['Array', 'Dynamic Programming']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('valid-palindrome', 'Valid Palindrome', 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

## Example 1:
```
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
```

## Example 2:
```
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
```

## Example 3:
```
Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.
```

## Constraints:
- 1 <= s.length <= 2 * 10^5
- s consists only of printable ASCII characters.', 'Easy', ARRAY['String', 'Two Pointers']);

-- Medium Questions
INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('add-two-numbers', 'Add Two Numbers', 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

## Example 1:
```
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
```

## Example 2:
```
Input: l1 = [0], l2 = [0]
Output: [0]
```

## Example 3:
```
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
```

## Constraints:
- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.', 'Medium', ARRAY['Linked List', 'Math', 'Recursion']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('longest-substring-without-repeating', 'Longest Substring Without Repeating Characters', 'Given a string `s`, find the length of the longest substring without repeating characters.

## Example 1:
```
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
```

## Example 2:
```
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
```

## Example 3:
```
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
```

## Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.', 'Medium', ARRAY['String', 'Hash Table', 'Sliding Window']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('container-with-most-water', 'Container With Most Water', 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

## Example 1:
```
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.
```

## Example 2:
```
Input: height = [1,1]
Output: 1
```

## Constraints:
- n == height.length
- 2 <= n <= 10^5
- 0 <= height[i] <= 10^4', 'Medium', ARRAY['Array', 'Two Pointers', 'Greedy']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('3sum', '3Sum', 'Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

## Example 1:
```
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
```

## Example 2:
```
Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.
```

## Example 3:
```
Input: nums = [0,0,0]
Output: [[0,0,0]]
```

## Constraints:
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5', 'Medium', ARRAY['Array', 'Two Pointers', 'Sorting']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('group-anagrams', 'Group Anagrams', 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

## Example 1:
```
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
```

## Example 2:
```
Input: strs = [""]
Output: [[""]]
```

## Example 3:
```
Input: strs = ["a"]
Output: [["a"]]
```

## Constraints:
- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters.', 'Medium', ARRAY['Array', 'Hash Table', 'String', 'Sorting']);

-- Hard Questions
INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

## Example 1:
```
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
```

## Example 2:
```
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
```

## Constraints:
- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -10^6 <= nums1[i], nums2[i] <= 10^6', 'Hard', ARRAY['Array', 'Binary Search', 'Divide and Conquer']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('merge-k-sorted-lists', 'Merge k Sorted Lists', 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

## Example 1:
```
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
```

## Example 2:
```
Input: lists = []
Output: []
```

## Example 3:
```
Input: lists = [[]]
Output: []
```

## Constraints:
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order.
- The sum of lists[i].length will not exceed 10^4.', 'Hard', ARRAY['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('trapping-rain-water', 'Trapping Rain Water', 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

## Example 1:
```
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.
```

## Example 2:
```
Input: height = [4,2,0,3,2,5]
Output: 9
```

## Constraints:
- n == height.length
- 1 <= n <= 2 * 10^4
- 0 <= height[i] <= 10^5', 'Hard', ARRAY['Array', 'Two Pointers', 'Dynamic Programming', 'Stack']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('reverse-nodes-in-k-group', 'Reverse Nodes in k-Group', 'Given the head of a linked list, reverse the nodes of the list `k` at a time, and return the modified list.

`k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.

You may not alter the values in the list''s nodes, only nodes themselves may be changed.

## Example 1:
```
Input: head = [1,2,3,4,5], k = 2
Output: [2,1,4,3,5]
```

## Example 2:
```
Input: head = [1,2,3,4,5], k = 3
Output: [3,2,1,4,5]
```

## Constraints:
- The number of nodes in the list is n.
- 1 <= k <= n <= 5000
- 0 <= Node.val <= 1000', 'Hard', ARRAY['Linked List', 'Recursion']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('longest-valid-parentheses', 'Longest Valid Parentheses', 'Given a string containing just the characters `(` and `)`, return the length of the longest valid (well-formed) parentheses substring.

## Example 1:
```
Input: s = "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()".
```

## Example 2:
```
Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()".
```

## Example 3:
```
Input: s = ""
Output: 0
```

## Constraints:
- 0 <= s.length <= 3 * 10^4
- s[i] is `(`, or `)`.', 'Hard', ARRAY['String', 'Dynamic Programming', 'Stack']);

-- More Easy Questions
INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('reverse-linked-list', 'Reverse Linked List', 'Given the head of a singly linked list, reverse the list, and return the reversed list.

## Example 1:
```
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

## Example 2:
```
Input: head = [1,2]
Output: [2,1]
```

## Example 3:
```
Input: head = []
Output: []
```

## Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000', 'Easy', ARRAY['Linked List', 'Recursion']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('maximum-subarray', 'Maximum Subarray', 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.

## Example 1:
```
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
```

## Example 2:
```
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
```

## Example 3:
```
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
```

## Constraints:
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4', 'Easy', ARRAY['Array', 'Divide and Conquer', 'Dynamic Programming']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('climbing-stairs', 'Climbing Stairs', 'You are climbing a staircase. It takes `n` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

## Example 1:
```
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
```

## Example 2:
```
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
```

## Constraints:
- 1 <= n <= 45', 'Easy', ARRAY['Math', 'Dynamic Programming']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('binary-tree-inorder-traversal', 'Binary Tree Inorder Traversal', 'Given the root of a binary tree, return the inorder traversal of its nodes'' values.

## Example 1:
```
Input: root = [1,null,2,3]
Output: [1,3,2]
```

## Example 2:
```
Input: root = []
Output: []
```

## Example 3:
```
Input: root = [1]
Output: [1]
```

## Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100', 'Easy', ARRAY['Stack', 'Tree', 'Depth-First Search', 'Binary Tree']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('symmetric-tree', 'Symmetric Tree', 'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

## Example 1:
```
Input: root = [1,2,2,3,4,4,3]
Output: true
```

## Example 2:
```
Input: root = [1,2,2,null,3,null,3]
Output: false
```

## Constraints:
- The number of nodes in the tree is in the range [1, 1000].
- -100 <= Node.val <= 100', 'Easy', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']);

-- More Medium Questions
INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Given the root of a binary tree, return the level order traversal of its nodes'' values. (i.e., from left to right, level by level).

## Example 1:
```
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
```

## Example 2:
```
Input: root = [1]
Output: [[1]]
```

## Example 3:
```
Input: root = []
Output: []
```

## Constraints:
- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000', 'Medium', ARRAY['Tree', 'Breadth-First Search', 'Binary Tree']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('validate-binary-search-tree', 'Validate Binary Search Tree', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node''s key.
- The right subtree of a node contains only nodes with keys greater than the node''s key.
- Both the left and right subtrees must also be binary search trees.

## Example 1:
```
Input: root = [2,1,3]
Output: true
```

## Example 2:
```
Input: root = [5,1,4,null,null,3,6]
Output: false
Explanation: The root node''s value is 5 but its right child''s value is 4.
```

## Constraints:
- The number of nodes in the tree is in the range [1, 10^4].
- -2^31 <= Node.val <= 2^31 - 1', 'Medium', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('word-search', 'Word Search', 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

## Example 1:
```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
```

## Example 2:
```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
Output: true
```

## Example 3:
```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"
Output: false
```

## Constraints:
- m == board.length
- n = board[i].length
- 1 <= m, n <= 6
- 1 <= word.length <= 15
- board and word consists of only lowercase and uppercase English letters.', 'Medium', ARRAY['Array', 'Backtracking', 'Matrix']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('number-of-islands', 'Number of Islands', 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

## Example 1:
```
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1
```

## Example 2:
```
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
```

## Constraints:
- m == grid.length
- n == grid[i].length
- 1 <= m, n <= 300
- grid[i][j] is `0` or `1`.', 'Medium', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix']);

INSERT INTO "question" ("id", "title", "question", "difficulty", "topics") VALUES
('coin-change', 'Coin Change', 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.

You may assume that you have an infinite number of each kind of coin.

## Example 1:
```
Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1
```

## Example 2:
```
Input: coins = [2], amount = 3
Output: -1
```

## Example 3:
```
Input: coins = [1], amount = 0
Output: 0
```

## Constraints:
- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4', 'Medium', ARRAY['Array', 'Dynamic Programming', 'Breadth-First Search']);

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  domain: string;
  targetTimeMinutes: number;
  tags: string[];
  companies: string[];
  acceptanceRate: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
  starterTemplates: {
    python: string;
    javascript: string;
    typescript: string;
    cpp: string;
    java: string;
    sql?: string;
  };
  hints: string[];
  optimalComplexity: {
    time: string;
    space: string;
  };
  solutionExplanation: string;
}

export const CODING_CATEGORIES = [
  'All',
  'Arrays & Hashing',
  'Two Pointers & Sliding Window',
  'Stack & Queues',
  'Linked Lists',
  'Binary Search & Sorting',
  'Trees & Graphs',
  'Dynamic Programming',
  'Greedy & Backtracking',
  'Bit Manipulation & Math',
  'SQL & Database Systems',
  'Embedded & Systems Programming',
] as const;

export const DOMAINS = [
  'All Domains',
  'Computer Science & IT',
  'AI & Data Science',
  'Electronics & Embedded',
  'Core Engineering Systems',
] as const;

export const CODING_QUESTIONS: CodingQuestion[] = [
  // 1. Two Sum
  {
    id: 'CP_001',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Apple', 'Meta', 'Microsoft'],
    acceptanceRate: 52.4,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]'
      }
    ],
    testCases: [
      { id: 1, input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
      { id: 2, input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
      { id: 3, input: '[3, 3], 6', expectedOutput: '[0, 1]' },
      { id: 4, input: '[-1, -2, -3, -4, -5], -8', expectedOutput: '[2, 4]', isHidden: true },
      { id: 5, input: '[1000000, 500, 2000000, 500], 1000', expectedOutput: '[1, 3]', isHidden: true }
    ],
    starterTemplates: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass`,
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'A brute force approach checks all pairs in O(n^2). Can you do it in linear time?',
      'Think about using a hash map to remember numbers you have already visited and their indices.',
      'For each element `num`, check if `target - num` already exists in your hash map.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single pass through the array',
      space: 'O(n) - Hash map storing up to n elements'
    },
    solutionExplanation: 'By indexing each element in a hash map as we iterate, looking up the required complement `target - nums[i]` takes O(1) average time, reducing total time complexity from O(n^2) to O(n).'
  },

  // 2. Valid Parentheses
  {
    id: 'CP_002',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    category: 'Stack & Queues',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['String', 'Stack'],
    companies: ['Google', 'Meta', 'Bloomberg', 'LinkedIn'],
    acceptanceRate: 40.8,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only `()[]{}`.'
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([)]"', output: 'false' },
      { input: 's = "{[]}"', output: 'true' }
    ],
    testCases: [
      { id: 1, input: '"()"', expectedOutput: 'true' },
      { id: 2, input: '"()[]{}"', expectedOutput: 'true' },
      { id: 3, input: '"(]"', expectedOutput: 'false' },
      { id: 4, input: '"([)]"', expectedOutput: 'false', isHidden: true },
      { id: 5, input: '"{[]}"', expectedOutput: 'true', isHidden: true }
    ],
    starterTemplates: {
      python: `def is_valid_parentheses(s: str) -> bool:
    # Write your solution here
    pass`,
      javascript: `function isValidParentheses(s) {
  // Write your solution here
  
}`,
      typescript: `function isValidParentheses(s: string): boolean {
  // Write your solution here
  
}`,
      cpp: `#include <string>

class Solution {
public:
    bool isValid(std::string s) {
        // Write your solution here
        
    }
};`,
      java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'A Last-In, First-Out (LIFO) data structure like a stack naturally matches matching brackets.',
      'Push opening brackets onto the stack; when encountering a closing bracket, verify that the top of stack matches.',
      'Check if stack is empty when encountering a closing bracket or if anything remains at the end.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single pass over characters',
      space: 'O(n) - Stack stores unmatched opening brackets'
    },
    solutionExplanation: 'Using a stack allows us to ensure every closing bracket matches the most recently opened unmatched bracket.'
  },

  // 3. Best Time to Buy and Sell Stock
  {
    id: 'CP_003',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    category: 'Two Pointers & Sliding Window',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Array', 'Dynamic Programming', 'Sliding Window'],
    companies: ['Amazon', 'Apple', 'Goldman Sachs', 'Microsoft'],
    acceptanceRate: 54.1,
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.'
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    testCases: [
      { id: 1, input: '[7, 1, 5, 3, 6, 4]', expectedOutput: '5' },
      { id: 2, input: '[7, 6, 4, 3, 1]', expectedOutput: '0' },
      { id: 3, input: '[2, 4, 1]', expectedOutput: '2' },
      { id: 4, input: '[1, 2]', expectedOutput: '1', isHidden: true },
      { id: 5, input: '[3, 2, 6, 5, 0, 3]', expectedOutput: '4', isHidden: true }
    ],
    starterTemplates: {
      python: `def max_profit(prices: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function maxProfit(prices) {
  // Write your solution here
  
}`,
      typescript: `function maxProfit(prices: number[]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int maxProfit(std::vector<int>& prices) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Maintain the minimum price seen so far as you iterate through the days.',
      'At each day, the potential profit is current price minus minimum price so far.',
      'Update maximum profit whenever the potential profit exceeds current maximum.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single pass',
      space: 'O(1) - Constant auxiliary space'
    },
    solutionExplanation: 'Greedy tracking of the running minimum purchase price enables O(1) space and O(n) runtime.'
  },

  // 4. Reverse Linked List
  {
    id: 'CP_004',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    category: 'Linked Lists',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Linked List', 'Recursion'],
    companies: ['Amazon', 'Microsoft', 'Adobe', 'Uber'],
    acceptanceRate: 74.5,
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.\n\nCan you implement both iterative and recursive solutions with O(1) extra space?`,
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
      { input: 'head = [1, 2]', output: '[2, 1]' },
      { input: 'head = []', output: '[]' }
    ],
    testCases: [
      { id: 1, input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]' },
      { id: 2, input: '[1, 2]', expectedOutput: '[2, 1]' },
      { id: 3, input: '[]', expectedOutput: '[]' },
      { id: 4, input: '[42]', expectedOutput: '[42]', isHidden: true }
    ],
    starterTemplates: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode) -> ListNode:
    # Write your solution here
    pass`,
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
function reverseList(head) {
  // Write your solution here
  
}`,
      typescript: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  // Write your solution here
  
}`,
      cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        
    }
};`,
      java: `public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Keep track of three pointers: `prev`, `curr`, and `next`.',
      'Change `curr.next` to point to `prev`, then advance both pointers.',
      'When `curr` becomes null, `prev` will be the new head of the reversed list.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single traversal',
      space: 'O(1) - Pointer manipulation in place'
    },
    solutionExplanation: 'Three-pointer in-place reversal achieves optimal O(n) time and O(1) space.'
  },

  // 5. Container With Most Water
  {
    id: 'CP_005',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    category: 'Two Pointers & Sliding Window',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 25,
    tags: ['Array', 'Two Pointers', 'Greedy'],
    companies: ['Google', 'Meta', 'Amazon', 'Goldman Sachs'],
    acceptanceRate: 54.3,
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn *the maximum amount of water a container can store*.\n\n**Notice** that you may not slant the container.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    examples: [
      {
        input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
        output: '49',
        explanation: 'The vertical lines are at indices 1 and 8, width is 7, height is min(8, 7) = 7. Area = 7 * 7 = 49.'
      },
      {
        input: 'height = [1, 1]',
        output: '1'
      }
    ],
    testCases: [
      { id: 1, input: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', expectedOutput: '49' },
      { id: 2, input: '[1, 1]', expectedOutput: '1' },
      { id: 3, input: '[4, 3, 2, 1, 4]', expectedOutput: '16' },
      { id: 4, input: '[1, 2, 1]', expectedOutput: '2', isHidden: true },
      { id: 5, input: '[2, 3, 4, 5, 18, 17, 6]', expectedOutput: '17', isHidden: true }
    ],
    starterTemplates: {
      python: `def max_area(height: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function maxArea(height) {
  // Write your solution here
  
}`,
      typescript: `function maxArea(height: number[]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int maxArea(std::vector<int>& height) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int maxArea(int[] height) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'The area is limited by the shorter line: area = min(height[left], height[right]) * (right - left).',
      'Start with the widest container: left pointer at 0, right pointer at length - 1.',
      'To have any chance of finding a larger area with smaller width, we must increase the limiting height, so always move the pointer pointing to the shorter vertical bar.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single pass inwards',
      space: 'O(1) - Constant auxiliary space'
    },
    solutionExplanation: 'Moving the pointer with the smaller height guarantees we do not miss any potentially larger areas while reducing search space from O(n^2) to O(n).'
  },

  // 6. Longest Substring Without Repeating Characters
  {
    id: 'CP_006',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    category: 'Two Pointers & Sliding Window',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 25,
    tags: ['Hash Table', 'String', 'Sliding Window'],
    companies: ['Amazon', 'Bloomberg', 'Microsoft', 'Adobe', 'Meta'],
    acceptanceRate: 34.2,
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    testCases: [
      { id: 1, input: '"abcabcbb"', expectedOutput: '3' },
      { id: 2, input: '"bbbbb"', expectedOutput: '1' },
      { id: 3, input: '"pwwkew"', expectedOutput: '3' },
      { id: 4, input: '""', expectedOutput: '0', isHidden: true },
      { id: 5, input: '" "', expectedOutput: '1', isHidden: true }
    ],
    starterTemplates: {
      python: `def length_of_longest_substring(s: str) -> int:
    # Write your solution here
    pass`,
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your solution here
  
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  // Write your solution here
  
}`,
      cpp: `#include <string>

class Solution {
public:
    int lengthOfLongestSubstring(std::string s) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Use a sliding window [left, right] to maintain substring with unique characters.',
      'Record each character\'s most recent index in a map.',
      'When you see a duplicate inside the window, jump the left pointer to index + 1.'
    ],
    optimalComplexity: {
      time: 'O(n) - Right pointer visits each index once',
      space: 'O(min(n, m)) - Size of alphabet m'
    },
    solutionExplanation: 'Sliding window with hash table index jump skips repeated scans, giving optimal linear time.'
  },

  // 7. Climbing Stairs (DP)
  {
    id: 'CP_007',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    companies: ['Amazon', 'Google', 'Apple', 'Uber'],
    acceptanceRate: 52.9,
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: [
      '1 <= n <= 45'
    ],
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps'
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step'
      }
    ],
    testCases: [
      { id: 1, input: '2', expectedOutput: '2' },
      { id: 2, input: '3', expectedOutput: '3' },
      { id: 3, input: '5', expectedOutput: '8' },
      { id: 4, input: '1', expectedOutput: '1', isHidden: true },
      { id: 5, input: '10', expectedOutput: '89', isHidden: true }
    ],
    starterTemplates: {
      python: `def climb_stairs(n: int) -> int:
    # Write your solution here
    pass`,
      javascript: `function climbStairs(n) {
  // Write your solution here
  
}`,
      typescript: `function climbStairs(n: number): number {
  // Write your solution here
  
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'To reach step n, you must arrive from either step n - 1 (1 step jump) or step n - 2 (2 step jump).',
      'Hence dp[n] = dp[n - 1] + dp[n - 2]. This is identical to the Fibonacci sequence!',
      'You only need the previous two values, so space can be reduced to O(1).'
    ],
    optimalComplexity: {
      time: 'O(n) - Single loop',
      space: 'O(1) - Two variables for state'
    },
    solutionExplanation: 'Fibonacci state transition dp[i] = dp[i-1] + dp[i-2] solved with bottom-up space optimization.'
  },

  // 8. Coin Change
  {
    id: 'CP_008',
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 30,
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    companies: ['Amazon', 'Bloomberg', 'Google', 'Airbnb', 'Microsoft'],
    acceptanceRate: 43.1,
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.\n\nYou may assume that you have an infinite number of each kind of coin.`,
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins)'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0'
      }
    ],
    testCases: [
      { id: 1, input: '[1, 2, 5], 11', expectedOutput: '3' },
      { id: 2, input: '[2], 3', expectedOutput: '-1' },
      { id: 3, input: '[1], 0', expectedOutput: '0' },
      { id: 4, input: '[1, 5, 10, 25], 30', expectedOutput: '2', isHidden: true },
      { id: 5, input: '[186, 419, 83, 408], 6249', expectedOutput: '20', isHidden: true }
    ],
    starterTemplates: {
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # Write your solution here
    pass`,
      javascript: `function coinChange(coins, amount) {
  // Write your solution here
  
}`,
      typescript: `function coinChange(coins: number[], amount: number): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int coinChange(std::vector<int>& coins, int amount) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Think of this as an unbounded knapsack problem.',
      'Define dp[i] as the minimum coins needed to make sum i.',
      'Transition: dp[i] = min(dp[i], dp[i - coin] + 1) for each coin <= i.'
    ],
    optimalComplexity: {
      time: 'O(amount * n) - Double loop',
      space: 'O(amount) - 1D array of size amount + 1'
    },
    solutionExplanation: 'Bottom-up dynamic programming builds the optimal coin configuration from 0 up to target amount.'
  },

  // 9. Maximum Subarray (Kadane's Algorithm)
  {
    id: 'CP_009',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 20,
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    companies: ['Amazon', 'Apple', 'Microsoft', 'LinkedIn'],
    acceptanceRate: 50.8,
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.\n\nA subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23'
      }
    ],
    testCases: [
      { id: 1, input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
      { id: 2, input: '[1]', expectedOutput: '1' },
      { id: 3, input: '[5, 4, -1, 7, 8]', expectedOutput: '23' },
      { id: 4, input: '[-1]', expectedOutput: '-1', isHidden: true },
      { id: 5, input: '[-2, -1]', expectedOutput: '-1', isHidden: true }
    ],
    starterTemplates: {
      python: `def max_sub_array(nums: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function maxSubArray(nums) {
  // Write your solution here
  
}`,
      typescript: `function maxSubArray(nums: number[]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int maxSubArray(std::vector<int>& nums) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Kadane\'s algorithm maintains maximum sum of subarray ending at current position.',
      'At each index i, we decide whether to add nums[i] to the existing sum or start a fresh subarray at nums[i].',
      'current_sum = max(nums[i], current_sum + nums[i]).'
    ],
    optimalComplexity: {
      time: 'O(n) - Single linear pass',
      space: 'O(1) - Constant variables'
    },
    solutionExplanation: 'Kadane\'s linear scan evaluates whether prefix sum adds positive value or should be reset.'
  },

  // 10. Number of Islands (Graphs / BFS / DFS)
  {
    id: 'CP_010',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    category: 'Trees & Graphs',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 30,
    tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
    acceptanceRate: 58.7,
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.\n\nAn **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is \'0\' or \'1\'.'
    ],
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1'
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3'
      }
    ],
    testCases: [
      {
        id: 1,
        input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        expectedOutput: '1'
      },
      {
        id: 2,
        input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expectedOutput: '3'
      },
      {
        id: 3,
        input: '[["1","0"],["0","1"]]',
        expectedOutput: '2',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `def num_islands(grid: list[list[str]]) -> int:
    # Write your solution here
    pass`,
      javascript: `function numIslands(grid) {
  // Write your solution here
  
}`,
      typescript: `function numIslands(grid: string[][]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int numIslands(std::vector<std::vector<char>>& grid) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Iterate through every cell in the matrix.',
      'When you hit a \'1\', you have encountered an island! Increment island counter.',
      'Launch a DFS or BFS from that cell to sink/visit all reachable \'1\'s (turn them into \'0\') so they won\'t be recounted.'
    ],
    optimalComplexity: {
      time: 'O(m * n) - Every cell visited at most constant times',
      space: 'O(m * n) - Recursion stack in worst case of all land'
    },
    solutionExplanation: 'Connected components on 2D grid solved via flood-fill DFS mutating cells in-place.'
  },

  // 11. Circular Ring Buffer (Embedded Systems & Low-Level C/C++)
  {
    id: 'CP_011',
    title: 'Circular Ring Buffer Implementation',
    slug: 'circular-ring-buffer',
    difficulty: 'Medium',
    category: 'Embedded & Systems Programming',
    domain: 'Electronics & Embedded',
    targetTimeMinutes: 25,
    tags: ['Queue', 'Circular Buffer', 'Embedded Systems', 'Concurrency'],
    companies: ['Qualcomm', 'Intel', 'Tesla', 'Apple', 'NVIDIA'],
    acceptanceRate: 51.2,
    description: `Design your implementation of the circular queue (ring buffer). The circular queue is a linear data structure in which the operations are performed based on FIFO (First In First Out) principle, and the last position is connected back to the first position to make a circle.\n\nIt is widely used in embedded firmware (UART RX/TX, DMA transfers, audio buffers).\n\nImplement the \`CircularQueue\` class:\n- \`CircularQueue(k)\`: Initializes the object with the size of the queue to be \`k\`.\n- \`enQueue(value)\`: Inserts an element into the circular queue. Return \`true\` if successful.\n- \`deQueue()\`: Deletes an element from circular queue. Return \`true\` if successful.\n- \`Front()\`: Gets the front item. If empty, return \`-1\`.\n- \`Rear()\`: Gets the last item. If empty, return \`-1\`.\n- \`isEmpty()\`: Checks whether circular queue is empty.\n- \`isFull()\`: Checks whether circular queue is full.`,
    constraints: [
      '1 <= k <= 1000',
      '0 <= value <= 1000',
      'At most 3000 calls to enQueue, deQueue, Front, Rear, isEmpty, and isFull.'
    ],
    examples: [
      {
        input: `CircularQueue myQueue = new CircularQueue(3);
myQueue.enQueue(1); // return True
myQueue.enQueue(2); // return True
myQueue.enQueue(3); // return True
myQueue.enQueue(4); // return False, queue is full
myQueue.Rear();     // return 3
myQueue.isFull();   // return True
myQueue.deQueue();  // return True
myQueue.enQueue(4); // return True
myQueue.Rear();     // return 4`,
        output: '[true, true, true, false, 3, true, true, true, 4]'
      }
    ],
    testCases: [
      { id: 1, input: 'k=3, enQ(1), enQ(2), enQ(3), enQ(4)', expectedOutput: '[true, true, true, false]' },
      { id: 2, input: 'Rear() on [1, 2, 3]', expectedOutput: '3' },
      { id: 3, input: 'deQ() on full k=3, then enQ(4)', expectedOutput: '[true, true]' }
    ],
    starterTemplates: {
      python: `class MyCircularQueue:
    def __init__(self, k: int):
        # Write your solution here
        pass

    def enQueue(self, value: int) -> bool:
        pass

    def deQueue(self) -> bool:
        pass

    def Front(self) -> int:
        pass

    def Rear(self) -> int:
        pass

    def isEmpty(self) -> bool:
        pass

    def isFull(self) -> bool:
        pass`,
      javascript: `class MyCircularQueue {
  constructor(k) {
    // Write your solution here
  }

  enQueue(value) {
    // Write your solution here
  }

  deQueue() {
    // Write your solution here
  }

  Front() {
    // Write your solution here
  }

  Rear() {
    // Write your solution here
  }

  isEmpty() {
    // Write your solution here
  }

  isFull() {
    // Write your solution here
  }
}`,
      typescript: `class MyCircularQueue {
  constructor(k: number) {
    // Write your solution here
  }

  enQueue(value: number): boolean {
    // Write your solution here
    return false;
  }

  deQueue(): boolean {
    // Write your solution here
    return false;
  }

  Front(): number {
    // Write your solution here
    return -1;
  }

  Rear(): number {
    // Write your solution here
    return -1;
  }

  isEmpty(): boolean {
    // Write your solution here
    return true;
  }

  isFull(): boolean {
    // Write your solution here
    return false;
  }
}`,
      cpp: `class MyCircularQueue {
public:
    MyCircularQueue(int k) {
        // Write your solution here
    }
    
    bool enQueue(int value) {
        // Write your solution here
        return false;
    }
    
    bool deQueue() {
        // Write your solution here
        return false;
    }
    
    int Front() {
        // Write your solution here
        return -1;
    }
    
    int Rear() {
        // Write your solution here
        return -1;
    }
    
    bool isEmpty() {
        // Write your solution here
        return true;
    }
    
    bool isFull() {
        // Write your solution here
        return false;
    }
};`,
      java: `class MyCircularQueue {
    public MyCircularQueue(int k) {
        // Write your solution here
    }
    
    public boolean enQueue(int value) {
        // Write your solution here
        return false;
    }
    
    public boolean deQueue() {
        // Write your solution here
        return false;
    }
    
    public int Front() {
        // Write your solution here
        return -1;
    }
    
    public int Rear() {
        // Write your solution here
        return -1;
    }
    
    public boolean isEmpty() {
        // Write your solution here
        return true;
    }
    
    public boolean isFull() {
        // Write your solution here
        return false;
    }
}`
    },
    hints: [
      'Modulo arithmetic `% k` wraps the index around when reaching the buffer end.',
      'Maintaining `head` and `count` simplifies boundary conditions without needing sentinel null values.',
      'The tail index is always `(head + count - 1) % k`.'
    ],
    optimalComplexity: {
      time: 'O(1) for all operations',
      space: 'O(k) fixed size array buffer'
    },
    solutionExplanation: 'Circular indexing via modulo math prevents reallocations, making it ideal for real-time systems.'
  },

  // 12. Single Number (Bit Manipulation)
  {
    id: 'CP_012',
    title: 'Single Number (XOR Bit Manipulation)',
    slug: 'single-number',
    difficulty: 'Easy',
    category: 'Bit Manipulation & Math',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Array', 'Bit Manipulation'],
    companies: ['Amazon', 'Google', 'Meta', 'Apple'],
    acceptanceRate: 72.1,
    description: `Given a **non-empty** array of integers \`nums\`, every element appears *twice* except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.`,
    constraints: [
      '1 <= nums.length <= 3 * 10^4',
      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
      'Each element in the array appears twice except for one element which appears once.'
    ],
    examples: [
      { input: 'nums = [2, 2, 1]', output: '1' },
      { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
      { input: 'nums = [1]', output: '1' }
    ],
    testCases: [
      { id: 1, input: '[2, 2, 1]', expectedOutput: '1' },
      { id: 2, input: '[4, 1, 2, 1, 2]', expectedOutput: '4' },
      { id: 3, input: '[1]', expectedOutput: '1' },
      { id: 4, input: '[-1, -1, -2]', expectedOutput: '-2', isHidden: true }
    ],
    starterTemplates: {
      python: `def single_number(nums: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function singleNumber(nums) {
  // Write your solution here
  
}`,
      typescript: `function singleNumber(nums: number[]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int singleNumber(std::vector<int>& nums) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Remember properties of XOR: `a ^ a = 0` and `a ^ 0 = a`.',
      'XOR is both commutative and associative, so the order does not matter.',
      'XOR-ing all numbers together cancels out pairs, leaving only the unique number.'
    ],
    optimalComplexity: {
      time: 'O(n) - Single pass',
      space: 'O(1) - Single variable'
    },
    solutionExplanation: 'XOR self-cancellation property eliminates duplicate pairs in O(n) time and O(1) space.'
  },

  // 13. SQL: Department Top Three Salaries
  {
    id: 'CP_013',
    title: 'Department Top Three Salaries',
    slug: 'department-top-three-salaries',
    difficulty: 'Hard',
    category: 'SQL & Database Systems',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 35,
    tags: ['Database', 'SQL', 'Window Functions', 'DENSE_RANK'],
    companies: ['Amazon', 'Google', 'Meta', 'Goldman Sachs', 'Twitter'],
    acceptanceRate: 51.5,
    description: `A company's executives are interested in seeing who earns the most money in each of the company's departments. A **high earner** in a department is an employee who has a salary in the **top three unique salaries** for that department.\n\nWrite a solution to find the employees who are **high earners** in each of the departments.\n\nReturn the result table in **any order**.\n\nTable: \`Employee\`\n- \`id\` (int)\n- \`name\` (varchar)\n- \`salary\` (int)\n- \`departmentId\` (int)\n\nTable: \`Department\`\n- \`id\` (int)\n- \`name\` (varchar)`,
    constraints: [
      'Employee table has primary key id.',
      'Department table has primary key id.',
      'Salaries are positive integers.'
    ],
    examples: [
      {
        input: `Employee:
+----+-------+--------+--------------+
| id | name  | salary | departmentId |
+----+-------+--------+--------------+
| 1  | Joe   | 85000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
| 5  | Janet | 69000  | 1            |
| 6  | Randy | 85000  | 1            |
| 7  | Will  | 70000  | 1            |
+----+-------+--------+--------------+
Department:
+----+-------+
| id | name  |
+----+-------+
| 1  | IT    |
| 2  | Sales |
+----+-------+`,
        output: `+------------+----------+--------+
| Department | Employee | Salary |
+------------+----------+--------+
| IT         | Max      | 90000  |
| IT         | Joe      | 85000  |
| IT         | Randy    | 85000  |
| IT         | Will     | 70000  |
| Sales      | Henry    | 80000  |
| Sales      | Sam      | 60000  |
+------------+----------+--------+`
      }
    ],
    testCases: [
      { id: 1, input: 'Standard 7 employees, 2 departments', expectedOutput: '6 high earners returned' }
    ],
    starterTemplates: {
      python: `def find_top_three_salaries(department_df, employee_df):
    # Write your solution here
    pass`,
      javascript: `function findTopThreeSalaries(departments, employees) {
  // Write your solution here
  
}`,
      typescript: `function findTopThreeSalaries(departments: any[], employees: any[]): any[] {
  // Write your solution here
  
}`,
      cpp: `// SQL analytical problem - Select SQL tab or implement in C++
#include <vector>
#include <string>

struct Employee {
    int id;
    std::string name;
    int salary;
    int departmentId;
};`,
      java: `// SQL analytical problem - Select SQL tab or implement in Java
import java.util.*;`,
      sql: `-- Write your PostgreSQL analytical query here
SELECT
    d.name AS Department,
    e.name AS Employee,
    e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
-- Add your DENSE_RANK() / ranking condition here
;`
    },
    hints: [
      'Use the window function `DENSE_RANK()` because ties in salary must share the same rank without skipping subsequent ranks.',
      'Partition by `departmentId` and order by `salary DESC`.',
      'Filter where `rank <= 3`.'
    ],
    optimalComplexity: {
      time: 'O(n log n) sorting per partition',
      space: 'O(n) auxiliary CTE result set'
    },
    solutionExplanation: 'DENSE_RANK() correctly handles duplicate salaries in the top 3 tiers per department.'
  },

  // 14. Binary Search
  {
    id: 'CP_014',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    category: 'Binary Search & Sorting',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Array', 'Binary Search'],
    companies: ['Microsoft', 'Apple', 'Google', 'Amazon'],
    acceptanceRate: 58.2,
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.\n\nIf \`target\` exists, then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    examples: [
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4'
      },
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1'
      }
    ],
    testCases: [
      { id: 1, input: '[-1, 0, 3, 5, 9, 12], 9', expectedOutput: '4' },
      { id: 2, input: '[-1, 0, 3, 5, 9, 12], 2', expectedOutput: '-1' },
      { id: 3, input: '[5], 5', expectedOutput: '0' },
      { id: 4, input: '[2, 5], 5', expectedOutput: '1', isHidden: true }
    ],
    starterTemplates: {
      python: `def search(nums: list[int], target: int) -> int:
    # Write your solution here
    pass`,
      javascript: `function search(nums, target) {
  // Write your solution here
  
}`,
      typescript: `function search(nums: number[], target: number): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int search(std::vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Calculate mid with `left + (right - left) // 2` to avoid integer overflow.',
      'Halve the search space at each iteration based on comparison with target.'
    ],
    optimalComplexity: {
      time: 'O(log n) - Search space is halved each step',
      space: 'O(1) - Constant variables'
    },
    solutionExplanation: 'Standard logarithmic binary search on sorted array.'
  },

  // 15. PID Controller Simulation (Robotics & Control Systems)
  {
    id: 'CP_015',
    title: 'PID Controller Step Response Engine',
    slug: 'pid-controller-simulation',
    difficulty: 'Medium',
    category: 'Embedded & Systems Programming',
    domain: 'Core Engineering Systems',
    targetTimeMinutes: 25,
    tags: ['Robotics', 'Control Theory', 'Calculus', 'Embedded Systems'],
    companies: ['Tesla', 'Boston Dynamics', 'DJI', 'Lockheed Martin', 'ABB'],
    acceptanceRate: 64.0,
    description: `Implement a discrete **Proportional-Integral-Derivative (PID)** controller update step function.\n\nThe PID control signal is given by:\n$u(t) = K_p \\cdot e(t) + K_i \\cdot \\int_0^t e(\\tau) d\\tau + K_d \\cdot \\frac{de(t)}{dt}$\n\nIn discrete time with sampling interval \`dt\`:\n- Error: \`error = setpoint - current_value\`\n- Integral: \`integral += error * dt\` (with anti-windup clamping \`[-clamp, clamp]\`)\n- Derivative: \`derivative = (error - prev_error) / dt\`\n- Output: \`Kp * error + Ki * integral + Kd * derivative\`\n\nReturn the control effort \`output\` clamped within \`[-max_output, max_output]\`.`,
    constraints: [
      'dt > 0.0001',
      'All gains Kp, Ki, Kd >= 0',
      'Clamp values > 0'
    ],
    examples: [
      {
        input: 'setpoint=100.0, current=80.0, Kp=1.5, Ki=0.2, Kd=0.05, dt=0.1, integral=0.0, prev_error=25.0',
        output: '30.15'
      }
    ],
    testCases: [
      {
        id: 1,
        input: 'setpoint=100, current=80, Kp=1.5, Ki=0.2, Kd=0.05, dt=0.1, integral=0, prev_err=25',
        expectedOutput: '27.9'
      }
    ],
    starterTemplates: {
      python: `def update_pid(setpoint: float, measured: float, dt: float, kp: float = 2.0, ki: float = 0.5, kd: float = 0.1) -> float:
    # Write your PID controller logic here
    pass`,
      javascript: `function updatePid(setpoint, measured, dt, kp = 2.0, ki = 0.5, kd = 0.1) {
  // Write your PID controller logic here
  
}`,
      typescript: `function updatePid(setpoint: number, measured: number, dt: number, kp: number = 2.0, ki: number = 0.5, kd: number = 0.1): number {
  // Write your PID controller logic here
  
}`,
      cpp: `class PIDController {
public:
    double update(double setpoint, double measured, double dt, double kp = 2.0, double ki = 0.5, double kd = 0.1) {
        // Write your PID controller logic here
        return 0.0;
    }
};`,
      java: `class PIDController {
    public double update(double setpoint, double measured, double dt, double kp, double ki, double kd) {
        // Write your PID controller logic here
        return 0.0;
    }
}`
    },
    hints: [
      'Proportional term reduces immediate tracking error.',
      'Integral term eliminates steady-state error; clamp it to avoid actuator saturation (anti-windup).',
      'Derivative term damps overshoot by anticipating rate of error change.'
    ],
    optimalComplexity: {
      time: 'O(1) - Constant math operations',
      space: 'O(1) - No allocations'
    },
    solutionExplanation: 'Standard embedded feedback control algorithm with anti-windup accumulator bounds.'
  },

  // 16. Invert Binary Tree
  {
    id: 'CP_016',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    category: 'Trees & Graphs',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 15,
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    companies: ['Google', 'Meta', 'Amazon', 'Apple'],
    acceptanceRate: 76.3,
    description: `Given the \`root\` of a binary tree, invert the tree, and return *its root*.\n\n(Famously referenced in tech interview lore: "Google: 90% of our engineers use the software you wrote, but you can’t invert a binary tree on a whiteboard so f*** off.")`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100'
    ],
    examples: [
      {
        input: 'root = [4, 2, 7, 1, 3, 6, 9]',
        output: '[4, 7, 2, 9, 6, 3, 1]'
      },
      {
        input: 'root = [2, 1, 3]',
        output: '[2, 3, 1]'
      },
      {
        input: 'root = []',
        output: '[]'
      }
    ],
    testCases: [
      { id: 1, input: '[4, 2, 7, 1, 3, 6, 9]', expectedOutput: '[4, 7, 2, 9, 6, 3, 1]' },
      { id: 2, input: '[2, 1, 3]', expectedOutput: '[2, 3, 1]' },
      { id: 3, input: '[]', expectedOutput: '[]' }
    ],
    starterTemplates: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invert_tree(root: TreeNode) -> TreeNode:
    # Write your solution here
    pass`,
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
function invertTree(root) {
  // Write your solution here
  
}`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}

function invertTree(root: TreeNode | null): TreeNode | null {
  // Write your solution here
  
}`,
      cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        // Write your solution here
        
    }
};`,
      java: `public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Swap the left and right children of current node.',
      'Recursively invert the left subtree and right subtree.',
      'Base condition: if node is null, return null.'
    ],
    optimalComplexity: {
      time: 'O(n) - Visits every node once',
      space: 'O(h) - Height of tree in recursive call stack'
    },
    solutionExplanation: 'Post-order or pre-order recursive child swap mirrors binary tree structure.'
  },

  // 17. 3Sum
  {
    id: 'CP_017',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    category: 'Two Pointers & Sliding Window',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 30,
    tags: ['Array', 'Two Pointers', 'Sorting'],
    companies: ['Meta', 'Amazon', 'Apple', 'Google', 'Microsoft'],
    acceptanceRate: 33.8,
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.\n\nNotice that the solution set must not contain duplicate triplets.`,
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    examples: [
      {
        input: 'nums = [-1, 0, 1, 2, -1, -4]',
        output: '[[-1, -1, 2], [-1, 0, 1]]',
        explanation: 'Distinct triplets summing to 0 without duplicates.'
      },
      {
        input: 'nums = [0, 1, 1]',
        output: '[]'
      },
      {
        input: 'nums = [0, 0, 0]',
        output: '[[0, 0, 0]]'
      }
    ],
    testCases: [
      { id: 1, input: '[-1, 0, 1, 2, -1, -4]', expectedOutput: '[[-1, -1, 2], [-1, 0, 1]]' },
      { id: 2, input: '[0, 1, 1]', expectedOutput: '[]' },
      { id: 3, input: '[0, 0, 0]', expectedOutput: '[[0, 0, 0]]' }
    ],
    starterTemplates: {
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    # Write your solution here
    pass`,
      javascript: `function threeSum(nums) {
  // Write your solution here
  
}`,
      typescript: `function threeSum(nums: number[]): number[][] {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {
        // Write your solution here
        
    }
};`,
      java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Sort the array first to make duplicate elimination and two-pointer traversal straightforward.',
      'Fix the first element `nums[i]`, then run two pointers on the remainder of the array `[i + 1, n - 1]`.',
      'Remember to skip duplicates for `i`, `left`, and `right`.'
    ],
    optimalComplexity: {
      time: 'O(n^2) - O(n log n) sorting + O(n^2) two pointer scans',
      space: 'O(log n) to O(n) for sorting'
    },
    solutionExplanation: 'Sorting plus bidirectional two-pointer sweep eliminates redundant combinations in O(n^2).'
  },

  // 18. Product of Array Except Self
  {
    id: 'CP_018',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 20,
    tags: ['Array', 'Prefix Sum'],
    companies: ['Amazon', 'Apple', 'Meta', 'Microsoft', 'Lyft'],
    acceptanceRate: 65.5,
    description: `Given an integer array \`nums\`, return *an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`*.\n\nThe product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.\n\nYou must write an algorithm that runs in \`O(n)\` time and without using the division operator.`,
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix fits in a 32-bit integer.'
    ],
    examples: [
      {
        input: 'nums = [1, 2, 3, 4]',
        output: '[24, 12, 8, 6]'
      },
      {
        input: 'nums = [-1, 1, 0, -3, 3]',
        output: '[0, 0, 9, 0, 0]'
      }
    ],
    testCases: [
      { id: 1, input: '[1, 2, 3, 4]', expectedOutput: '[24, 12, 8, 6]' },
      { id: 2, input: '[-1, 1, 0, -3, 3]', expectedOutput: '[0, 0, 9, 0, 0]' }
    ],
    starterTemplates: {
      python: `def product_except_self(nums: list[int]) -> list[int]:
    # Write your solution here
    pass`,
      javascript: `function productExceptSelf(nums) {
  // Write your solution here
  
}`,
      typescript: `function productExceptSelf(nums: number[]): number[] {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<int> productExceptSelf(std::vector<int>& nums) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'The product except self for index i equals (product of all elements to the left of i) * (product of all elements to the right of i).',
      'Compute prefix products in a forward pass.',
      'Multiply with suffix products accumulated in a reverse pass.'
    ],
    optimalComplexity: {
      time: 'O(n) - Two passes',
      space: 'O(1) auxiliary space (excluding the output array)'
    },
    solutionExplanation: 'Accumulating prefix and suffix running products avoids division and achieves O(n) time with O(1) extra memory.'
  },

  // 19. Validate Binary Search Tree
  {
    id: 'CP_019',
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    difficulty: 'Medium',
    category: 'Trees & Graphs',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 25,
    tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'],
    companies: ['Amazon', 'Bloomberg', 'Meta', 'Microsoft', 'Google'],
    acceptanceRate: 32.7,
    description: `Given the \`root\` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA **valid BST** is defined as follows:\n- The left subtree of a node contains only nodes with keys **less than** the node's key.\n- The right subtree of a node contains only nodes with keys **greater than** the node's key.\n- Both the left and right subtrees must also be binary search trees.`,
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^4].',
      '-2^31 <= Node.val <= 2^31 - 1'
    ],
    examples: [
      {
        input: 'root = [2, 1, 3]',
        output: 'true'
      },
      {
        input: 'root = [5, 1, 4, null, null, 3, 6]',
        output: 'false',
        explanation: 'The root node\'s value is 5 but its right child\'s value is 4.'
      }
    ],
    testCases: [
      { id: 1, input: '[2, 1, 3]', expectedOutput: 'true' },
      { id: 2, input: '[5, 1, 4, null, null, 3, 6]', expectedOutput: 'false' },
      { id: 3, input: '[2, 2, 2]', expectedOutput: 'false', isHidden: true }
    ],
    starterTemplates: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_valid_bst(root: TreeNode) -> bool:
    # Write your solution here
    pass`,
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
function isValidBST(root) {
  // Write your solution here
  
}`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}

function isValidBST(root: TreeNode | null): boolean {
  // Write your solution here
  
}`,
      cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // Write your solution here
        
    }
};`,
      java: `public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Solution {
    public boolean isValidBST(TreeNode root) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'It is not sufficient that left child < root and right child > root. All nodes in left subtree must be < root.',
      'Pass valid bounds `(low, high)` through recursive calls.',
      'Alternatively, perform in-order traversal; the values must be strictly monotonically increasing.'
    ],
    optimalComplexity: {
      time: 'O(n) - Visits every node once',
      space: 'O(h) - Stack depth proportional to tree height'
    },
    solutionExplanation: 'Range validation propagating lower and upper bounds enforces strict subtree invariants.'
  },

  // 20. Matrix Multiplication & Tensor Contraction (Data Science & Core Eng)
  {
    id: 'CP_020',
    title: 'Matrix Multiplication & Numerical Kernel',
    slug: 'matrix-multiplication-kernel',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    domain: 'AI & Data Science',
    targetTimeMinutes: 25,
    tags: ['Matrix', 'Linear Algebra', 'Algorithms', 'GPU Kernels'],
    companies: ['NVIDIA', 'OpenAI', 'Google DeepMind', 'Apple', 'Meta'],
    acceptanceRate: 68.2,
    description: `Given two 2D matrices \`A\` of dimensions \`m x k\` and \`B\` of dimensions \`k x n\`, return their matrix product \`C = A * B\` of dimensions \`m x n\`.\n\nEach element \`C[i][j] = sum(A[i][p] * B[p][j])\` for \`p = 0..k-1\`.\n\nIf the inner dimensions do not match (\`A[0].length != B.length\`), return an empty matrix \`[]\`.`,
    constraints: [
      '1 <= m, k, n <= 100',
      '-100 <= A[i][j], B[i][j] <= 100'
    ],
    examples: [
      {
        input: `A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]]`,
        output: `[[19, 22], [43, 50]]`,
        explanation: '1*5 + 2*7 = 19; 1*6 + 2*8 = 22; 3*5 + 4*7 = 43; 3*6 + 4*8 = 50'
      }
    ],
    testCases: [
      { id: 1, input: 'A=[[1,2],[3,4]], B=[[5,6],[7,8]]', expectedOutput: '[[19,22],[43,50]]' },
      { id: 2, input: 'A=[[1,0],[0,1]], B=[[7,9],[4,2]]', expectedOutput: '[[7,9],[4,2]]' }
    ],
    starterTemplates: {
      python: `def matmul(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    # Write your matrix multiplication solution here
    pass`,
      javascript: `function matmul(A, B) {
  // Write your matrix multiplication solution here
  
}`,
      typescript: `function matmul(A: number[][], B: number[][]): number[][] {
  // Write your matrix multiplication solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<std::vector<double>> matmul(const std::vector<std::vector<double>>& A, const std::vector<std::vector<double>>& B) {
        // Write your matrix multiplication solution here
        
    }
};`,
      java: `class Solution {
    public double[][] matmul(double[][] A, double[][] B) {
        // Write your matrix multiplication solution here
        
    }
}`
    },
    hints: [
      'Loop ordering `i -> p -> j` provides much better CPU cache locality (row-major access on both C and B) compared to standard `i -> j -> p`.',
      'Skipping zero entries `if (A[i][p] !== 0)` accelerates sparse matrix products.'
    ],
    optimalComplexity: {
      time: 'O(m * k * n)',
      space: 'O(m * n) for output matrix'
    },
    solutionExplanation: 'Loop order reordering ensures optimal stride-1 cache lines during memory access.'
  },
  // 21. LRU Cache
  {
    id: 'CP_021',
    title: 'LRU Cache Design',
    slug: 'lru-cache',
    difficulty: 'Medium',
    category: 'Stack & Queues',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 30,
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg', 'Apple'],
    acceptanceRate: 42.1,
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.\n\nImplement the \`LRUCache\` class:\n- \`LRUCache(int capacity)\`: Initialize with positive size \`capacity\`.\n- \`int get(int key)\`: Return the value of the \`key\` if it exists, otherwise return \`-1\`.\n- \`void put(int key, int value)\`: Update or insert the key-value pair. When capacity is reached, evict the least recently used key.\n\nThe functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls to get and put'],
    examples: [
      {
        input: `LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1);
lRUCache.put(2, 2);
lRUCache.get(1);    // returns 1
lRUCache.put(3, 3); // evicts key 2
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // evicts key 1
lRUCache.get(1);    // returns -1 (not found)
lRUCache.get(3);    // returns 3
lRUCache.get(4);    // returns 4`,
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]'
      }
    ],
    testCases: [
      { id: 1, input: 'cap=2, put(1,1), put(2,2), get(1), put(3,3), get(2)', expectedOutput: '[null, null, null, 1, null, -1]' }
    ],
    starterTemplates: {
      python: `class LRUCache:
    def __init__(self, capacity: int):
        # Write your solution here
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass`,
      javascript: `class LRUCache {
  constructor(capacity) {
    // Write your solution here
  }

  get(key) {
    // Write your solution here
  }

  put(key, value) {
    // Write your solution here
  }
}`,
      typescript: `class LRUCache {
  constructor(capacity: number) {
    // Write your solution here
  }

  get(key: number): number {
    // Write your solution here
    return -1;
  }

  put(key: number, value: number): void {
    // Write your solution here
  }
}`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        // Write your solution here
    }
    
    int get(int key) {
        // Write your solution here
        return -1;
    }
    
    void put(int key, int value) {
        // Write your solution here
    }
};`,
      java: `class LRUCache {
    public LRUCache(int capacity) {
        // Write your solution here
    }
    
    public int get(int key) {
        // Write your solution here
        return -1;
    }
    
    public void put(int key, int value) {
        // Write your solution here
    }
}`
    },
    hints: [
      'Hash table gives O(1) key lookup, and Doubly Linked List gives O(1) node removal and insertion at head.',
      'Combining both structures yields the classic O(1) LRU Cache architecture.'
    ],
    optimalComplexity: { time: 'O(1) for get and put', space: 'O(capacity)' },
    solutionExplanation: 'Doubly linked list maintains access frequency order while hash map maps keys directly to list iterators.'
  },
  // 22. Merge Intervals
  {
    id: 'CP_022',
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    category: 'Binary Search & Sorting',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 20,
    tags: ['Array', 'Sorting'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Uber'],
    acceptanceRate: 46.8,
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= start_i <= end_i <= 10^4'],
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }
    ],
    testCases: [
      { id: 1, input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { id: 2, input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ],
    starterTemplates: {
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # Write your solution here
    pass`,
      javascript: `function merge(intervals) {
  // Write your solution here
  
}`,
      typescript: `function merge(intervals: number[][]): number[][] {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {
        // Write your solution here
        
    }
};`,
      java: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your solution here
        
    }
}`
    },
    hints: [
      'Sort intervals by their starting timestamp.',
      'If current interval starts before previous interval ends, merge them: end = max(prev.end, curr.end).'
    ],
    optimalComplexity: { time: 'O(n log n)', space: 'O(n)' },
    solutionExplanation: 'Sorting chronologically by start timestamp simplifies merge detection into a linear scan.'
  },
  // 23. Trapping Rain Water
  {
    id: 'CP_023',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    category: 'Two Pointers & Sliding Window',
    domain: 'Computer Science & IT',
    targetTimeMinutes: 35,
    tags: ['Array', 'Two Pointers', 'Monotonic Stack'],
    companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Bloomberg'],
    acceptanceRate: 61.2,
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of water trapped.' }
    ],
    testCases: [
      { id: 1, input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }
    ],
    starterTemplates: {
      python: `def trap(height: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function trap(height) {
  // Write your solution here
  
}`,
      typescript: `function trap(height: number[]): number {
  // Write your solution here
  
}`,
      cpp: `#include <vector>

class Solution {
public:
    int trap(std::vector<int>& height) {
        // Write your solution here
        
    }
};`,
      java: `class Solution {
    public int trap(int[] height) {
        // Write your solution here
        
    }
}`
    },
    hints: ['Two pointers tracking leftMax and rightMax inwards achieves O(1) extra space.'],
    optimalComplexity: { time: 'O(n)', space: 'O(1)' },
    solutionExplanation: 'Bidirectional two-pointer technique traps water based on limiting wall.'
  }
];

export function getQuestionById(id: string): CodingQuestion | undefined {
  return CODING_QUESTIONS.find(q => q.id.toLowerCase() === id.toLowerCase() || q.slug.toLowerCase() === id.toLowerCase());
}

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
      python: `def two_sum(nums, target):
    # Track complements in a hash map
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test run
print(two_sum([2, 7, 11, 15], 9))`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
      cpp: `#include <vector>
#include <unordered_map>
#include <iostream>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
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
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack

print(is_valid_parentheses("()[]{}"))`,
      javascript: `function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}

console.log(isValidParentheses("()[]{}"));`,
      typescript: `function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}

console.log(isValidParentheses("()[]{}"));`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>

bool isValid(std::string s) {
    std::stack<char> st;
    std::unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (map.count(c)) {
            if (st.empty() || st.top() != map[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
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
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit

print(max_profit([7, 1, 5, 3, 6, 4]))`,
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]));`,
      typescript: `function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]));`,
      cpp: `#include <vector>
#include <algorithm>

int maxProfit(std::vector<int>& prices) {
    int minPrice = 1e9;
    int maxP = 0;
    for (int p : prices) {
        minPrice = std::min(minPrice, p);
        maxP = std::max(maxP, p - minPrice);
    }
    return maxP;
}`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        return maxProfit;
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

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev`,
      javascript: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
      typescript: `interface ListNode {
  val: number;
  next: ListNode | null;
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
      cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
      java: `public class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
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
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        
        # Greedily move the shorter line inward
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
            
    return max_water

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,
      javascript: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));`,
      typescript: `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));`,
      cpp: `#include <vector>
#include <algorithm>

int maxArea(std::vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int maxWater = 0;
    while (left < right) {
        int w = right - left;
        int h = std::min(height[left], height[right]);
        maxWater = std::max(maxWater, w * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`,
      java: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int w = right - left;
            int h = Math.min(height[left], height[right]);
            maxWater = Math.max(maxWater, w * h);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
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
    char_map = {}
    left = 0
    max_len = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len

print(length_of_longest_substring("abcabcbb"))`,
      javascript: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb"));`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char)! >= left) {
      left = map.get(char)! + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb"));`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>

int lengthOfLongestSubstring(std::string s) {
    std::unordered_map<char, int> map;
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); ++right) {
        if (map.find(s[right]) != map.end() && map[s[right]] >= left) {
            left = map[s[right]] + 1;
        }
        map[s[right]] = right;
        maxLen = std::max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
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
    if n <= 2:
        return n
    first, second = 1, 2
    for _ in range(3, n + 1):
        first, second = second, first + second
    return second

print(climb_stairs(5))`,
      javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

console.log(climbStairs(5));`,
      typescript: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

console.log(climbStairs(5));`,
      cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
      java: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
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
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print(coin_change([1, 2, 5], 11))`,
      javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let x = coin; x <= amount; x++) {
      dp[x] = Math.min(dp[x], dp[x - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11));`,
      typescript: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let x = coin; x <= amount; x++) {
      dp[x] = Math.min(dp[x], dp[x - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11));`,
      cpp: `#include <vector>
#include <algorithm>

int coinChange(std::vector<int>& coins, int amount) {
    std::vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int x = coin; x <= amount; ++x) {
            dp[x] = std::min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int coin : coins) {
            for (int x = coin; x <= amount; x++) {
                dp[x] = Math.min(dp[x], dp[x - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
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
    current_sum = nums[0]
    max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum

print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
      javascript: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`,
      typescript: `function maxSubArray(nums: number[]): number {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`,
      cpp: `#include <vector>
#include <algorithm>

int maxSubArray(std::vector<int>& nums) {
    int currentSum = nums[0];
    int maxSum = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currentSum = std::max(nums[i], currentSum + nums[i]);
        maxSum = std::max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
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
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    islands = 0
    
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0' # mark visited
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)
                
    return islands`,
      javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islands++;
        dfs(r, c);
      }
    }
  }
  return islands;
}`,
      typescript: `function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islands++;
        dfs(r, c);
      }
    }
  }
  return islands;
}`,
      cpp: `#include <vector>

void dfs(std::vector<std::vector<char>>& grid, int r, int c) {
    int rows = grid.size();
    int cols = grid[0].size();
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
    grid[r][c] = '0';
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}

int numIslands(std::vector<std::vector<char>>& grid) {
    if (grid.empty()) return 0;
    int islands = 0;
    for (int r = 0; r < grid.size(); ++r) {
        for (int c = 0; c < grid[0].size(); ++c) {
            if (grid[r][c] == '1') {
                islands++;
                dfs(grid, r, c);
            }
        }
    }
    return islands;
}`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int islands = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    islands++;
                    dfs(grid, r, c);
                }
            }
        }
        return islands;
    }
    
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
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
      python: `class CircularQueue:
    def __init__(self, k: int):
        self.k = k
        self.queue = [0] * k
        self.head = 0
        self.count = 0

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        tail = (self.head + self.count) % self.k
        self.queue[tail] = value
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.head = (self.head + 1) % self.k
        self.count -= 1
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.queue[self.head]

    def Rear(self) -> int:
        if self.isEmpty():
            return -1
        tail = (self.head + self.count - 1) % self.k
        return self.queue[tail]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.k`,
      javascript: `class CircularQueue {
  constructor(k) {
    this.k = k;
    this.queue = new Array(k);
    this.head = 0;
    this.count = 0;
  }

  enQueue(value) {
    if (this.isFull()) return false;
    const tail = (this.head + this.count) % this.k;
    this.queue[tail] = value;
    this.count++;
    return true;
  }

  deQueue() {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.k;
    this.count--;
    return true;
  }

  Front() {
    return this.isEmpty() ? -1 : this.queue[this.head];
  }

  Rear() {
    if (this.isEmpty()) return -1;
    const tail = (this.head + this.count - 1) % this.k;
    return this.queue[tail];
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.k;
  }
}`,
      typescript: `class CircularQueue {
  private k: number;
  private queue: number[];
  private head: number = 0;
  private count: number = 0;

  constructor(k: number) {
    this.k = k;
    this.queue = new Array(k);
  }

  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    const tail = (this.head + this.count) % this.k;
    this.queue[tail] = value;
    this.count++;
    return true;
  }

  deQueue(): boolean {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.k;
    this.count--;
    return true;
  }

  Front(): number {
    return this.isEmpty() ? -1 : this.queue[this.head];
  }

  Rear(): number {
    if (this.isEmpty()) return -1;
    const tail = (this.head + this.count - 1) % this.k;
    return this.queue[tail];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.k;
  }
}`,
      cpp: `#include <vector>

class MyCircularQueue {
private:
    std::vector<int> q;
    int head, count, capacity;
public:
    MyCircularQueue(int k) : capacity(k), head(0), count(0), q(k) {}
    
    bool enQueue(int value) {
        if (isFull()) return false;
        q[(head + count) % capacity] = value;
        count++;
        return true;
    }
    
    bool deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        count--;
        return true;
    }
    
    int Front() {
        return isEmpty() ? -1 : q[head];
    }
    
    int Rear() {
        return isEmpty() ? -1 : q[(head + count - 1) % capacity];
    }
    
    bool isEmpty() { return count == 0; }
    bool isFull() { return count == capacity; }
};`,
      java: `class MyCircularQueue {
    private int[] q;
    private int head = 0, count = 0, capacity;
    
    public MyCircularQueue(int k) {
        this.capacity = k;
        this.q = new int[k];
    }
    
    public boolean enQueue(int value) {
        if (isFull()) return false;
        q[(head + count) % capacity] = value;
        count++;
        return true;
    }
    
    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        count--;
        return true;
    }
    
    public int Front() {
        return isEmpty() ? -1 : q[head];
    }
    
    public int Rear() {
        return isEmpty() ? -1 : q[(head + count - 1) % capacity];
    }
    
    public boolean isEmpty() { return count == 0; }
    public boolean isFull() { return count == capacity; }
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
    result = 0
    for num in nums:
        result ^= num
    return result

print(single_number([4, 1, 2, 1, 2]))`,
      javascript: `function singleNumber(nums) {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2]));`,
      typescript: `function singleNumber(nums: number[]): number {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2]));`,
      cpp: `#include <vector>

int singleNumber(std::vector<int>& nums) {
    int res = 0;
    for (int n : nums) res ^= n;
    return res;
}`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        int res = 0;
        for (int n : nums) res ^= n;
        return res;
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
      sql: `/* Write your PL/pgSQL or standard SQL query below */
WITH RankedSalaries AS (
    SELECT 
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (
            PARTITION BY e.departmentId 
            ORDER BY e.salary DESC
        ) AS rank_num
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE rank_num <= 3;`,
      python: `# Python / Pandas Data Engineering equivalence
import pandas as pd

def top_three_salaries(employee: pd.DataFrame, department: pd.DataFrame) -> pd.DataFrame:
    df = employee.merge(department, left_on='departmentId', right_on='id', suffixes=('_emp', '_dept'))
    df['rank'] = df.groupby('departmentId')['salary'].rank(method='dense', ascending=False)
    result = df[df['rank'] <= 3][['name_dept', 'name_emp', 'salary']]
    result.columns = ['Department', 'Employee', 'Salary']
    return result`,
      javascript: `// In-memory JavaScript simulation for interview questions
function departmentTopThreeSalaries(employees, departments) {
  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));
  const grouped = {};
  for (const emp of employees) {
    if (!grouped[emp.departmentId]) grouped[emp.departmentId] = [];
    grouped[emp.departmentId].push(emp);
  }
  const result = [];
  for (const [deptId, empList] of Object.entries(grouped)) {
    const uniqueSalaries = Array.from(new Set(empList.map(e => e.salary))).sort((a, b) => b - a).slice(0, 3);
    for (const emp of empList) {
      if (uniqueSalaries.includes(emp.salary)) {
        result.push({ Department: deptMap[deptId], Employee: emp.name, Salary: emp.salary });
      }
    }
  }
  return result;
}`,
      typescript: `interface Employee { id: number; name: string; salary: number; departmentId: number; }
interface Department { id: number; name: string; }

function topThreeSalaries(employees: Employee[], departments: Department[]) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const grouped = new Map<number, Employee[]>();
  for (const e of employees) {
    if (!grouped.has(e.departmentId)) grouped.set(e.departmentId, []);
    grouped.get(e.departmentId)!.push(e);
  }
  const res: { Department: string; Employee: string; Salary: number }[] = [];
  for (const [deptId, list] of grouped.entries()) {
    const topSalaries = Array.from(new Set(list.map(x => x.salary))).sort((a, b) => b - a).slice(0, 3);
    for (const emp of list) {
      if (topSalaries.includes(emp.salary)) {
        res.push({ Department: deptMap.get(deptId) || '', Employee: emp.name, Salary: emp.salary });
      }
    }
  }
  return res;
}`,
      cpp: `// SQL analytical problem`,
      java: `// SQL analytical problem`
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
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(search([-1, 0, 3, 5, 9, 12], 9))`,
      javascript: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(search([-1, 0, 3, 5, 9, 12], 9));`,
      typescript: `function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(search([-1, 0, 3, 5, 9, 12], 9));`,
      cpp: `#include <vector>

int search(std::vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
    description: `Implement a discrete **Proportional-Integral-Derivative (PID)** controller update step function.\n\nThe PID control signal is given by:\n$$u(t) = K_p \\cdot e(t) + K_i \\cdot \\int_0^t e(\\tau) d\\tau + K_d \\cdot \\frac{de(t)}{dt}$$\n\nIn discrete time with sampling interval \`dt\`:\n- Error: \`error = setpoint - current_value\`\n- Integral: \`integral += error * dt\` (with anti-windup clamping \`[-clamp, clamp]\`)\n- Derivative: \`derivative = (error - prev_error) / dt\`\n- Output: \`Kp * error + Ki * integral + Kd * derivative\`\n\nReturn the control effort \`output\` clamped within \`[-max_output, max_output]\`.`,
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
      python: `def pid_update(setpoint, current, kp, ki, kd, dt, integral, prev_error, max_out=100.0):
    error = setpoint - current
    new_integral = integral + error * dt
    # Anti-windup clamping
    new_integral = max(-50.0, min(50.0, new_integral))
    derivative = (error - prev_error) / dt if dt > 0 else 0
    output = kp * error + ki * new_integral + kd * derivative
    clamped_output = max(-max_out, min(max_out, output))
    return round(clamped_output, 2), round(new_integral, 2)

print(pid_update(100.0, 80.0, 1.5, 0.2, 0.05, 0.1, 0.0, 20.0))`,
      javascript: `function pidUpdate(setpoint, current, kp, ki, kd, dt, integral, prevError, maxOut = 100) {
  const error = setpoint - current;
  let newIntegral = integral + error * dt;
  newIntegral = Math.max(-50, Math.min(50, newIntegral)); // anti-windup
  const derivative = dt > 0 ? (error - prevError) / dt : 0;
  const output = kp * error + ki * newIntegral + kd * derivative;
  const clamped = Math.max(-maxOut, Math.min(maxOut, output));
  return { output: Number(clamped.toFixed(2)), integral: Number(newIntegral.toFixed(2)) };
}

console.log(pidUpdate(100, 80, 1.5, 0.2, 0.05, 0.1, 0, 20));`,
      typescript: `interface PIDResult {
  output: number;
  integral: number;
}

function pidUpdate(
  setpoint: number,
  current: number,
  kp: number,
  ki: number,
  kd: number,
  dt: number,
  integral: number,
  prevError: number,
  maxOut: number = 100
): PIDResult {
  const error = setpoint - current;
  let newIntegral = integral + error * dt;
  newIntegral = Math.max(-50, Math.min(50, newIntegral));
  const derivative = dt > 0 ? (error - prevError) / dt : 0;
  const output = kp * error + ki * newIntegral + kd * derivative;
  const clamped = Math.max(-maxOut, Math.min(maxOut, output));
  return { output: Number(clamped.toFixed(2)), integral: Number(newIntegral.toFixed(2)) };
}`,
      cpp: `#include <algorithm>

struct PIDResult { double output; double integral; };

PIDResult pidUpdate(double setpoint, double current, double kp, double ki, double kd, double dt, double integral, double prevError, double maxOut = 100.0) {
    double error = setpoint - current;
    double newIntegral = std::max(-50.0, std::min(50.0, integral + error * dt));
    double derivative = (dt > 0) ? (error - prevError) / dt : 0;
    double out = kp * error + ki * newIntegral + kd * derivative;
    double clamped = std::max(-maxOut, std::min(maxOut, out));
    return {clamped, newIntegral};
}`,
      java: `class PIDController {
    public static double[] update(double setpoint, double current, double kp, double ki, double kd, double dt, double integral, double prevError) {
        double error = setpoint - current;
        double newInt = Math.max(-50.0, Math.min(50.0, integral + error * dt));
        double deriv = dt > 0 ? (error - prevError) / dt : 0;
        double out = Math.max(-100.0, Math.min(100.0, kp * error + ki * newInt + kd * deriv));
        return new double[] { out, newInt };
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

def invert_tree(root):
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
      javascript: `function invertTree(root) {
  if (!root) return null;
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);
  return root;
}`,
      typescript: `interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);
  return root;
}`,
      cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    TreeNode* temp = root->left;
    root->left = invertTree(root->right);
    root->right = invertTree(temp);
    return root;
}`,
      java: `public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(temp);
        return root;
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
    nums.sort()
    result = []
    n = len(nums)
    
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, n - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
                
    return result

print(three_sum([-1, 0, 1, 2, -1, -4]))`,
      javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const n = nums.length;

  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = n - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4]));`,
      typescript: `function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  const n = nums.length;

  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = n - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
      cpp: `#include <vector>
#include <algorithm>

std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> res;
    int n = nums.size();
    for (int i = 0; i < n - 2; ++i) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s == 0) {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++; r--;
            } else if (s < 0) l++;
            else r--;
        }
    }
    return res;
}`,
      java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (s < 0) l++;
                else r--;
            }
        }
        return res;
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
    n = len(nums)
    output = [1] * n
    
    # Left prefix product
    prefix = 1
    for i in range(n):
        output[i] = prefix
        prefix *= nums[i]
        
    # Right suffix product
    suffix = 1
    for i in range(n - 1, -1, -1):
        output[i] *= suffix
        suffix *= nums[i]
        
    return output

print(product_except_self([1, 2, 3, 4]))`,
      javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const output = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    output[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    output[i] *= suffix;
    suffix *= nums[i];
  }
  return output;
}

console.log(productExceptSelf([1, 2, 3, 4]));`,
      typescript: `function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const output = new Array<number>(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    output[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    output[i] *= suffix;
    suffix *= nums[i];
  }
  return output;
}`,
      cpp: `#include <vector>

std::vector<int> productExceptSelf(std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> output(n, 1);
    int prefix = 1;
    for (int i = 0; i < n; ++i) {
        output[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n - 1; i >= 0; --i) {
        output[i] *= suffix;
        suffix *= nums[i];
    }
    return output;
}`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] output = new int[n];
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            output[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            output[i] *= suffix;
            suffix *= nums[i];
        }
        return output;
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
      python: `def is_valid_bst(root) -> bool:
    def validate(node, low=float('-inf'), high=float('inf')):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return validate(node.left, low, node.val) and validate(node.right, node.val, high)
    return validate(root)`,
      javascript: `function isValidBST(root) {
  function validate(node, low, high) {
    if (!node) return true;
    if (node.val <= low || node.val >= high) return false;
    return validate(node.left, low, node.val) && validate(node.right, node.val, high);
  }
  return validate(root, -Infinity, Infinity);
}`,
      typescript: `interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; }

function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, low: number, high: number): boolean {
    if (!node) return true;
    if (node.val <= low || node.val >= high) return false;
    return validate(node.left, low, node.val) && validate(node.right, node.val, high);
  }
  return validate(root, -Infinity, Infinity);
}`,
      cpp: `#include <climits>

struct TreeNode { int val; TreeNode *left; TreeNode *right; };

bool validate(TreeNode* node, long long low, long long high) {
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return validate(node->left, low, node->val) && validate(node->right, node->val, high);
}

bool isValidBST(TreeNode* root) {
    return validate(root, -1e18, 1e18);
}`,
      java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    private boolean validate(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return validate(node.left, low, node.val) && validate(node.right, node.val, high);
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
      python: `def multiply_matrices(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    if not A or not B or len(A[0]) != len(B):
        return []
    
    m, k, n = len(A), len(A[0]), len(B[0])
    C = [[0.0] * n for _ in range(m)]
    
    for i in range(m):
        for p in range(k):
            if A[i][p] != 0:
                for j in range(n):
                    C[i][j] += A[i][p] * B[p][j]
                    
    return C

print(multiply_matrices([[1, 2], [3, 4]], [[5, 6], [7, 8]]))`,
      javascript: `function multiplyMatrices(A, B) {
  if (!A.length || !B.length || A[0].length !== B.length) return [];
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C = Array.from({ length: m }, () => new Array(n).fill(0));

  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      if (A[i][p] !== 0) {
        for (let j = 0; j < n; j++) {
          C[i][j] += A[i][p] * B[p][j];
        }
      }
    }
  }
  return C;
}

console.log(multiplyMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]]));`,
      typescript: `function multiplyMatrices(A: number[][], B: number[][]): number[][] {
  if (!A.length || !B.length || A[0].length !== B.length) return [];
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      if (A[i][p] !== 0) {
        for (let j = 0; j < n; j++) {
          C[i][j] += A[i][p] * B[p][j];
        }
      }
    }
  }
  return C;
}`,
      cpp: `#include <vector>

std::vector<std::vector<double>> multiplyMatrices(const std::vector<std::vector<double>>& A, const std::vector<std::vector<double>>& B) {
    if (A.empty() || B.empty() || A[0].size() != B.size()) return {};
    int m = A.size(), k = A[0].size(), n = B[0].size();
    std::vector<std::vector<double>> C(m, std::vector<double>(n, 0.0));
    for (int i = 0; i < m; ++i) {
        for (int p = 0; p < k; ++p) {
            if (A[i][p] != 0.0) {
                for (int j = 0; j < n; ++j) {
                    C[i][j] += A[i][p] * B[p][j];
                }
            }
        }
    }
    return C;
}`,
      java: `class Solution {
    public double[][] multiplyMatrices(double[][] A, double[][] B) {
        if (A.length == 0 || B.length == 0 || A[0].length != B.length) return new double[0][0];
        int m = A.length, k = A[0].length, n = B[0].length;
        double[][] C = new double[m][n];
        for (int i = 0; i < m; i++) {
            for (int p = 0; p < k; p++) {
                if (A[i][p] != 0.0) {
                    for (int j = 0; j < n; j++) {
                        C[i][j] += A[i][p] * B[p][j];
                    }
                }
            }
        }
        return C;
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
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        self.cache[key] = value`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
      typescript: `class LRUCache {
  private capacity: number;
  private map: Map<number, number>;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map<number, number>();
  }
  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
      cpp: `// C++ LRU Cache with std::list and std::unordered_map`,
      java: `// Java LinkedHashMap Solution`
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
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged

print(merge([[1,3],[2,6],[8,10],[15,18]]))`,
      javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const prev = result[result.length - 1];
    if (current[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], current[1]);
    } else {
      result.push(current);
    }
  }
  return result;
}

console.log(merge([[1,3],[2,6],[8,10],[15,18]]));`,
      typescript: `function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const prev = result[result.length - 1];
    if (current[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], current[1]);
    } else {
      result.push(current);
    }
  }
  return result;
}`,
      cpp: `// C++ Merge Intervals with std::sort`,
      java: `// Java Solution`
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
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))`,
      javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
      typescript: `function trap(height: number[]): number {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
      cpp: `// C++ solution`,
      java: `// Java solution`
    },
    hints: ['Two pointers tracking leftMax and rightMax inwards achieves O(1) extra space.'],
    optimalComplexity: { time: 'O(n)', space: 'O(1)' },
    solutionExplanation: 'Bidirectional two-pointer technique traps water based on limiting wall.'
  }
];

export function getQuestionById(id: string): CodingQuestion | undefined {
  return CODING_QUESTIONS.find(q => q.id.toLowerCase() === id.toLowerCase() || q.slug.toLowerCase() === id.toLowerCase());
}

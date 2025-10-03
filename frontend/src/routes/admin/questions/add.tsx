import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Navbar from "@/src/components/Navbar";
import { redirectIfNotAuthenticated } from "@/src/hooks/user-hooks";

export const Route = createFileRoute("/admin/questions/add")({
  component: RouteComponent,
});

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const CATEGORY_OPTIONS = [
  "Array",
  "String", 
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Database",
  "Breadth-First Search",
  "Tree",
  "Matrix",
  "Two Pointers",
  "Binary Tree",
  "Bit Manipulation",
  "Stack",
  "Design",
  "Heap (Priority Queue)",
  "Graph",
  "Simulation",
  "Backtracking",
  "Linked List",
  "Union Find",
  "Sliding Window",
  "Divide and Conquer",
  "Recursion",
  "Trie"
];

function RouteComponent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "",
    categories: [] as string[],
    question: ""
  });
  
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  redirectIfNotAuthenticated();


  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(cat => cat !== categoryToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }
    
    if (!formData.difficulty) {
      alert("Difficulty is required");
      return;
    }
    
    if (formData.categories.length === 0) {
      alert("At least one category is required");
      return;
    }
    
    if (!formData.question.trim()) {
      alert("Question description is required");
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the question service API
      console.log("Submitting question:", formData);
      const response = await fetch('http://localhost:5001/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          difficulty: formData.difficulty,
          categories: formData.categories,
          question: formData.question
        })
      });

      if (response.ok) {
        console.log('Question created successfully');
        // Navigate back to admin questions page
        navigate({ to: '/admin/questions' });
      } else {
        throw new Error('Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/admin/questions' });
  };

  return (
    <div>
      <Navbar />
      holy shit
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Two Sum"
                  required
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories *</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
                      placeholder="Search and select categories..."
                      className="pr-10"
                    />
                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {CATEGORY_OPTIONS
                          .filter(cat => 
                            !formData.categories.includes(cat) && 
                            (categoryInput === '' || cat.toLowerCase().includes(categoryInput.toLowerCase()))
                          )
                          .map(category => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  categories: [...formData.categories, category]
                                });
                                setCategoryInput("");
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                            >
                              {category}
                            </button>
                          ))
                        }
                        {CATEGORY_OPTIONS
                          .filter(cat => 
                            !formData.categories.includes(cat) && 
                            (categoryInput === '' || cat.toLowerCase().includes(categoryInput.toLowerCase()))
                          ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No categories found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected Categories */}
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map(category => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category)}
                          className="ml-1 text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Question (Markdown) */}
              <div className="space-y-2">
                <Label htmlFor="question">Question Description (Markdown) *</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question description in markdown format...

Example:
Given an array of integers `nums` and an integer `target`, return *indices* of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```"
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500">
                  You can use markdown formatting: **bold**, *italic*, `code`, ```code blocks```, etc.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Question'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{formData.title || "Question Title"}</h3>
              </div>
              
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">Difficulty:</span>
                {formData.difficulty && (
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    formData.difficulty === 'Easy' ? 'text-green-600 bg-green-50 border-green-200' :
                    formData.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    {formData.difficulty}
                  </span>
                )}
              </div>

              {formData.categories.length > 0 && (
                <div className="flex gap-2 items-start">
                  <span className="text-sm font-medium">Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.categories.map(category => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-medium">Question:</span>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {formData.question || "Question description will appear here..."}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
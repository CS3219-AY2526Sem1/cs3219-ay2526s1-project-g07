import { useState, useEffect } from "react";
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

export const Route = createFileRoute("/admin/questions/$questionId")({
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
  redirectIfNotAuthenticated();

  const navigate = useNavigate();
  const { questionId } = Route.useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "",
    topics: [] as string[],
    question: ""
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Load question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoadingQuestion(true);
        const response = await fetch(`/api/questions/${questionId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }

        const data = await response.json();
        console.log('Fetched question:', data);

        // The API returns the question object directly
        const question = data.question || data;
        setFormData({
          title: question.title || "",
          difficulty: question.difficulty || "",
          topics: question.topics || [],
          question: question.question || ""
        });
      } catch (error) {
        console.error('Error fetching question:', error);
        alert('Failed to load question. Redirecting back to questions list.');
        navigate({ to: '/admin/questions' });
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, navigate]);

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter(cat => cat !== categoryToRemove)
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

    if (formData.topics.length === 0) {
      alert("At least one category is required");
      return;
    }

    if (!formData.question.trim()) {
      alert("Question description is required");
      return;
    }

    setIsLoading(true);

    try {
      // Call the question service API to update
      console.log("Updating question:", formData);
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          difficulty: formData.difficulty,
          topics: formData.topics,
          question: formData.question
        })
      });

      if (response.ok) {
        console.log('Question updated successfully');
        // Navigate back to admin questions page
        navigate({ to: '/admin/questions' });
      } else {
        throw new Error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/admin/questions' });
  };

  if (isLoadingQuestion) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading question...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Question</CardTitle>
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

              {/* Topics */}
              <div className="space-y-2">
                <Label>Topics *</Label>
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
                            !formData.topics.includes(cat) &&
                            (categoryInput === '' || cat.toLowerCase().includes(categoryInput.toLowerCase()))
                          )
                          .map(category => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  topics: [...formData.topics, category]
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
                            !formData.topics.includes(cat) &&
                            (categoryInput === '' || cat.toLowerCase().includes(categoryInput.toLowerCase()))
                          ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No topics found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Topics */}
                {formData.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.topics.map(category => (
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
                  {isLoading ? 'Updating...' : 'Update Question'}
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
      </div>
    </div>
  );
}
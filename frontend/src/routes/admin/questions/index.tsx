import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { redirectIfNotAuthenticated, useIsAdmin } from "@/src/hooks/user-hooks";
import Navbar from "../../../components/Navbar";

interface Question {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  topics: string[];
}
export const Route = createFileRoute("/admin/questions/")({
  component: RouteComponent,
});

function RouteComponent() {
  redirectIfNotAuthenticated();

  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title-asc");
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  // Get unique topics from all questions
  const allTopics = Array.from(
    new Set(questions.flatMap((q) => q.topics))
  ).sort();

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/questions");

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        console.log("Fetched questions:", data);

        // The API returns { message, questions, count }
        const questionsData = data.questions || [];
        setQuestions(questionsData);
        setFilteredQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Keep empty state on error
        setQuestions([]);
        setFilteredQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter and sort questions
  useEffect(() => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.difficulty
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          question.topics.some((topic) =>
            topic.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (question) =>
          question.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    // Apply topic filter
    if (topicFilter !== "all") {
      filtered = filtered.filter((question) =>
        question.topics.includes(topicFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "difficulty-asc": {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            (difficultyOrder[
              a.difficulty.toLowerCase() as keyof typeof difficultyOrder
            ] || 0) -
            (difficultyOrder[
              b.difficulty.toLowerCase() as keyof typeof difficultyOrder
            ] || 0)
          );
        }
        case "difficulty-desc": {
          const difficultyOrderDesc = { easy: 1, medium: 2, hard: 3 };
          return (
            (difficultyOrderDesc[
              b.difficulty.toLowerCase() as keyof typeof difficultyOrderDesc
            ] || 0) -
            (difficultyOrderDesc[
              a.difficulty.toLowerCase() as keyof typeof difficultyOrderDesc
            ] || 0)
          );
        }
        default:
          return 0;
      }
    });

    setFilteredQuestions(filtered);
  }, [searchTerm, questions, difficultyFilter, topicFilter, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove question from local state
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        console.log("Question deleted successfully");
      } else {
        throw new Error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  if (isAdminLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Checking permissions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" />;
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading questions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Questions Management</CardTitle>
              <Link to="/admin/questions/add">
                <Button>Add Question</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search questions by title, difficulty, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md flex-1"
                />
              </div>

              <div className="flex gap-4 flex-wrap items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Difficulty:</span>
                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Topic:</span>
                  <Select value={topicFilter} onValueChange={setTopicFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {allTopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Title (A-Z)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="difficulty-asc">
                        Difficulty (Easy-Hard)
                      </SelectItem>
                      <SelectItem value="difficulty-desc">
                        Difficulty (Hard-Easy)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm ||
                  difficultyFilter !== "all" ||
                  topicFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setDifficultyFilter("all");
                      setTopicFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Title
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Difficulty
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Topics
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-24 text-center">
                          {loading
                            ? "Loading questions..."
                            : searchTerm
                              ? "No questions found matching your search."
                              : "No questions available. Add some questions to get started!"}
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => (
                        <tr
                          key={question.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="font-medium">{question.title}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}
                            >
                              {question.difficulty}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {question.topics.map((topic) => (
                                <span
                                  key={topic}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  {/* <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedQuestion(question)
                                    }
                                  >
                                    View
                                  </Button> */}
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {selectedQuestion?.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Difficulty
                                      </h4>
                                      <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(selectedQuestion?.difficulty || "")}`}
                                      >
                                        {selectedQuestion?.difficulty}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Topics
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedQuestion?.topics.map(
                                          (topic) => (
                                            <span
                                              key={topic}
                                              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                            >
                                              {topic}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Question
                                      </h4>
                                      <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm leading-relaxed">
                                          {selectedQuestion?.question}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Link
                                to="/admin/questions/$questionId"
                                params={{ questionId: question.id }}
                              >
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(question.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from "../../../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { redirectIfNotAuthenticated } from "@/src/hooks/user-hooks";

interface Question {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  topics: string[];
}
export const Route = createFileRoute('/admin/questions/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  redirectIfNotAuthenticated();

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/questions');

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        console.log('Fetched questions:', data);

        // The API returns { message, questions, count }
        const questionsData = data.questions || [];
        setQuestions(questionsData);
        setFilteredQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Keep empty state on error
        setQuestions([]);
        setFilteredQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter questions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.topics.some(topic =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove question from local state
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        console.log('Question deleted successfully');
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };



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
            <div className="flex gap-4 mt-4">
              <Input
                placeholder="Search questions by title, difficulty, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Difficulty</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Topics</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-24 text-center">
                          {loading ? (
                            "Loading questions..."
                          ) : searchTerm ? (
                            "No questions found matching your search."
                          ) : (
                            "No questions available. Add some questions to get started!"
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => (
                        <tr key={question.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{question.title}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {question.topics.map((topic, index) => (
                                <span
                                  key={index}
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedQuestion(question)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{selectedQuestion?.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Difficulty</h4>
                                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(selectedQuestion?.difficulty || '')}`}>
                                        {selectedQuestion?.difficulty}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Topics</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedQuestion?.topics.map((topic, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                          >
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Question</h4>
                                      <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm leading-relaxed">{selectedQuestion?.question}</p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Link to="/admin/questions/$questionId" params={{ questionId: question.id }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
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

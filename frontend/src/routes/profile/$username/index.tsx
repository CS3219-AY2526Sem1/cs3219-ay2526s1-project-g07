import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSession } from "@/lib/auth-client";
import Navbar from "@/src/components/Navbar";
import { redirectIfNotAuthenticated } from "@/src/hooks/user-hooks";

export const Route = createFileRoute("/profile/$username/")({
  component: RouteComponent,
  loader: async () => {
    const userInfo = await getSession();
    const userId = userInfo?.data?.user.id;

    try {
      const response = await fetch(`/api/user/getUserData/${userId}`);
      const data = await response.json();
      console.log("Profile data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  },
});

function RouteComponent() {
  redirectIfNotAuthenticated();

  const { username } = Route.useParams();
  const data = Route.useLoaderData();

  const [formData, setFormData] = useState({
    username: data?.name || username,
    description: data?.description || "No description available",
    profileImage: data?.profileImage || null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    data?.profileImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Resize to max 400x400 while maintaining aspect ratio
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to 70% quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setPreviewImage(compressedImage);
      setFormData({ ...formData, profileImage: compressedImage });
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Error processing image");
    }
  };

  const handleSave = async () => {
    console.log("hello");
    setIsLoading(true);

    try {
      const userInfo = await getSession();
      const userId = userInfo?.data?.user.id;

      // TODO: Replace with actual API call to save data
      const response = await fetch(`/api/user/updateUserData/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.username,
          description: formData.description,
          profileImage: formData.profileImage,
        }),
      });

      if (response.ok) {
        console.log("Profile updated successfully");
        setIsOpen(false);
        // Optionally refresh the page or update local state
        window.location.reload();
      } else {
        console.error("Error updating profile");
        alert("Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Use data from backend or fallback values
  const displayName = data?.name || username;
  const displayDescription = data?.description || "No description available";
  const displayImage = data?.profileImage;

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={displayImage || undefined} />
                <AvatarFallback className="text-3xl">
                  {getUserInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Username:</p>
              <p className="text-lg">{displayName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Description:</p>
              <p className="text-gray-600">{displayDescription}</p>
            </div>
            <div className="pt-4">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={previewImage || undefined} />
                        <AvatarFallback className="text-2xl">
                          {getUserInitials(formData.username)}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Profile Picture
                      </Button>
                      <p className="text-xs text-gray-500">Max 5MB</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: Label is correctly associated with input below */}
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter your description here..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

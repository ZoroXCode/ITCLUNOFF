"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      // Store in local storage or session
      localStorage.setItem("userInfo", JSON.stringify(formData));
      router.push("/quiz"); // Redirect to quiz page
    } else {
      alert("Please enter both your name and email.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="min-w-[400px] w-full p-4 lg:max-w-[600px]">
        <CardTitle className="text-2xl text-center mb-6">
          <span>Z</span>Quiz
        </CardTitle>
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 text-md">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="What is your name?"
                className="h-11"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 text-md">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="Enter your email"
                className="h-11"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="h-11 mt-4 w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

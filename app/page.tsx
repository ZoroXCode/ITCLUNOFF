"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
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
          <div>
            <Label htmlFor="name" className="mb-2 text-md">
              Name
            </Label>
            <Input
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
              name="email"
              placeholder="Enter your email?"
              className="h-11"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <Button onClick={handleSubmit} className="h-11">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

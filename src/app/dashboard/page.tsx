import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Learn more about Rakshak",
};

export default function DashboardPage() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <h1 className="font-semibold">Rakshak Dashboard</h1>
    </div>
  );
}


import React from "react";
import Header from "@/components/Header";
import IdeaFeed from "@/components/IdeaFeed";
import { ideas } from "@/data/ideas";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 pb-2 px-0 sm:px-4 max-w-screen-md mx-auto">
        <IdeaFeed ideas={ideas} />
      </div>
    </div>
  );
};

export default Index;

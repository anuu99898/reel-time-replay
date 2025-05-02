
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import IdeaFeed from "@/components/IdeaFeed";
import { ideas } from "@/data/ideas";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 pb-2 px-0 sm:px-4 max-w-screen-md mx-auto">
        <IdeaFeed ideas={ideas} className="idea-feed" />
      </div>
    </div>
  );
};

export default Index;


import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  thumbnail?: string;
  user?: {
    username: string;
    avatar: string;
  };
}

const SearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Handle keyboard shortcut to open search
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const searchIdeas = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data: ideaResults, error } = await supabase
          .from("ideas")
          .select("id, title, description, thumbnail_url, type, user_id, profiles:profiles(username, avatar_url)")
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
          .limit(5);

        if (error) throw error;

        const formattedResults = ideaResults.map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          type: idea.type,
          thumbnail: idea.thumbnail_url,
          user: idea.profiles ? {
            username: idea.profiles.username || "User",
            avatar: idea.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${idea.user_id}`
          } : undefined
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const handler = setTimeout(() => {
      searchIdeas();
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelectResult = (id: string) => {
    // Save to recent searches
    const search = query.trim();
    if (search) {
      const updatedSearches = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
    
    navigate(`/idea/${id}`);
    setOpen(false);
    setQuery("");
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <>
      <div className="relative" ref={searchRef}>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="md:w-40 justify-start text-left text-gray-400"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Search ideas...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            ⌘K
          </kbd>
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search ideas, tags, or users..."
          value={query}
          onValueChange={setQuery}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <CommandList>
          {isLoading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => setQuery(search)}
                  className="flex items-center"
                >
                  <Search className="mr-2 h-4 w-4 opacity-40" />
                  {search}
                </CommandItem>
              ))}
              <div className="px-2 py-1.5 text-xs flex justify-end">
                <button
                  onClick={handleClearRecentSearches}
                  className="text-gray-400 hover:text-gray-100"
                >
                  Clear recent searches
                </button>
              </div>
            </CommandGroup>
          )}

          {query && !isLoading && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Ideas">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelectResult(result.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-medium truncate">
                        {result.title}
                      </h4>
                      {result.user && (
                        <div className="flex items-center text-xs text-gray-400">
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={result.user.avatar} />
                            <AvatarFallback>
                              {result.user.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          @{result.user.username}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;

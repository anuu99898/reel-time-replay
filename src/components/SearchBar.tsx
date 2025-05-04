
import React, { useState, useRef, useEffect } from "react";
import { Search, X, TagIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { searchIdeas, searchTags } from "@/integrations/supabase/database";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  description?: string;
  thumbnail?: string;
  user?: {
    username: string;
    avatar: string;
    id: string;
  };
}

interface TagResult {
  name: string;
}

const SearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tagResults, setTagResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
        localStorage.removeItem("recentSearches");
      }
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
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setTagResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search for ideas
        const ideaResults = await searchIdeas(query, 5);
        setResults(ideaResults);
        
        // Search for tags
        const tags = await searchTags(query, 3);
        setTagResults(tags);
        
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const handler = setTimeout(() => {
      performSearch();
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

  const handleSelectTag = (tag: string) => {
    // Navigate to search results for this tag
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
    setOpen(false);
    setQuery("");
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setTagResults([]);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const renderResultItem = (result: SearchResult) => (
    <CommandItem
      key={result.id}
      onSelect={() => handleSelectResult(result.id)}
      className="py-2"
    >
      <div className="flex items-center gap-3 w-full">
        {result.thumbnail ? (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="w-10 h-10 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${result.id}`;
            }}
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
        <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300">
          {result.type}
        </Badge>
      </div>
    </CommandItem>
  );

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
        <div className="relative">
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
        </div>
        
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

          {query && !isLoading && results.length === 0 && tagResults.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {tagResults.length > 0 && (
            <CommandGroup heading="Tags">
              {tagResults.map((tag) => (
                <CommandItem
                  key={tag}
                  onSelect={() => handleSelectTag(tag)}
                  className="flex items-center gap-2"
                >
                  <TagIcon size={16} className="text-gray-400" />
                  <span>#{tag}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.length > 0 && (
            <>
              {tagResults.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Ideas">
                {results.map(renderResultItem)}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;

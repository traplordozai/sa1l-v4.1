"use client"

// File: apps/frontend/components/shared/NaturalLanguageSearch.tsx
import { useDebounce } from "@/hooks/utils/useDebounce"
import { useCallback, useEffect, useState } from "react"
import Button from "../ui/Button"

interface ParsedFilter {
  field: string
  operator: string
  value: string | number | boolean
}

interface NaturalLanguageSearchProps {
  onSearch: (filters: ParsedFilter[]) => void
  placeholder?: string
  initialQuery?: string
  className?: string
  debounceMs?: number
  loading?: boolean
  examples?: string[]
}

/**
 * A natural language search component that parses user queries into structured filters
 */
export default function NaturalLanguageSearch({
  onSearch,
  placeholder = "Search using natural language...",
  initialQuery = "",
  className = "",
  debounceMs = 300,
  loading = false,
  examples = [
    "users where name contains John",
    "documents created after 2023-01-01",
    "projects with status = active and dueDate < today",
  ],
}: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter[]>([])
  const [showExamples, setShowExamples] = useState(false)

  const debouncedQuery = useDebounce(query, debounceMs)

  // Parse the query into structured filters
  const parseQuery = useCallback(async (input: string) => {
    if (!input.trim()) {
      setParsedFilters([])
      return []
    }

    try {
      // Natural language parsing logic
      // This can be enhanced with the DeepSeek integration
      // or more complex regex patterns

      // Simple parsing example
      const filters: ParsedFilter[] = []

      // Match patterns like "field operator value" with common operators
      const patterns = [
        // "field contains value"
        /(\w+)\s+contains\s+(.+?)(?:\s+and|\s+or|$)/g,
        // "field = value"
        /(\w+)\s+=\s+(.+?)(?:\s+and|\s+or|$)/g,
        // "field > value"
        /(\w+)\s+>\s+(.+?)(?:\s+and|\s+or|$)/g,
        // "field < value"
        /(\w+)\s+<\s+(.+?)(?:\s+and|\s+or|$)/g,
        // "field after value" (for dates)
        /(\w+)\s+after\s+(.+?)(?:\s+and|\s+or|$)/g,
        // "field before value" (for dates)
        /(\w+)\s+before\s+(.+?)(?:\s+and|\s+or|$)/g,
      ]

      patterns.forEach((pattern) => {
        let match
        while ((match = pattern.exec(input)) !== null) {
          const [, field, value] = match

          // Determine operator from the pattern
          let operator = "contains"
          if (pattern.source.includes("=")) operator = "eq"
          if (pattern.source.includes(">")) operator = "gt"
          if (pattern.source.includes("<")) operator = "lt"
          if (pattern.source.includes("after")) operator = "gt"
          if (pattern.source.includes("before")) operator = "lt"

          filters.push({
            field: field.trim(),
            operator,
            value: value.trim(),
          })
        }
      })

      setParsedFilters(filters)
      return filters

      // For enhanced parsing with DeepSeek, you could use:
      // const response = await fetch('/api/search/parse', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query: input })
      // });
      // const data = await response.json();
      // return data.filters || [];
    } catch (error) {
      console.error("Error parsing query:", error)
      return []
    }
  }, [])

  // Process query changes
  useEffect(() => {
    const processQuery = async () => {
      const filters = await parseQuery(debouncedQuery)
      onSearch(filters)
    }

    processQuery()
  }, [debouncedQuery, parseQuery, onSearch])

  // Handle example click
  const handleExampleClick = useCallback((example: string) => {
    setQuery(example)
    setShowExamples(false)
  }, [])

  return (
    <div className={className}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 pl-10 pr-4 border rounded-md shadow-sm focus:ring-westernPurple focus:border-westernPurple"
          disabled={loading}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {/* Example suggestions */}
      <div className="mt-1 flex items-center">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-xs text-gray-500 hover:text-westernPurple focus:outline-none"
        >
          {showExamples ? "Hide examples" : "Show examples"}
        </button>

        {query && (
          <button
            onClick={() => setQuery("")}
            className="ml-3 text-xs text-gray-500 hover:text-westernPurple focus:outline-none"
          >
            Clear
          </button>
        )}
      </div>

      {showExamples && (
        <div className="mt-2 bg-gray-50 p-2 rounded-md text-sm">
          <p className="text-gray-700 mb-1">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-westernPurple hover:underline text-xs"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parsed filters display */}
      {parsedFilters.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {parsedFilters.map((filter, index) => (
              <div key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center">
                <span className="font-medium">{filter.field}</span>
                <span className="mx-1 text-gray-500">{filter.operator}</span>
                <span className="text-westernPurple">"{filter.value}"</span>
                <button
                  onClick={() => {
                    const newFilters = [...parsedFilters]
                    newFilters.splice(index, 1)
                    setParsedFilters(newFilters)
                    onSearch(newFilters)
                  }}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setParsedFilters([])
                setQuery("")
                onSearch([])
              }}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Utility function to parse a query string into structured filters
 * @param input The query string to parse
 * @returns Promise with parsed filters
 */
export async function parseQueryToFilter(input: string): Promise<ParsedFilter[]> {
  try {
    const response = await fetch("/api/search/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    })
    const json = await response.json()
    return json.filters || []
  } catch (error) {
    console.error("Error parsing query:", error)
    return []
  }
}


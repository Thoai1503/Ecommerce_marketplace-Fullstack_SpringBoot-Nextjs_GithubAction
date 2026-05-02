"use client";

import { API_URL } from "@/helper/api";
import { Search, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const unwrapCollection = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const cleanSuggestion = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const toSuggestionText = (value: string) =>
  cleanSuggestion(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const knownBrands = ["samsung", "xiaomi", "sony", "lg", "philips", "panasonic", "toshiba", "casper"];

const hasWholeWord = (text: string, word: string) =>
  text.split(/\s+/).some((item) => normalizeText(item) === normalizeText(word));

const hasConflictingBrand = (keyword: string, suggestion: string) => {
  const keywordBrands = knownBrands.filter((brand) => hasWholeWord(keyword, brand));
  if (keywordBrands.length === 0) return false;

  return knownBrands.some(
    (brand) => !keywordBrands.includes(brand) && hasWholeWord(suggestion, brand),
  );
};

const buildFallbackSuggestions = (value: string) => {
  const keyword = toSuggestionText(value);
  if (!keyword) return [];

  const alreadyHasBrand = knownBrands.some((brand) => hasWholeWord(keyword, brand));
  const brandSuggestions = alreadyHasBrand
    ? []
    : knownBrands.slice(0, 2).map((brand) => `${keyword} ${brand}`);

  return [
    `${keyword} 32 inch`,
    `${keyword} 43 inch`,
    `${keyword} 55 inch`,
    ...brandSuggestions,
    `${keyword} gia re`,
    `${keyword} chinh hang`,
    `${keyword} gia re thanh ly`,
  ].filter((suggestion) => normalizeText(suggestion) !== normalizeText(keyword));
};

const getSuggestionText = (item: any) =>
  cleanSuggestion(typeof item === "string" ? item : item?.text || item?.name || item?.value);

const getSuggestionType = (item: any) =>
  cleanSuggestion(typeof item === "string" ? "" : item?.type);

const suggestionTypeLabel: Record<string, string> = {
  category: "Category",
  product: "Product",
  brand: "Brand",
  unit: "Unit",
  attribute: "Attribute",
  value: "Value",
};

export default function HeaderSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<{ text: string; type: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setKeyword(params.get("keyword") || params.get("q") || "");
  }, []);

  const normalizedKeyword = keyword.trim();
  const showSuggestions = isFocused && normalizedKeyword.length > 0;

  const navigateToSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      router.push("/");
      return;
    }

    setIsFocused(false);
    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  const submitSuggestion = (value: string) => {
    setKeyword(value);
    setIsFocused(false);
    router.push(`/search?keyword=${encodeURIComponent(value.trim())}`);
  };

  useEffect(() => {
    const value = normalizedKeyword;

    if (!value) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/product/suggestions?keyword=${encodeURIComponent(value)}&limit=10`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          setSuggestions(buildFallbackSuggestions(value).map((text) => ({ text, type: "" })));
          return;
        }

        const rows = unwrapCollection(await res.json());
        const apiSuggestions = rows
          .map((item) => ({
            text: toSuggestionText(getSuggestionText(item)),
            type: getSuggestionType(item),
          }))
          .filter((item) => item.text.length > 0)
          .filter((item) => !hasConflictingBrand(value, item.text));

        const fallbackSuggestions = buildFallbackSuggestions(value).map((text) => ({
          text,
          type: "",
        }));

        const seen = new Set<string>();
        const next = [...apiSuggestions, ...fallbackSuggestions]
          .filter((item) => {
            const key = normalizeText(item.text);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 9);

        setSuggestions(next);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setSuggestions(buildFallbackSuggestions(value).map((text) => ({ text, type: "" })));
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedKeyword]);

  const visibleSuggestions = useMemo(
    () =>
      suggestions.filter(
        (item) => item.text.toLowerCase() !== normalizedKeyword.toLowerCase(),
      ),
    [suggestions, normalizedKeyword],
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(keyword);
  };

  return (
    <div className="headerSearchWrap">
      <form className="search-box d-flex align-items-center" onSubmit={submitSearch}>
        <input
          type="search"
          className="form-control border-0"
          placeholder="Find your favorite products, brands, and shops..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 140)}
          aria-label="Search products"
          autoComplete="off"
        />
        <button className="btn btn-search m-1 px-3" type="submit" aria-label="Search">
          <Search size={20} />
        </button>
      </form>

      {showSuggestions && (
        <div className="searchSuggestPanel">
          <button
            type="button"
            className="searchSuggestItem searchSuggestShop"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => submitSuggestion(normalizedKeyword)}
          >
            <Store size={16} />
            <span>Find Shop "{normalizedKeyword}"</span>
          </button>

          {isLoading && visibleSuggestions.length === 0 ? (
            <div className="searchSuggestMuted">Finding suggestions...</div>
          ) : (
            visibleSuggestions.map((suggestion) => (
              <button
                type="button"
                key={`${suggestion.type}-${suggestion.text}`}
                className="searchSuggestItem"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submitSuggestion(suggestion.text)}
              >
                <span>{suggestion.text}</span>
                {suggestion.type && (
                  <span className="searchSuggestType">
                    {suggestionTypeLabel[suggestion.type] || suggestion.type}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

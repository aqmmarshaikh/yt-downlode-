"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowRight, ClipboardPaste, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isValidUrl, sanitizeUrl } from "@/utils/url-validator";
import { SUBMIT_DEBOUNCE_MS } from "@/utils/constants";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export function UrlInput({ onSubmit, isLoading, onClear }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = useCallback(() => {
    setUrl("");
    setError(null);
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const sanitized = sanitizeUrl(text);
        setUrl(sanitized);
        setError(null);
        if (isValidUrl(sanitized)) {
          handleSubmitUrl(sanitized);
        }
      }
    } catch {
      // Clipboard access denied — silently ignore
    }
  };

  const handleSubmitUrl = (targetUrl: string) => {
    const now = Date.now();
    // Anti-spam: debounce rapid submissions
    if (now - lastSubmitTime < SUBMIT_DEBOUNCE_MS) return;

    const sanitized = sanitizeUrl(targetUrl);

    if (!sanitized) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(sanitized)) {
      setError("Please enter a valid URL (e.g., https://youtube.com/watch?v=...)");
      return;
    }

    setError(null);
    setLastSubmitTime(now);
    onSubmit(sanitized);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitUrl(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (error) setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <Card className="p-2 sm:p-3 transition-all duration-300 hover:border-border/20">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2"
          role="search"
          aria-label="Media URL input"
        >
          {/* Link Icon */}
          <div className="hidden sm:flex items-center justify-center h-10 w-10 shrink-0 rounded-lg bg-muted/50">
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="url"
            placeholder="Paste a media URL here..."
            value={url}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
            aria-label="Media URL"
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
            className="flex-1 h-12 bg-transparent border-0 text-base sm:text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Paste Button */}
            <AnimatePresence>
              {!url && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handlePaste}
                    aria-label="Paste URL from clipboard"
                    className="gap-1.5 rounded-lg"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clear Button */}
            <AnimatePresence>
              {url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    disabled={isLoading}
                    aria-label="Clear URL"
                    className="rounded-lg h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !url}
              aria-label={isLoading ? "Loading..." : "Fetch media info"}
              className="rounded-xl h-11 w-11"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="url-error"
            role="alert"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 text-sm text-destructive text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

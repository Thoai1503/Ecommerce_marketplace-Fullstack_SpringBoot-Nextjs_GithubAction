"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/helper/api";

const ATTRIBUTE_VALUE_API_URL = `${API_URL}/api/attribute-value`;

export class AttributeValueRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AttributeValueRequestError";
    this.status = status;
  }
}

const normalizeErrorMessage = (status: number, text: string) => {
  const message = text.trim();
  const lowerMessage = message.toLowerCase();

  if (status === 409 || lowerMessage.includes("duplicate")) {
    return "This value already exists for this attribute.";
  }

  return message || "Create failed";
};

export function useAttributeValues() {
  const [values, setValues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= GET ALL =================
  const fetchAll = async () => {
    try {
      const res = await fetch(ATTRIBUTE_VALUE_API_URL);
      const json = await res.json();
      setValues(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Fetch values error:", err);
      setValues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= CREATE =================
  const createValue = async (payload: any) => {
    const res = await fetch(ATTRIBUTE_VALUE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("CREATE VALUE:", res.status, text);

    if (!res.ok) {
      throw new AttributeValueRequestError(
        normalizeErrorMessage(res.status, text),
        res.status,
      );
    }

    await fetchAll(); // 🔥 auto refresh UI
  };

  // ================= DELETE =================
  const deleteValue = async (id: number) => {
    try {
      const res = await fetch(`${ATTRIBUTE_VALUE_API_URL}/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      console.log("DELETE VALUE:", res.status, text);

      if (!res.ok) throw new Error(text || "Delete failed");

      await fetchAll(); // 🔥 auto refresh
    } catch (err) {
      console.error("Delete value error:", err);
      throw err;
    }
  };

  return {
    values,
    isLoading,
    createValue,
    deleteValue,
  };
}

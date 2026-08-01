"use client";
import { useEffect } from "react";
import { signature } from "@/lib/signature";
export function Signature(): null {
  useEffect(() => {
    signature("EnvParity");
  }, []);
  return null;
}

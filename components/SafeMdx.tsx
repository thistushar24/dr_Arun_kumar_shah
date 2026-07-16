import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { marked } from "marked";

interface SafeMdxProps {
  source: string;
}

export async function SafeMdx({ source }: SafeMdxProps) {
  if (!source) return null;

  try {
    // Try rendering with MDXRemote (works locally and in Node runtime)
    return <MDXRemote source={source} />;
  } catch (error) {
    console.warn("MDXRemote failed in Edge Worker, falling back to marked:", error);
    // On Cloudflare Edge Workers (workerd), Function constructor/eval in next-mdx-remote
    // can throw an exception. marked cleanly converts markdown to HTML without eval.
    const html = await marked.parse(source);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

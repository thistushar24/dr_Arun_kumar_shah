"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Save,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  RefreshCw,
} from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  draft: boolean;
  image?: string;
  body: string;
}

export function AdminClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("admin@drarunshah.com.np");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Content Manager States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Editor States
  const [activeTab, setActiveTab] = useState<"list" | "editor">("list");
  const [currentPost, setCurrentPost] = useState<BlogPost>({
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "Dr. Arun Shah",
    category: "Treatments",
    draft: false,
    image: "",
    body: "",
  });
  const [editorPreview, setEditorPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    setTimeout(() => {
      if (
        email.toLowerCase() === "admin@drarunshah.com.np" &&
        (password === "admin123" || password.length > 0)
      ) {
        setIsAuthenticated(true);
        setIsLoggingIn(false);
      } else {
        setLoginError("Invalid physician credentials. Default email: admin@drarunshah.com.np");
        setIsLoggingIn(false);
      }
    }, 600);
  };

  const handleCreateNew = () => {
    const today = new Date().toISOString().split("T")[0];
    setCurrentPost({
      slug: "",
      title: "",
      date: today,
      author: "Dr. Arun Shah",
      category: "Treatments",
      draft: false,
      image: "",
      body: "Write your urology educational article here...",
    });
    setActiveTab("editor");
    setSaveMessage("");
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setActiveTab("editor");
    setSaveMessage("");
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this article? This removes the file directly.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete post: " + data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title) {
      alert("Please enter a title for the article.");
      return;
    }

    const autoSlug =
      currentPost.slug ||
      currentPost.title
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentPost,
          slug: autoSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("Article saved directly to repository!");
        await loadPosts();
        setTimeout(() => {
          setActiveTab("list");
        }, 1200);
      } else {
        alert("Error saving: " + data.error);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save article.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Physician Direct Login</h1>
            <p className="text-sm text-slate-600 mt-1">
              National Urology Center • Content Manager
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Physician Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  placeholder="admin@drarunshah.com.np"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  placeholder="Enter any password to sign in"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Direct Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
            <p className="text-xs text-slate-500">
              NMC Reg No: <span className="font-semibold text-slate-700">15706</span> • Gold Medalist
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-blue-600 font-medium">
              <Link href="/" className="hover:underline flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                View Website
              </Link>
              <span>•</span>
              <Link href="/decap" className="hover:underline">
                Decap CMS UI
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              NU
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                National Urology Center
              </h1>
              <p className="text-xs text-slate-500">
                Direct Content Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Website
            </Link>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {activeTab === "list" ? (
          <div>
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Urology Articles & Educational Posts
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage patient education articles saved directly as Markdown files.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadPosts}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPosts ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create New Article
                </button>
              </div>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {["All", "Treatments", "Conditions", "General Urology"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                      filterCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Table */}
            {isLoadingPosts ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">
                  Loading articles from repository...
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No articles found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  {searchQuery
                    ? "Try adjusting your search filter."
                    : "Create your first educational urology post."}
                </p>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  Create New Article
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="py-4 px-6">Article Title</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Author</th>
                        <th className="py-4 px-6">Publish Date</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredPosts.map((post) => (
                        <tr
                          key={post.slug}
                          className="hover:bg-slate-50/70 transition duration-150"
                        >
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-900">
                              {post.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 font-mono">
                              /blog/{post.slug}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {post.author}
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {post.date}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                post.draft
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  post.draft ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                              {post.draft ? "Draft" : "Published"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Article"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleEdit(post)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Article"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(post.slug)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Article Editor */
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setActiveTab("list")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorPreview(!editorPreview)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    editorPreview
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {editorPreview ? "Editing Mode" : "Preview Markdown"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentPost.title}
                    onChange={(e) =>
                      setCurrentPost({ ...currentPost, title: e.target.value })
                    }
                    placeholder="e.g. Laser Surgery vs Traditional Surgery: Recovery Timeline"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Slug, Category, Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={currentPost.slug}
                      onChange={(e) =>
                        setCurrentPost({ ...currentPost, slug: e.target.value })
                      }
                      placeholder="auto-generated from title"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Category
                    </label>
                    <select
                      value={currentPost.category}
                      onChange={(e) =>
                        setCurrentPost({ ...currentPost, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Treatments">Treatments</option>
                      <option value="Conditions">Conditions</option>
                      <option value="General Urology">General Urology</option>
                      <option value="Preventive Care">Preventive Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      value={currentPost.date}
                      onChange={(e) =>
                        setCurrentPost({ ...currentPost, date: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Editor Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Markdown Body Content
                    </label>
                    <span className="text-xs text-slate-400">
                      Supports standard Markdown (*bold*, # headers, - lists)
                    </span>
                  </div>

                  {editorPreview ? (
                    <div className="w-full min-h-[360px] p-6 bg-slate-50 border border-slate-200 rounded-2xl prose prose-slate max-w-none">
                      <h2 className="text-2xl font-bold mb-4">{currentPost.title}</h2>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                        {currentPost.body}
                      </pre>
                    </div>
                  ) : (
                    <textarea
                      rows={14}
                      value={currentPost.body}
                      onChange={(e) =>
                        setCurrentPost({ ...currentPost, body: e.target.value })
                      }
                      placeholder="Write comprehensive article content..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  )}
                </div>

                {/* Save Feedback */}
                {saveMessage && (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>{saveMessage}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Article...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save & Publish Article</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { Calendar, User, Clock, ArrowLeft, MessageSquare, Send, BookOpen } from "lucide-react";
import { Blog, BlogComment } from "../types";

interface BlogViewProps {
  blogs: Blog[];
  onBackToHome: () => void;
  selectedBlog: Blog | null;
  setSelectedBlog: (b: Blog | null) => void;
}

export default function BlogView({
  blogs,
  onBackToHome,
  selectedBlog,
  setSelectedBlog
}: BlogViewProps) {
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsState, setCommentsState] = useState<BlogComment[]>([]);

  const handleSelectBlog = (b: Blog) => {
    setSelectedBlog(b);
    setCommentsState(b.comments || []);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText || !selectedBlog) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/blogs/${selectedBlog.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: commentName, comment: commentText })
      });

      const data = await response.json();
      if (response.ok) {
        setCommentsState([...commentsState, data.comment]);
        setCommentText("");
      } else {
        alert(data.error || "Failed to post comment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (selectedBlog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedBlog(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog List
        </button>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-primary/5">
          <img
            src={selectedBlog.image}
            alt={selectedBlog.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Article Meta */}
        <div className="flex items-center gap-4 text-xxs font-semibold text-primary uppercase tracking-wider">
          <span className="px-2.5 py-1 bg-primary/10 rounded">{selectedBlog.category}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedBlog.date}</span>
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> By {selectedBlog.author}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedBlog.readTime}</span>
        </div>

        {/* Article Title */}
        <h1 className="font-serif-luxury text-2xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal leading-snug">
          {selectedBlog.title}
        </h1>

        {/* Article Content */}
        <div className="prose max-w-none text-xs sm:text-sm text-luxury-charcoal/80 leading-relaxed whitespace-pre-wrap space-y-4">
          {selectedBlog.content}
        </div>

        {/* Comments Section */}
        <div className="border-t border-primary/10 pt-10 space-y-6">
          <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-luxury-charcoal flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Reader Discussions ({commentsState.length})
          </h3>

          {/* List existing comments */}
          {commentsState.length > 0 ? (
            <div className="space-y-4">
              {commentsState.map((cmt) => (
                <div key={cmt.id} className="bg-white border border-primary/5 rounded-xl p-4 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between text-xxs">
                    <span className="font-bold text-luxury-charcoal">{cmt.userName}</span>
                    <span className="text-luxury-charcoal/40">{cmt.date}</span>
                  </div>
                  <p className="text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed">
                    {cmt.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xxs text-luxury-charcoal/50 italic">No comments posted yet. Start the discussion below!</p>
          )}

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="bg-luxury-beige/50 border border-primary/5 rounded-xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Share Your Comments</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Bhavneet Kaur"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-primary/10 bg-white p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Comment Thoughts</label>
              <textarea
                required
                rows={3}
                placeholder="Share your personal feedback or ask questions..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/10 bg-white p-2.5 focus:border-primary focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingComment}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Editorial Header */}
      <div className="text-center space-y-2 border-b border-primary/10 pb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest bg-primary/10 text-primary">
          <BookOpen className="h-3 w-3 fill-primary" /> StyleSleep Sleep Science
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal">The Elegant Slumber Editorial</h1>
        <p className="text-xs sm:text-sm text-luxury-charcoal/60 mt-1 max-w-lg mx-auto">Expert guides on mattress care, thread count engineering, and masterclasses to launch your home reseller boutique.</p>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((b) => (
          <div
            key={b.id}
            onClick={() => handleSelectBlog(b)}
            className="group cursor-pointer bg-white border border-primary/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            {/* Image banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-luxury-cream">
              <img
                src={b.image}
                alt={b.title}
                className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 inline-block px-2.5 py-1 bg-luxury-charcoal text-white text-xxs font-bold uppercase tracking-widest rounded shadow">
                {b.category}
              </span>
            </div>

            {/* Content area */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                
                {/* Meta details */}
                <div className="flex items-center gap-3 text-xxs text-luxury-charcoal/50 font-medium">
                  <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {b.date}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {b.readTime}</span>
                </div>

                <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-luxury-charcoal group-hover:text-primary transition-colors line-clamp-2">
                  {b.title}
                </h3>

                <p className="text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed line-clamp-2">
                  {b.excerpt}
                </p>

              </div>

              {/* Action tagline */}
              <div className="pt-3 border-t border-primary/5 flex items-center justify-between text-xxs font-bold text-primary uppercase tracking-widest group-hover:underline">
                <span>Read Full Article</span>
                <span>→</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

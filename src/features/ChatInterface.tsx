import React, { useRef, useEffect } from 'react';
import { Agent, ragSearch, useAgent } from '@blinkdotnew/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  Code2, 
  Terminal,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatInterfaceProps {
  collectionName: string;
  user: any;
}

// Define the agent outside the component
const codeAgent = new Agent({
  model: 'google/gemini-3-flash',
  system: `You are an expert Coding Assistant named CodeInsight. 

Your mission is to help developers analyze, understand, refactor, and debug their codebases.
You have access to the user's uploaded files through the rag_search tool.

CORE TASKS:
1. Always use rag_search to find relevant code snippets before answering questions about the codebase.
2. Provide clear, accurate, and concise explanations of code logic.
3. Suggest high-quality refactorings following industry best practices (SOLID, DRY, Clean Code).
4. Identify potential bugs, security vulnerabilities, or performance bottlenecks.
5. Help with architectural decisions and library recommendations.

OUTPUT STYLE:
- Use Markdown for formatting.
- Always use syntax-highlighted code blocks for code snippets.
- Be professional, technical, and helpful.
- If you cannot find the answer in the provided code, mention that and offer general advice or a web search (if available).`,
  tools: [ragSearch],
});

const ChatInterface: React.FC<ChatInterfaceProps> = ({ collectionName, user }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearMessages,
  } = useAgent({ 
    agent: codeAgent,
    onFinish: (response) => {
      console.log('Agent finished:', response.text);
    },
    onError: (error) => {
      console.error('Agent error:', error);
    }
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">CodeInsight AI</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              Reference-aware Analysis
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearMessages} className="text-muted-foreground hover:text-primary h-8">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Chat
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 selection:bg-primary/20"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
              <Code2 className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ready to analyze your code?</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ask me anything about your project. I can explain complex logic, 
                identify potential bugs, or help you refactor for better maintainability.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <SuggestionCard 
                label="Explain this logic" 
                sub="Understand complex files" 
                onClick={() => handleInputChange({ target: { value: 'Can you explain the main logic of the files I uploaded?' } } as any)}
              />
              <SuggestionCard 
                label="Refactor code" 
                sub="Improve code quality" 
                onClick={() => handleInputChange({ target: { value: 'How can I refactor the code I uploaded to be more efficient?' } } as any)}
              />
              <SuggestionCard 
                label="Find bugs" 
                sub="Identify vulnerabilities" 
                onClick={() => handleInputChange({ target: { value: 'Check my uploaded code for potential bugs or security issues.' } } as any)}
              />
              <SuggestionCard 
                label="Generate tests" 
                sub="Improve code coverage" 
                onClick={() => handleInputChange({ target: { value: 'Can you generate some unit tests for my uploaded components?' } } as any)}
              />
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
              {m.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-1 border border-primary/20 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div className={`max-w-[85%] group relative ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`
                  p-4 rounded-2xl shadow-sm border
                  ${m.role === 'user' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card text-card-foreground border-border/50'
                  }
                `}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative group/code my-4 overflow-hidden rounded-xl border border-border/50 shadow-lg">
                                <div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/50 backdrop-blur-md" onClick={() => navigator.clipboard.writeText(String(children))}>
                                    <Copy className="h-4 h-4" />
                                  </Button>
                                </div>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  className="!m-0 !bg-neutral-950 !p-4"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={`${className} bg-secondary/50 px-1 py-0.5 rounded text-primary font-mono`} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  )}
                </div>
                {/* Tool Invocations */}
                {m.parts?.some(p => p.type === 'tool-invocation') && (
                  <div className="mt-3 space-y-2">
                    {m.parts.filter(p => p.type === 'tool-invocation').map((part: any, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/50 text-[10px] text-muted-foreground animate-in">
                        <Terminal className="w-3 h-3 text-primary" />
                        <span className="font-mono">Running {part.toolName}...</span>
                        {part.state === 'result' && <span className="text-accent ml-auto">Completed</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground mt-1 border border-border shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4 justify-start animate-in">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-1 border border-primary/20 shadow-sm animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-6 border-t bg-background/50 backdrop-blur">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="max-w-4xl mx-auto relative group"
        >
          <div className="relative flex items-center">
            <Input 
              placeholder="Ask a question about your code..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pr-14 h-14 rounded-2xl bg-card border-border/60 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm group-focus-within:shadow-primary/5"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            CodeInsight can make mistakes. Consider checking important information.
          </p>
        </form>
      </footer>
    </div>
  );
};

const SuggestionCard = ({ label, sub, onClick }: { label: string, sub: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-start p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 text-left transition-all group active:scale-95"
  >
    <span className="text-sm font-bold group-hover:text-primary transition-colors">{label}</span>
    <span className="text-[10px] text-muted-foreground">{sub}</span>
  </button>
);

export default ChatInterface;

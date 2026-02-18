import React, { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { getOrCreateCollection, ingestFiles } from '../lib/rag';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  FileCode, 
  Upload, 
  Plus, 
  Trash2, 
  Settings, 
  LogOut,
  ChevronRight,
  Code2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatInterface from '../features/ChatInterface';
import { Progress } from '../components/ui/progress';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    const initRAG = async () => {
      try {
        const name = await getOrCreateCollection(user.id);
        setCollectionName(name);
        fetchDocuments(name);
      } catch (error) {
        console.error('Failed to init RAG:', error);
        toast.error('Failed to initialize knowledge base.');
      }
    };
    initRAG();
  }, [user.id]);

  const fetchDocuments = async (name: string) => {
    setIsLoadingDocs(true);
    try {
      const docs = await blink.rag.listDocuments({ collectionName: name });
      setDocuments(docs || []);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !collectionName) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await ingestFiles(Array.from(files), user.id, collectionName, (msg, progress) => {
        setUploadStatus(msg);
        setUploadProgress(progress);
      });
      toast.success(`${files.length} files indexed successfully!`);
      fetchDocuments(collectionName);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      setUploadProgress(0);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await blink.rag.deleteDocument(docId);
      toast.success('Document deleted');
      if (collectionName) fetchDocuments(collectionName);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside className="hidden lg:flex w-80 border-r flex-col bg-secondary/20 shrink-0">
        <div className="h-16 border-b flex items-center px-6 shrink-0 bg-background/50 backdrop-blur">
          <Code2 className="w-6 h-6 text-primary mr-2" />
          <h1 className="font-bold text-lg tracking-tight">CodeInsight</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* File Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Knowledge Base</h2>
              <label className="cursor-pointer">
                <Input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={handleFileUpload} 
                  disabled={isUploading} 
                />
                <div className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
              </label>
            </div>

            {isUploading && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">Uploading...</span>
                  <span className="text-xs font-medium text-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5 mb-2" />
                <p className="text-[10px] text-muted-foreground truncate">{uploadStatus}</p>
              </div>
            )}

            <div className="space-y-1">
              {isLoadingDocs ? (
                <div className="py-4 text-center text-sm text-muted-foreground animate-pulse">
                  Loading references...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border/50 bg-background/50">
                  <FileCode className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
                  <Button variant="link" size="sm" className="mt-2 text-xs" onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Upload code files
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate font-medium">{doc.filename}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleDeleteDoc(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t bg-background/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user.displayName || 'Developer'}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => blink.auth.logout()} className="text-muted-foreground hover:text-primary">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full">
        {collectionName ? (
          <ChatInterface collectionName={collectionName} user={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 animate-pulse">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Setting up your workspace</h3>
              <p className="text-muted-foreground text-sm">
                We're preparing your personal RAG engine for high-performance code analysis. This only takes a moment.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

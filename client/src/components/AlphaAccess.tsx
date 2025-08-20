import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Users, Activity } from 'lucide-react';

interface AlphaAccessProps {
  onAccess: (testerData: any) => void;
  currentTester?: any;
}

export function AlphaAccess({ onAccess, currentTester }: AlphaAccessProps) {
  const [accessKey, setAccessKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'key' | 'admin'>('key');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let requestBody: any = {};
    
    if (loginMode === 'admin') {
      if (!username.trim() || !password.trim()) {
        toast({
          title: "Credentials Required",
          description: "Please enter both username and password",
          variant: "destructive"
        });
        return;
      }
      requestBody = { username: username.trim(), password: password.trim() };
    } else {
      if (!accessKey.trim()) {
        toast({
          title: "Access Key Required",
          description: "Please enter your alpha testing access key",
          variant: "destructive"
        });
        return;
      }
      requestBody = { accessKey: accessKey.trim() };
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/alpha/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        const welcomeTitle = data.tester.isAdmin ? "Welcome Admin! 👑" : "Welcome Alpha Tester! 🤘";
        const welcomeDesc = data.tester.isAdmin 
          ? `Hello ${data.tester.name}! You have full admin access to MoshUnion Alpha.`
          : `Hello ${data.tester.name}! You now have access to MoshUnion Alpha.`;
        
        toast({
          title: welcomeTitle,
          description: welcomeDesc,
        });
        onAccess(data.tester);
      } else {
        const errorTitle = loginMode === 'admin' ? "Invalid Admin Credentials" : "Invalid Access Key";
        const errorDesc = loginMode === 'admin' 
          ? "Please check your username and password."
          : "Please check your alpha testing key and try again.";
        
        toast({
          title: errorTitle,
          description: data.error || errorDesc,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to validate access key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentTester) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-red-900/20 to-yellow-900/20 border-red-500/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-400" />
            <Badge variant="outline" className={currentTester.isAdmin 
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" 
              : "bg-red-500/20 text-red-300 border-red-500/50"
            }>
              {currentTester.isAdmin ? "ADMIN" : "ALPHA TESTER"}
            </Badge>
          </div>
          <CardTitle className="text-red-300">Alpha Access Active</CardTitle>
          <CardDescription className="text-gray-300">
            Welcome back, {currentTester.name}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300">Sessions: {currentTester.sessionsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400" />
              <span className="text-gray-300">Features: {currentTester.featuresUsed || 0}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-center">
            Access Key: {currentTester.accessKey}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-black border-red-500/30">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-red-400" />
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
            ALPHA TESTING
          </Badge>
        </div>
        <CardTitle className="text-red-300">MoshUnion Alpha Access</CardTitle>
        <CardDescription className="text-gray-300">
          Enter your alpha testing key to access the app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMode('key')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                loginMode === 'key' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Access Key
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('admin')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                loginMode === 'admin' 
                  ? 'bg-yellow-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin Login
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMode === 'key' ? (
            <div className="space-y-2">
              <Input
                data-testid="input-alpha-access-key"
                type="text"
                placeholder="METAL-ALPHA-XXX"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                disabled={loading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                data-testid="input-admin-username"
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                disabled={loading}
              />
              <Input
                data-testid="input-admin-password"
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                disabled={loading}
              />
            </div>
          )}
          <Button 
            data-testid="button-submit-alpha-key"
            type="submit" 
            className={`w-full text-white ${
              loginMode === 'admin'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Validating...' : (loginMode === 'admin' ? 'Admin Login' : 'Access Alpha Testing')}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-400 mb-2">For Alpha Testers:</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            To provide feedback of any kind please e-mail{' '}
            <a 
              href="mailto:durantoss.moshunion@gmail.com" 
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              durantoss.moshunion@gmail.com
            </a>
            {' '}. Please state in the subject line the level of urgency and then provide as much detail as possible. Thanks everyone! Let's melt some faces off!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      stagename: '',
      safeword: '',
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onSuccess?.();
      console.log('Login successful:', data);
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="login-form">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-red-500">
          Enter The Pit
        </CardTitle>
        <CardDescription className="text-gray-400">
          Sign in with your MoshUnion credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" data-testid="login-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stagename" className="text-white">
              Stagename
            </Label>
            <Input
              id="stagename"
              type="text"
              placeholder="Enter your stagename"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              data-testid="input-stagename"
              {...form.register('stagename')}
            />
            {form.formState.errors.stagename && (
              <p className="text-red-400 text-sm" data-testid="error-stagename">
                {form.formState.errors.stagename.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="safeword" className="text-white">
              Safeword
            </Label>
            <div className="relative">
              <Input
                id="safeword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your safeword"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10"
                data-testid="input-safeword"
                {...form.register('safeword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.safeword && (
              <p className="text-red-400 text-sm" data-testid="error-safeword">
                {form.formState.errors.safeword.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={form.watch('rememberMe')}
              onCheckedChange={(checked) => form.setValue('rememberMe', !!checked)}
              className="border-gray-600 data-[state=checked]:bg-red-500"
              data-testid="checkbox-remember-me"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-gray-300 cursor-pointer"
            >
              Keep me logged in (90 days)
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entering...
              </>
            ) : (
              'Enter The Pit'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            New to the metal scene?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-red-400 hover:text-red-300 underline"
              data-testid="link-switch-to-register"
            >
              Join the Union
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
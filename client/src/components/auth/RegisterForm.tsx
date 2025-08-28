import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUser } from '@shared/schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { cn } from '../../lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      stagename: '',
      safeword: '',
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  const stagename = form.watch('stagename');

  // Check stagename availability
  const { data: stagenameAvailability, isLoading: checkingAvailability } = useQuery({
    queryKey: ['/api/auth/check-stagename', stagename],
    enabled: stagename.length >= 3,
    staleTime: 1000,
  });
  
  const isAvailable = stagenameAvailability?.available;

  const registerMutation = useMutation({
    mutationFn: async (data: CreateUser) => {
      return apiRequest('/api/auth/register', {
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
      console.log('Registration successful:', data);
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      if (error.message.includes('stagename')) {
        form.setError('stagename', { message: 'This stagename is already taken' });
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    },
  });

  const onSubmit = (data: CreateUser) => {
    setError('');
    
    if (stagenameAvailability && !stagenameAvailability.available) {
      form.setError('stagename', { message: 'This stagename is already taken' });
      return;
    }
    
    registerMutation.mutate(data);
  };

  const getStagenameStatus = () => {
    if (!stagename || stagename.length < 3) return null;
    if (checkingAvailability) return 'checking';
    if (stagenameAvailability?.available) return 'available';
    return 'taken';
  };

  const stagenameStatus = getStagenameStatus();

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="register-form">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-red-500">
          Join The Union
        </CardTitle>
        <CardDescription className="text-gray-400">
          Create your MoshUnion metalhead profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" data-testid="register-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                data-testid="input-first-name"
                {...form.register('firstName')}
              />
              {form.formState.errors.firstName && (
                <p className="text-red-400 text-sm" data-testid="error-first-name">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                data-testid="input-last-name"
                {...form.register('lastName')}
              />
              {form.formState.errors.lastName && (
                <p className="text-red-400 text-sm" data-testid="error-last-name">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              data-testid="input-email"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-red-400 text-sm" data-testid="error-email">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stagename" className="text-white">
              Stagename *
            </Label>
            <div className="relative">
              <Input
                id="stagename"
                type="text"
                placeholder="Choose your metal stagename"
                className={cn(
                  "bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10",
                  stagenameStatus === 'available' && "border-green-500",
                  stagenameStatus === 'taken' && "border-red-500"
                )}
                data-testid="input-stagename"
                {...form.register('stagename')}
              />
              {stagenameStatus && (
                <div className="absolute right-0 top-0 h-full flex items-center px-3">
                  {stagenameStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {stagenameStatus === 'available' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {stagenameStatus === 'taken' && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {form.formState.errors.stagename && (
              <p className="text-red-400 text-sm" data-testid="error-stagename">
                {form.formState.errors.stagename.message}
              </p>
            )}
            {stagenameStatus === 'available' && (
              <p className="text-green-400 text-sm" data-testid="stagename-available">
                Stagename is available!
              </p>
            )}
            {stagenameStatus === 'taken' && (
              <p className="text-red-400 text-sm" data-testid="stagename-taken">
                This stagename is already taken
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="safeword" className="text-white">
              Safeword *
            </Label>
            <div className="relative">
              <Input
                id="safeword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a secure safeword"
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
            <p className="text-gray-400 text-xs">
              Minimum 6 characters. Keep it secure!
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={registerMutation.isPending || stagenameStatus === 'taken'}
            data-testid="button-register"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join The Union'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Already a metalhead?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-red-400 hover:text-red-300 underline"
              data-testid="link-switch-to-login"
            >
              Enter The Pit
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
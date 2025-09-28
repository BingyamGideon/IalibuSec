import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, completeRegistration, loading, isAuthenticated, currentUser } = useAuth();

  // Authentication state
  const [isLogin, setIsLogin] = useState(true);
  const [isActivation, setIsActivation] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    userType: 'staff' as 'admin' | 'staff'
  });
  const [activationForm, setActivationForm] = useState({
    username: '',
    token: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.userType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isActivation) {
        if (!activationForm.username || !activationForm.token || activationForm.password.length < 6) {
          toast({ title: 'Activation failed', description: 'Provide username, registration code, and a valid password (6+ chars).', variant: 'destructive' });
          return;
        }
        const res = await completeRegistration(activationForm.username, activationForm.token, activationForm.password);
        if (res.success) {
          toast({ title: 'Account activated', description: 'You can now log in with your password.' });
          setIsActivation(false);
          setIsLogin(true);
          setLoginForm(prev => ({ ...prev, username: activationForm.username, password: '' }));
          setActivationForm({ username: '', token: '', password: '' });
        } else {
          toast({ title: 'Activation failed', description: res.message, variant: 'destructive' });
        }
        return;
      }

      if (isLogin) {
        const result = await login({
          username: loginForm.username,
          password: loginForm.password
        });

        if (result.success && result.user) {
          toast({
            title: 'Login successful',
            description: `Welcome back, ${result.user.firstName} ${result.user.lastName}!`
          });
        } else {
          const msg = result.message || '';
          if (msg.toLowerCase().includes('complete registration') || msg.toLowerCase().includes('not activated')) {
            setIsActivation(true);
            setIsLogin(false);
            setActivationForm(prev => ({ ...prev, username: loginForm.username }));
            toast({ title: 'Activation required', description: 'Enter your registration code to set your password.' });
          } else {
            toast({ title: 'Login failed', description: msg, variant: 'destructive' });
          }
        }
      } else {
        // Registration (self-signup)
        if (!loginForm.firstName.trim() || !loginForm.lastName.trim()) {
          toast({ title: 'Registration failed', description: 'First name and last name are required', variant: 'destructive' });
          return;
        }
        if (!loginForm.email.trim() || !loginForm.email.includes('@')) {
          toast({ title: 'Registration failed', description: 'Please enter a valid email address', variant: 'destructive' });
          return;
        }

        const result = await register({
          username: loginForm.username,
          password: loginForm.password,
          confirmPassword: loginForm.confirmPassword,
          email: loginForm.email,
          firstName: loginForm.firstName,
          lastName: loginForm.lastName,
          userType: loginForm.userType,
          department: loginForm.department,
          position: loginForm.position
        });

        if (result.success) {
          toast({ title: 'Registration successful', description: 'You can now login with your credentials!' });
          setIsLogin(true);
          setIsActivation(false);
          setLoginForm({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            firstName: '',
            lastName: '',
            department: '',
            position: '',
            userType: 'staff'
          });
        } else {
          toast({ title: 'Registration failed', description: result.message, variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Ialibu Secondary School</h1>
          <h2 className="text-xl font-semibold mb-4">Student & Staff Information System</h2>
          <p className="text-blue-100 leading-relaxed mb-6">
            Welcome to our comprehensive student information system. Manage students, track attendance, 
            monitor grades, and handle financial records efficiently.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Admin Access:</h3>
            <p className="text-sm text-blue-100">
              • Students, Attendance, Grades<br/>
              • Finance Management<br/>
              • Staff Administration<br/>
              • Comprehensive Reports
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Staff Access:</h3>
            <p className="text-sm text-blue-100">
              • Students (assigned classes)<br/>
              • Attendance Tracking<br/>
              • Grade Management<br/>
              • Student Reports
            </p>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isActivation ? 'Activate Account' : isLogin ? 'School Login' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isActivation
                ? 'Enter your registration code provided by the admin to set your password'
                : isLogin
                  ? 'Sign in to access your dashboard'
                  : 'Fill in your details to register'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isActivation ? (
              <>
                <div>
                  <Label htmlFor="act-username">Username</Label>
                  <Input
                    id="act-username"
                    type="text"
                    value={activationForm.username}
                    onChange={(e) => setActivationForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Your username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="act-token">Registration Code</Label>
                  <Input
                    id="act-token"
                    type="text"
                    value={activationForm.token}
                    onChange={(e) => setActivationForm(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Enter the code from admin"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="act-password">New Password</Label>
                  <Input
                    id="act-password"
                    type="password"
                    value={activationForm.password}
                    onChange={(e) => setActivationForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                  disabled={isSubmitting || loading}
                >
                  {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate Account
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={loginForm.firstName}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={loginForm.lastName}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={loginForm.confirmPassword}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          type="text"
                          value={loginForm.department}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="Department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          type="text"
                          value={loginForm.position}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Position"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="userType">User Type</Label>
                      <Select
                        value={loginForm.userType}
                        onValueChange={(value: 'admin' | 'staff') => setLoginForm(prev => ({ ...prev, userType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff Member</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                  disabled={isSubmitting || loading}
                >
                  {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? 'Login' : 'Register'}
                </Button>
              </>
            )}
          </form>

          <div className="text-center mt-6">
            {!isActivation && (
              <>
                <span className="text-gray-600">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLoginForm({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      email: '',
                      firstName: '',
                      lastName: '',
                      department: '',
                      position: '',
                      userType: 'staff'
                    });
                  }}
                  className="ml-2 text-blue-900 font-semibold hover:underline"
                  disabled={isSubmitting || loading}
                >
                  {isLogin ? 'Register here' : 'Login here'}
                </button>
              </>
            )}
            <div className="mt-3">
              <button
                onClick={() => {
                  setIsActivation(!isActivation);
                  setIsLogin(isActivation ? true : false);
                }}
                className="text-blue-900 font-semibold hover:underline"
                disabled={isSubmitting || loading}
              >
                {isActivation ? 'Back to Login' : 'Have a registration code? Activate account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

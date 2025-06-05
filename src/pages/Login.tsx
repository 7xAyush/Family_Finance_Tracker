import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function Login() {
  const { login, register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      const success = await registerUser(data.email, data.password, data.name);
      if (success) {
        toast.success("Account created successfully!");
      } else {
        toast.error("Email already exists");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">
              <DollarSign className="logo" />
            </div>
            <h1 className="app-title">ExpenseTracker</h1>
          </div>
          <p className="app-subtitle">
            Take control of your household finances with smart expense tracking
            and bank matching
          </p>
        </div>

        <Card className="auth-card">
          <Tabs defaultValue="login" className="auth-tabs">
            <TabsList className="auth-tabs-list">
              <TabsTrigger value="login" className="auth-tab">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="auth-tab">
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="auth-header">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue managing your finances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="auth-form"
                >
                  <div className="form-field">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="error-message">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="password-input-wrapper">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="password-icon" />
                        ) : (
                          <Eye className="password-icon" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="error-message">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="auth-submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="demo-account">
                  <p className="demo-text">
                    Demo Account: Use any email/password combination to create a
                    new account
                  </p>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader className="auth-header">
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Start tracking your expenses and managing your finances today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="auth-form"
                >
                  <div className="form-field">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      {...registerForm.register("name")}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="error-message">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="error-message">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="password-input-wrapper">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a password"
                        {...registerForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="password-icon" />
                        ) : (
                          <Eye className="password-icon" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="error-message">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <Label htmlFor="register-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="password-input-wrapper">
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...registerForm.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="password-icon" />
                        ) : (
                          <Eye className="password-icon" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="error-message">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="auth-submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

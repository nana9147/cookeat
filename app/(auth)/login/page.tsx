import AuthCard from '@/components/(auth)/login/AuthCard';
import LoginForm from '@/components/(auth)/login/LoginForm';

export default function LoginPage() {
  return (
    <AuthCard activeTab="login">
      <LoginForm />
    </AuthCard>
  );
}

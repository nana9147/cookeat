import AuthCard from '@/components/(auth)/AuthCard';
import LoginForm from '@/components/(auth)/LoginForm';

export default function LoginPage() {
  return (
    <AuthCard activeTab="login">
      <LoginForm />
    </AuthCard>
  );
}

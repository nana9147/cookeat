import AuthCard from '@/components/(auth)/AuthCard';
import RegisterForm from '@/components/(auth)/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthCard activeTab="register">
      <RegisterForm />
    </AuthCard>
  );
}

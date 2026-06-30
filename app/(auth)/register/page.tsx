import AuthCard from '@/components/(auth)/login/AuthCard';
import RegisterForm from '@/components/(auth)/login/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthCard activeTab="register">
      <RegisterForm />
    </AuthCard>
  );
}

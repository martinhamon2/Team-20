import Container from "@/components/layout/Container";
import LoginForm from "@/components/users/LoginForm";

export default function Home() {
  return (
    <Container className="flex h-[50vh] items-center justify-center">
      <LoginForm />
    </Container>
  );
}
